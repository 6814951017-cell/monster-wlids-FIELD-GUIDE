const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema(
  {
    game: { type: mongoose.Schema.Types.ObjectId, ref: "Game", index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    type: { type: String, enum: ["locale", "hub", "camp", "arena"], default: "locale" },
    description: String,
    mapImage: String,
    areas: [{ number: Number, name: String, notes: String }],
  },
  { timestamps: true }
);

locationSchema.index({ game: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model("Location", locationSchema);
