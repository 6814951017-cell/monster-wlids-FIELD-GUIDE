const express = require("express");
const cors = require("cors");
const busboy = require("busboy");
const { randomUUID } = require("crypto");
const { put } = require("@vercel/blob");
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

const streamUploadToBlob = (req) => new Promise((resolve, reject) => {
  const body = [];
  const headers = req.headers;
  const bb = busboy({ headers });

  bb.on("file", (_, file, info) => {
    const { filename, mimeType } = info;
    file.on("data", (chunk) => body.push(chunk));
    file.on("end", async () => {
      try {
        const buffer = Buffer.concat(body);
        if (!process.env.BLOB_READ_WRITE_TOKEN) {
          throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
        }

        const finalName = filename || `upload-${Date.now()}-${randomUUID()}`;
        const { url } = await put(finalName, buffer, {
          access: "public",
          contentType: mimeType || "application/octet-stream",
        });

        resolve(url);
      } catch (error) {
        reject(error);
      }
    });
  });

  bb.on("error", reject);
  req.pipe(bb);
});

// 1. Global middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// 2. Routes
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.post("/api/upload", async (req, res, next) => {
  try {
    const url = await streamUploadToBlob(req);
    res.status(201).json({ url });
  } catch (error) {
    next(error);
  }
});

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
