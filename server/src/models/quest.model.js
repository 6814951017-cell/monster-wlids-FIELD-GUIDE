const mongoose = require("mongoose");

const targetSchema = new mongoose.Schema(
  { monster: { type: mongoose.Schema.Types.ObjectId, ref: "Monster", required: true }, quantity: { type: Number, default: 1, min: 1 }, objective: String },
  { _id: false }
);

const questSchema = new mongoose.Schema(
  {
    game: { type: mongoose.Schema.Types.ObjectId, ref: "Game", index: true },
    questCode: { type: String, trim: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    questType: { type: String, enum: ["assigned", "optional", "event", "investigation", "arena", "expedition"], required: true },
    rank: { type: String, enum: ["low", "high", "master"], required: true },
    stars: { type: Number, min: 1, max: 10 },
    location: { type: mongoose.Schema.Types.ObjectId, ref: "Location" },
    targets: [targetSchema],
    timeLimitMinutes: { type: Number, min: 1 },
    rewardZenny: { type: Number, min: 0 },
    rewards: [{ item: { type: mongoose.Schema.Types.ObjectId, ref: "Item" }, quantity: { type: Number, min: 1 }, chance: Number }],
  },
  { timestamps: true }
);

questSchema.index({ game: 1, slug: 1 }, { unique: true });
questSchema.index({ game: 1, rank: 1, questType: 1, stars: 1 });

module.exports = mongoose.model("Quest", questSchema);
