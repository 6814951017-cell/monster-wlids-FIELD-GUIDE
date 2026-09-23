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
  return app(req, res);
};
