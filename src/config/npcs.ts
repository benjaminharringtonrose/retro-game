import { Direction, Tile } from "../types";
import { TILE_SIZE } from "../constants/map";
import { NPCConfig } from "../types/npc";

// Sprite configurations
const LILLY_SPRITE = {
  source: require("../assets/lilly-spritesheet.png"),
  width: 32,
  height: 41,
  scale: 1.0,
  frameCount: 3,
  frameRate: 12,
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

const WILLOW_SPRITE = {
  source: require("../assets/willow.png"),
  width: 32,
  height: 32,
  scale: 1.5,
  frameCount: 3,
  frameRate: 8,
  rows: {
    [Direction.Down]: 0,
    [Direction.Left]: 1,
    [Direction.Right]: 2,
    [Direction.Up]: 3,
    [Direction.UpLeft]: 1,
    [Direction.UpRight]: 2,
    [Direction.DownLeft]: 1,
    [Direction.DownRight]: 2,
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
        minX: 12,
        maxX: 18,
        minY: 12,
        maxY: 18,
      },
      allowedTiles: [0],
    },
    dialogue: {
      triggerDistance: 2,
      messages: ["Woof woof!", "*wags tail excitedly*", "*sniffs around curiously*"],
    },
    initialPosition: {
      x: 23 * TILE_SIZE,
      y: 15 * TILE_SIZE,
    },
  },
  // Add more NPCs here as needed
};
