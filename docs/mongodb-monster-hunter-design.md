# MongoDB Design: Monster Hunter Database

## Collections and relationships

| Collection | Stores | Important relationships |
| --- | --- | --- |
| `games` | A Monster Hunter title/edition | Parent of all gameplay data |
| `locations` | Maps, hubs, camps and arenas | belongs to `games`; referenced by monsters and quests |
| `monsters` | Small and large monsters | belongs to `games`; references locations and reward items |
| `items` | Crafting materials, consumables, decorations and ammo | belongs to `games`; referenced by recipes/rewards |
| `weapons` | One weapon in an upgrade tree | belongs to `games`; references its parent weapon and required items |
| `armors` | An armor set, embedding its five pieces | belongs to `games`; pieces reference skills and materials |
| `skills` | Skills and effects by level | belongs to `games`; referenced by armor pieces |
| `quests` | Quest objectives and rewards | belongs to `games`; references a location, monsters and items |

`ObjectId` references are used for data shared across pages. Small data that is always read together is embedded: monster weaknesses, weapon materials, armor pieces/skills, and quest targets/rewards. This avoids excessive joins while keeping shared entities canonical.

## Entity map

```text
Game 1--* Location
Game 1--* Monster --* Location
Game 1--* Item
Game 1--* Weapon --1 Weapon (parent upgrade)
Game 1--* Armor --* Skill
Game 1--* Quest --1 Location
Quest --* Monster
Monster/Weapon/Armor/Quest --* Item
```

## Implemented Mongoose models

Models are in `server/src/models/`. Each game-scoped entity has the compound unique index `{ game, slug }`, so data from different games such as *Monster Hunter Rise* and *Monster Hunter Wilds* cannot clash. Filter indexes are added for common list pages (weapon type, armor rank, quest rank/type, and monster classification/species).

## Example: a monster document

```json
{
  "game": "ObjectId(Monster Hunter Wilds)",
  "name": "Chatacabra",
  "slug": "chatacabra",
  "classification": "large",
  "species": "Amphibian",
  "habitats": ["ObjectId(Windward Plains)"],
  "elements": ["water"],
  "weaknesses": [{ "element": "thunder", "value": 3 }],
  "rewards": [{ "item": "ObjectId(Chatacabra Scale)", "rank": "low", "source": "Target reward", "chance": 22 }]
}
```

## Query patterns

```js
// List large monsters in one game, with their habitats
Monster.find({ game: gameId, classification: "large" }).populate("habitats", "name slug");

// Render a weapon page including crafting materials and its previous upgrade
Weapon.findOne({ game: gameId, slug: "example-weapon" })
  .populate("parentWeapon", "name slug")
  .populate("materials.item", "name slug icon");

// Find high-rank optional quests in a game
Quest.find({ game: gameId, rank: "high", questType: "optional" })
  .populate("location", "name")
  .populate("targets.monster", "name slug image");
```

For search, start with indexed prefix fields such as `name`/`slug`; add MongoDB Atlas Search only when typo-tolerant or multilingual full-text search is required.
