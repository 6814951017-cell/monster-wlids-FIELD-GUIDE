const mongoose = require("mongoose");

const armorPieceSchema = new mongoose.Schema(
  {
    part: { type: String, enum: ["head", "chest", "arms", "waist", "legs"], required: true },
    name: { type: String, required: true, trim: true },
    defense: { type: Number, required: true, min: 0 },
    slots: [{ type: Number, min: 1, max: 4 }],
    skills: [{ skill: { type: mongoose.Schema.Types.ObjectId, ref: "Skill" }, level: { type: Number, min: 1 } }],
    materials: [{ item: { type: mongoose.Schema.Types.ObjectId, ref: "Item" }, quantity: { type: Number, min: 1 } }],
  },
  { _id: false }
);

const armorSchema = new mongoose.Schema(
  {
    game: { type: mongoose.Schema.Types.ObjectId, ref: "Game", index: true },
    setName: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    rank: { type: String, enum: ["low", "high", "master"], required: true },
    rarity: { type: Number, min: 1, max: 12 },
    pieces: [armorPieceSchema],
    setBonus: { name: String, requiredPieces: Number, description: String },
    image: String,
  },
  { timestamps: true }
);

armorSchema.index({ game: 1, slug: 1 }, { unique: true });
armorSchema.index({ game: 1, rank: 1, rarity: 1 });

module.exports = mongoose.model("Armor", armorSchema);
