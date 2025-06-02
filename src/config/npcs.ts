import { Direction, Tile } from "../types";
import { TILE_SIZE } from "../constants/map";
import { NPCConfig } from "../types/npc";

const lillySprite = require("../assets/lilly-walk.png");
const willowSprite = require("../assets/willow-spritesheet.png");
const rosieSprite = require("../assets/rosie-spritesheet.png");

// Sprite configurations
const LILLY_SPRITE = {
  source: lillySprite,
  width: 64,
  height: 64,
  scale: 0.9,
  frameCount: 9,
  frameRate: 12,
  rows: {
    [Direction.Up]: 0,
    [Direction.Left]: 1,
    [Direction.Down]: 2,
    [Direction.Right]: 3,
    [Direction.UpLeft]: 1,
    [Direction.UpRight]: 3,
    [Direction.DownLeft]: 1,
    [Direction.DownRight]: 3,
  },
};

const WILLOW_SPRITE = {
  source: willowSprite,
  width: 34,
  height: 36,
  scale: 1,
  frameCount: 3,
  frameRate: 8,
  rows: {
    [Direction.Down]: 0,
    [Direction.Left]: 1,
    [Direction.Up]: 2,
    [Direction.Right]: 3,
    [Direction.UpLeft]: 1,
    [Direction.UpRight]: 3,
    [Direction.DownLeft]: 1,
    [Direction.DownRight]: 3,
  },
};

const ROSIE_SPRITE = {
  source: rosieSprite,
  width: 34,
  height: 36,
  scale: 1,
  frameCount: 3,
  frameRate: 8,
  rows: {
    [Direction.Down]: 0,
    [Direction.Left]: 1,
    [Direction.Up]: 2,
    [Direction.Right]: 3,
    [Direction.UpLeft]: 1,
    [Direction.UpRight]: 3,
    [Direction.DownLeft]: 1,
    [Direction.DownRight]: 3,
  },
};

export const NPC_CONFIGS: { [key: string]: NPCConfig } = {
  "npc-lilly": {
    id: "npc-lilly",
    name: "Lilly",
    sprite: LILLY_SPRITE,
    behavior: {
      type: "wander",
      moveSpeed: 200 * 0.5, // Half of player speed
      waitTimeRange: {
        min: 1500,
        max: 3000,
      },
      moveIntervalRange: {
        min: 2000,
        max: 4000,
      },
      allowedTiles: [Tile.Flower],
      boundary: {
        minX: 22,
        maxX: 24,
        minY: 14,
        maxY: 15,
      },
    },
    dialogue: {
      messages: ["I love you Ben!"],
      triggerDistance: 1,
    },
    initialPosition: {
      x: 23 * TILE_SIZE,
      y: 15 * TILE_SIZE,
    },
  },
  "npc-willow": {
    id: "npc-willow",
    name: "Willow",
    sprite: WILLOW_SPRITE,
    behavior: {
      type: "wander",
      moveSpeed: 80,
      moveIntervalRange: {
        min: 4000,
        max: 7000,
      },
      waitTimeRange: {
        min: 2500,
        max: 5000,
      },
      boundary: {
        minX: 14,
        maxX: 18,
        minY: 14,
        maxY: 18,
      },
      allowedTiles: [0],
    },
    dialogue: {
      triggerDistance: 2,
      messages: ["Woof woof!", "*wags tail excitedly*", "*sniffs around curiously*"],
    },
    initialPosition: {
      x: 16 * TILE_SIZE,
      y: 16 * TILE_SIZE,
    },
  },
  "npc-rosie": {
    id: "npc-rosie",
    name: "Rosie",
    sprite: ROSIE_SPRITE,
    behavior: {
      type: "wander",
      moveSpeed: 85, // Slightly faster than Willow
      moveIntervalRange: {
        min: 3500,
        max: 6000,
      },
      waitTimeRange: {
        min: 2000,
        max: 4500,
      },
      boundary: {
        minX: 19, // Different area than Willow
        maxX: 22,
        minY: 14,
        maxY: 17,
      },
      allowedTiles: [0],
    },
    dialogue: {
      triggerDistance: 2,
      messages: ["*playful bark*", "*rolls over for belly rubs*", "*chases her tail*"],
    },
    initialPosition: {
      x: 20 * TILE_SIZE,
      y: 15 * TILE_SIZE,
    },
  },
  // Add more NPCs here as needed
};
