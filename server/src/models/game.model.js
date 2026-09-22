const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    shortTitle: { type: String, trim: true },
    releaseDate: Date,
    platforms: [{ type: String, trim: true }],
    coverImage: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Game", gameSchema);
