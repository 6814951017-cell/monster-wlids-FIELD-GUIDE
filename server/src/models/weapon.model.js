const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema(
  { item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true }, quantity: { type: Number, required: true, min: 1 } },
  { _id: false }
);

const weaponSchema = new mongoose.Schema(
  {
    game: { type: mongoose.Schema.Types.ObjectId, ref: "Game", index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    weaponType: { type: String, enum: ["great-sword", "long-sword", "sword-and-shield", "dual-blades", "hammer", "hunting-horn", "lance", "gunlance", "switch-axe", "charge-blade", "insect-glaive", "light-bowgun", "heavy-bowgun", "bow"], required: true },
    rarity: { type: Number, min: 1, max: 12 },
    attack: { type: Number, required: true, min: 0 },
    affinity: { type: Number, default: 0, min: -100, max: 100 },
    element: { name: { type: String, enum: ["fire", "water", "thunder", "ice", "dragon", "poison", "paralysis", "sleep", "blast", "none"] }, value: Number, hidden: Boolean },
    slots: [{ type: Number, min: 1, max: 4 }],
    parentWeapon: { type: mongoose.Schema.Types.ObjectId, ref: "Weapon" },
    materials: [materialSchema],
    image: String,
  },
  { timestamps: true }
);

weaponSchema.index({ game: 1, slug: 1 }, { unique: true });
weaponSchema.index({ game: 1, weaponType: 1, rarity: 1 });

module.exports = mongoose.model("Weapon", weaponSchema);
