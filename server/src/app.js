const express = require("express");
const cors = require("cors");
const trackRoutes = require("./routes/track.routes");
const authRoutes = require("./routes/auth.routes");
const createResourceController = require("./controllers/resource.controller");
const createResourceRoutes = require("./routes/resource.routes");
const Game = require("./models/game.model");
const Location = require("./models/location.model");
const Monster = require("./models/monster.model");
const Item = require("./models/item.model");
const Weapon = require("./models/weapon.model");
const Armor = require("./models/armor.model");
const Skill = require("./models/skill.model");
const Quest = require("./models/quest.model");
const { notFound, errorHandler } = require("./middlewares/error.middleware");
const app = express();
// 1. Global middleware
app.use(cors());
app.use(express.json());
// 2. Routes
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/tracks", trackRoutes);
app.use('/api', authRoutes);
app.use("/api/games", createResourceRoutes(createResourceController({ Model: Game, filterFields: ["slug"] })));
app.use("/api/locations", createResourceRoutes(createResourceController({ Model: Location, filterFields: ["game", "type"] })));
app.use("/api/monsters", createResourceRoutes(createResourceController({ Model: Monster, filterFields: ["game", "classification", "species"], populate: ["game", "habitats", "rewards.item"] })));
app.use("/api/items", createResourceRoutes(createResourceController({ Model: Item, filterFields: ["game", "category", "rarity"] })));
app.use("/api/weapons", createResourceRoutes(createResourceController({ Model: Weapon, filterFields: ["game", "weaponType", "rarity"], populate: ["game", "parentWeapon", "materials.item"] })));
app.use("/api/armors", createResourceRoutes(createResourceController({ Model: Armor, filterFields: ["game", "rank", "rarity"], populate: ["game", "pieces.skills.skill", "pieces.materials.item"] })));
app.use("/api/skills", createResourceRoutes(createResourceController({ Model: Skill, filterFields: ["game", "category"] })));
app.use("/api/quests", createResourceRoutes(createResourceController({ Model: Quest, filterFields: ["game", "rank", "questType", "stars"], populate: ["game", "location", "targets.monster", "rewards.item"] })));
// 3. Error handling — must be LAST
app.use(notFound);
app.use(errorHandler);
module.exports = app;
