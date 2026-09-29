// Vercel serverless entry: every /api/* request is rewritten here (see vercel.json).
const app = require("../server/src/app");
const connectDB = require("../server/src/config/db");

module.exports = async (req, res) => {
  // OIDC-connected Blob stores: make the per-request token visible to the SDK.
  const oidcToken = req.headers["x-vercel-oidc-token"];
  if (oidcToken) process.env.VERCEL_OIDC_TOKEN = oidcToken;

  try {
    await connectDB();
  } catch (error) {
    console.error("Database unavailable:", error.message);
    return res.status(503).json({ message: `Database unavailable: ${error.message}` });
  }

  // The Vercel rewrite sends every API request through this single function.
  // Restore the original Express path from the rewrite query parameter.
  const rewrittenUrl = new URL(req.url, "http://vercel.local");
  const apiPath = rewrittenUrl.searchParams.get("__apiPath") ?? req.query?.__apiPath;
  if (apiPath !== null && apiPath !== undefined) {
    rewrittenUrl.searchParams.delete("__apiPath");
    for (const [key, value] of Object.entries(req.query || {})) {
      if (key === "__apiPath" || rewrittenUrl.searchParams.has(key)) continue;
      for (const item of Array.isArray(value) ? value : [value]) {
        if (item !== undefined && item !== null) rewrittenUrl.searchParams.append(key, String(item));
      }
    }
    const query = rewrittenUrl.searchParams.toString();
    req.url = `/api/${apiPath}${query ? `?${query}` : ""}`;
  }

  return app(req, res);
};
