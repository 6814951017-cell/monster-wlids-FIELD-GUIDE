const crypto = require("crypto");
const path = require("path");
const blob = require("@vercel/blob");

// Files never pass through the API: a Vercel function request is capped at
// 4.5 MB and its disk is read-only. The browser asks for a signed URL, PUTs the
// file straight into Vercel Blob, then asks the API to confirm it.

const MB = 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

// One folder per resource that stores an image URL.
const UPLOAD_RULES = {
  monsters: { allowed: IMAGE_TYPES, maxBytes: 10 * MB },
  weapons: { allowed: IMAGE_TYPES, maxBytes: 10 * MB },
  armors: { allowed: IMAGE_TYPES, maxBytes: 10 * MB },
  items: { allowed: IMAGE_TYPES, maxBytes: 10 * MB },
};

const httpError = (status, message) => Object.assign(new Error(message), { status });

// Newer Blob connections add BLOB_STORE_ID (OIDC); older ones BLOB_READ_WRITE_TOKEN.
const blobConfigured = () => Boolean(process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN);

const assertBlobConfigured = () => {
  if (blobConfigured()) return;
  throw httpError(500, "File storage is not configured: neither BLOB_STORE_ID nor BLOB_READ_WRITE_TOKEN is set. " +
    "Connect a Blob store to this Vercel project (Storage tab), then redeploy.");
};

const ruleFor = (folder) => (Object.hasOwn(UPLOAD_RULES, folder) ? UPLOAD_RULES[folder] : null);

// POST /api/uploads { folder, name, type } → { pathname, uploadUrl }
const presignUpload = async (req, res, next) => {
  try {
    const { folder, name = "", type = "" } = req.body || {};
    const rule = ruleFor(folder);
    if (!rule) throw httpError(400, `Uploads are not accepted into "${folder}"`);
    if (!rule.allowed.includes(type)) throw httpError(400, `Unsupported image type: ${type || "unknown"}`);
    assertBlobConfigured();

    // The server picks the pathname, so a client cannot overwrite other files.
    const ext = path.extname(String(name)).toLowerCase().replace(/[^a-z0-9.]/g, "").slice(0, 10);
    const pathname = `${folder}/${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;
    const limits = { allowedContentTypes: rule.allowed, maximumSizeInBytes: rule.maxBytes };

    const token = await blob.issueSignedToken({
      pathname, operations: ["put"], validUntil: Date.now() + 15 * 60 * 1000, ...limits,
    });
    const { presignedUrl } = await blob.presignUrl(token, {
      operation: "put", pathname, access: "public", ...limits, addRandomSuffix: false, allowOverwrite: false,
    });
    res.json({ pathname, uploadUrl: presignedUrl });
  } catch (error) {
    next(error);
  }
};

// POST /api/uploads/complete { pathname } → { url }
// Trust the store's size and type, not the browser's; delete anything that breaks the rules.
const completeUpload = async (req, res, next) => {
  try {
    assertBlobConfigured();
    const pathname = String(req.body?.pathname || "");
    const rule = ruleFor(pathname.split("/")[0]);
    if (!rule) throw httpError(400, "That file was not uploaded through this site");

    let stored;
    try { stored = await blob.head(pathname); } catch { throw httpError(400, "The uploaded file could not be found in storage"); }

    if (!rule.allowed.includes(stored.contentType) || stored.size > rule.maxBytes) {
      await blob.del(stored.url).catch(() => {});
      throw httpError(400, "The uploaded file is not an allowed image or is too large");
    }
    res.status(201).json({ url: stored.url, size: stored.size, contentType: stored.contentType });
  } catch (error) {
    next(error);
  }
};

// Delete a file this app stored in Blob. URLs pasted from elsewhere are left alone.
const removeStoredFile = async (url) => {
  if (!url || !blobConfigured()) return;
  try {
    if (!new URL(url).hostname.endsWith(".blob.vercel-storage.com")) return;
    await blob.del(url);
  } catch (error) {
    console.error("Failed to remove stored file:", error.message);
  }
};

module.exports = { UPLOAD_RULES, blobConfigured, presignUpload, completeUpload, removeStoredFile };
