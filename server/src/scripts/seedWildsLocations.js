const Game = require("../models/game.model");
const Location = require("../models/location.model");

const wildsLocations = [
  { name: "Windward Plains", slug: "windward-plains" },
  { name: "Scarlet Forest", slug: "scarlet-forest" },
  { name: "Oilwell Basin", slug: "oilwell-basin" },
  { name: "Iceshard Cliffs", slug: "iceshard-cliffs" },
  { name: "Ruins of Wyveria", slug: "ruins-of-wyveria" },
];

async function seedWildsLocations() {
  const game = await Game.findOneAndUpdate(
    { slug: "monster-hunter-wilds" },
    { $setOnInsert: { title: "Monster Hunter Wilds", slug: "monster-hunter-wilds" } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await Promise.all(wildsLocations.map(({ name, slug }) => Location.updateOne(
    { game: game._id, slug },
    { $setOnInsert: { game: game._id, name, slug, type: "locale" } },
    { upsert: true }
  )));

  console.log(`Ensured ${wildsLocations.length} Monster Hunter Wilds locations`);
}

module.exports = seedWildsLocations;
