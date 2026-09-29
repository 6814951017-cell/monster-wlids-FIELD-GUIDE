require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const seedWildsLocations = require("./scripts/seedWildsLocations");
const PORT = process.env.PORT || 5000;

if (require.main === module) {
  connectDB().then(() => {
    seedWildsLocations()
      .then(() => app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`)))
      .catch((error) => {
        console.error("Failed to seed Monster Hunter Wilds locations:", error.message);
        process.exit(1);
      });
  });
}

module.exports = app;
