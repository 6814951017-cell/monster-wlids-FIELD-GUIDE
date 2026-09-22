const mongoose = require("mongoose");
const app = require("../server/src/app");
const connectDB = require("../server/src/config/db");

let connected = false;

const ensureDb = async () => {
  if (connected || mongoose.connection.readyState === 1) {
    connected = true;
    return;
  }
  await connectDB();
  connected = true;
};

module.exports = async (req, res) => {
  await ensureDb();
  return app(req, res);
};
