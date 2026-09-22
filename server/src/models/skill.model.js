const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema(
  {
    game: { type: mongoose.Schema.Types.ObjectId, ref: "Game", index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    category: { type: String, enum: ["armor", "set-bonus", "rampage", "other"], default: "armor" },
    maxLevel: { type: Number, required: true, min: 1 },
    levels: [{ level: { type: Number, min: 1 }, description: String }],
  },
  { timestamps: true }
);

skillSchema.index({ game: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model("Skill", skillSchema);
