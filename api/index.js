// Vercel serverless entry: every /api/* request is rewritten here (see vercel.json).
const app = require("../server/src/app");
const connectDB = require("../server/src/config/db");
const seedWildsLocations = require("../server/src/scripts/seedWildsLocations");

let locationsSeedPromise;

module.exports = async (req, res) => {
  // OIDC-connected Blob stores: make the per-request token visible to the SDK.
  const oidcToken = req.headers["x-vercel-oidc-token"];
  if (oidcToken) process.env.VERCEL_OIDC_TOKEN = oidcToken;

  try {
    await connectDB();
    // Seed once per warm serverless instance; the upserts make retries safe.
    if (!locationsSeedPromise) locationsSeedPromise = seedWildsLocations();
    await locationsSeedPromise;
  } catch (error) {
    locationsSeedPromise = null;
    console.error("Database initialization failed:", error.message);
    return res.status(503).json({ message: `Database initialization failed: ${error.message}` });
  }
  return app(req, res);
};
