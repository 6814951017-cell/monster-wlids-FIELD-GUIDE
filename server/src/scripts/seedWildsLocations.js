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
  let game;
  try {
    game = await Game.findOneAndUpdate(
      { slug: "monster-hunter-wilds" },
      { $setOnInsert: { title: "Monster Hunter Wilds", slug: "monster-hunter-wilds" } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } catch (error) {
    // Another serverless instance may create the unique game slug at the same time.
    if (error.code !== 11000) throw error;
    game = await Game.findOne({ slug: "monster-hunter-wilds" });
    if (!game) throw error;
  }

  await Promise.allSettled(wildsLocations.map(({ name, slug }) => Location.updateOne(
    { game: game._id, slug },
    { $setOnInsert: { game: game._id, name, slug, type: "locale" } },
    { upsert: true }
  )));

  // Concurrent cold starts can race on the unique (game, slug) index. Confirm
  // that every requested document exists before treating those races as safe.
  const slugs = wildsLocations.map(({ slug }) => slug);
  const seeded = await Location.countDocuments({ game: game._id, slug: { $in: slugs } });
  if (seeded !== wildsLocations.length) {
    throw new Error(`Only ${seeded} of ${wildsLocations.length} Monster Hunter Wilds locations are present`);
  }

  console.log(`Ensured ${wildsLocations.length} Monster Hunter Wilds locations`);
}

module.exports = seedWildsLocations;
