const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    game: { type: mongoose.Schema.Types.ObjectId, ref: "Game", index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    category: { type: String, enum: ["material", "consumable", "ammo", "decoration", "account"], required: true },
    rarity: { type: Number, min: 1, max: 12 },
    description: String,
    icon: String,
    sellPrice: { type: Number, min: 0 },
  },
  { timestamps: true }
);

itemSchema.index({ game: 1, slug: 1 }, { unique: true });
itemSchema.index({ game: 1, category: 1, name: 1 });

module.exports = mongoose.model("Item", itemSchema);
