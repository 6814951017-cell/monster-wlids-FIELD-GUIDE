require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const PORT = process.env.PORT || 5000;

if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  }).catch((error) => {
    console.error("Server could not start because MongoDB is unavailable:", error.message);
    process.exit(1);
  });
}

module.exports = app;
