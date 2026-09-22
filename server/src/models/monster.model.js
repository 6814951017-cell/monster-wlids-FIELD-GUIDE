const mongoose = require("mongoose");

const resistanceSchema = new mongoose.Schema(
  {
    element: { type: String, enum: ["fire", "water", "thunder", "ice", "dragon"] },
    value: { type: Number, min: -3, max: 3 },
  },
  { _id: false }
);

const monsterSchema = new mongoose.Schema(
  {
    game: { type: mongoose.Schema.Types.ObjectId, ref: "Game", index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    species: { type: String, trim: true },
    classification: { type: String, enum: ["small", "large"], required: true },
    threatLevel: { type: Number, min: 1, max: 10 },
    description: String,
    image: String,
    habitats: [{ type: mongoose.Schema.Types.ObjectId, ref: "Location" }],
    elements: [{ type: String, enum: ["fire", "water", "thunder", "ice", "dragon", "none"] }],
    weaknesses: [resistanceSchema],
    ailments: [resistanceSchema],
    breakableParts: [{ name: String, rewardNotes: String }],
    rewards: [{ item: { type: mongoose.Schema.Types.ObjectId, ref: "Item" }, rank: { type: String, enum: ["low", "high", "master"] }, source: String, chance: Number }],
  },
  { timestamps: true }
);

monsterSchema.index({ game: 1, slug: 1 }, { unique: true });
monsterSchema.index({ game: 1, classification: 1, species: 1 });

module.exports = mongoose.model("Monster", monsterSchema);
