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
  // Add more NPCs here as needed
};
