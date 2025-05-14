import { MapType, MapConfig, Tile, CollidableEntity } from "../types";
import { Portal } from "../engine/types/PortalTypes";

export const TILE_SIZE = 64;

// Define cabin properties
const CABIN_SCALE = 4;
const CABIN_SPRITE = require("../assets/cabin.png");
const CABIN_INTERIOR_BG = require("../assets/cabin-inside.png");

// Define portals
export const PORTALS: { [key: string]: Portal } = {
  CABIN_ENTRANCE: {
    id: "cabin_entrance",
    entryPoint: {
      bounds: {
        x: TILE_SIZE * 1.5,
        y: TILE_SIZE * 2,
        width: TILE_SIZE,
        height: TILE_SIZE / 2,
      },
      requiredDirection: "up",
      indicator: {
        type: "door",
      },
    },
    destination: {
      mapType: MapType.CABIN_INTERIOR,
      position: {
        x: 0,
        y: 0,
      },
      facingDirection: "up",
    },
    transition: {
      type: "fade",
      duration: 500,
    },
  },
  CABIN_EXIT: {
    id: "cabin_exit",
    entryPoint: {
      bounds: {
        x: TILE_SIZE * 1.5,
        y: TILE_SIZE * 2,
        width: TILE_SIZE,
        height: TILE_SIZE / 2,
      },
      requiredDirection: "down",
      indicator: {
        type: "door",
      },
    },
    destination: {
      mapType: MapType.FOREST,
      position: {
        x: -800.0,
        y: -184.0,
      },
      facingDirection: "down",
    },
    transition: {
      type: "fade",
      duration: 500,
    },
  },
};

// Create a function to generate collidable entities
const createCollidableEntities = (mapType: MapType): CollidableEntity[] => {
  switch (mapType) {
    case MapType.FOREST:
      return [
        {
          type: "cabin",
          position: { row: 14, col: 12 },
          sprite: CABIN_SPRITE,
          scale: CABIN_SCALE,
          collision: {
            width: 1,
            height: 1,
          },
        },
      ];
    case MapType.CABIN_INTERIOR:
      return [
        // Add interior walls and furniture collision here
      ];
    case MapType.MOUNTAIN_PASS:
      return [
        // Add mountain pass collision entities here
      ];
    default:
      return [];
  }
};

const FOREST_BG = require("../assets/forest-background.png");

export const DEFAULT_MAPS: MapConfig = {
  [MapType.FOREST]: {
    name: "Forest Path",
    initialPosition: {
      x: -800.0,
      y: -184.0,
    },
    background: FOREST_BG,
    mapData: [
      [3.2, 3, 3, 3, 3, 3, 3, 3, 3.2, 3, 3, 0, 0, 0, 3, 3, 3.2, 3, 3, 3, 3.2, 3, 3, 3, 3.2, 3, 3, 3, 3, 3],
      [3, 3.2, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.2, 3, 3, 3, 3.2, 3, 3, 3, 3.2, 3, 3, 3, 3],
      [3.2, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.2, 3, 3, 3, 3.2, 3, 3, 3, 3.2, 3, 3, 3],
      [3, 3.2, 3, 3, 3, 0, 0, 0, 3.2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.2, 3, 3, 3, 3.2, 3, 3, 3, 3.2, 3, 3],
      [3, 3, 3.2, 3, 0, 0, 0, 3.2, 3, 3.2, 3, 0, 0, 3.2, 0, 0, 0, 0, 0, 0, 3.2, 3, 3, 3, 3.2, 3, 3, 3, 3.2, 3],
      [3.2, 3, 3, 0, 0, 0, 3.2, 3, 3, 3, 3.2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.2, 3, 3, 3, 3.2, 3, 3, 3, 3],
      [3, 3.2, 0, 0, 0, 3.2, 3, 3, 0, 0, 0, 0, 0, 0, 3.2, 0, 0, 0, 0, 0, 0, 0, 3.2, 3, 3, 3, 3.2, 3, 3, 3],
      [3.2, 3, 0, 0, 3.2, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.2, 3, 3, 3, 3.2, 3, 3],
      [3, 3.2, 0, 3.2, 3, 3, 0, 0, 0, 0, 0, 0, 3.2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.2, 3, 3, 3, 3.2, 3],
      [3.2, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.2, 0, 0, 0, 0, 0, 0, 0, 3.2, 3, 3, 3, 3.2],
      [3, 3.2, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.2, 3, 3, 3],
      [3.2, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.2, 3, 3],
      [3, 3.2, 0, 0, 0, 0, 0, 0, 3.2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.2, 3],
      [3.2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3.2],
      [3, 3.2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.2, 3],
      [3.2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3.2],
      [3, 3.2, 0, 0, 0, 0, 0, 0, 3.2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.2, 3],
      [3.2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3.2],
      [3, 3.2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.2, 3, 3],
      [3.2, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.2, 3, 3, 3],
      [3, 3.2, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.2, 0, 0, 0, 0, 0, 0, 0, 3.2, 3, 3, 3, 3.2],
      [3.2, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 3.2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.2, 3, 3, 3, 3, 3],
      [3, 3.2, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.2, 3, 3, 3, 3, 3.2, 3],
      [3.2, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 3.2, 0, 0, 0, 0, 0, 0, 0, 3.2, 3, 3, 3, 3, 3, 3, 3],
      [3, 3.2, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.2, 3, 3, 3, 3, 3, 3.2, 3, 3],
      [3.2, 3, 3, 3, 3, 3, 3, 3, 3, 3.2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.2, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      [3, 3.2, 3, 3, 3, 3, 3, 3, 3, 3, 3.2, 3, 0, 0, 0, 0, 0, 0, 3.2, 3, 3, 3, 3, 3, 3, 3, 3.2, 3, 3, 3],
      [3.2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3.2, 3, 3, 0, 0, 3.2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      [3, 3.2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3.2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3.2, 3, 3, 3],
      [3.2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3.2, 3, 3, 3.2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    ],
    collidableEntities: createCollidableEntities(MapType.FOREST),
    portals: [PORTALS.CABIN_ENTRANCE],
  },
  [MapType.CABIN_INTERIOR]: {
    name: "Cabin Interior",
    initialPosition: {
      x: 0,
      y: 0,
    },
    background: CABIN_INTERIOR_BG,
    mapData: [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ],
    collidableEntities: createCollidableEntities(MapType.CABIN_INTERIOR),
    portals: [PORTALS.CABIN_EXIT],
  },
  [MapType.MOUNTAIN_PASS]: {
    name: "Mountain Pass",
    initialPosition: {
      x: 0,
      y: 0,
    },
    mapData: [
      [0, 0, 0, 0, 0, 0, 2, 2, 2, 2],
      [0, 0, 0, 3, 3, 0, 0, 2, 2, 2],
      [0, 0, 3, 3, 3, 3, 0, 0, 2, 2],
      [0, 0, 0, 3, 4, 4, 4, 0, 0, 0],
      [0, 0, 0, 0, 4, 0, 4, 0, 0, 0],
      [2, 0, 0, 0, 4, 4, 4, 0, 0, 0],
      [2, 2, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    collidableEntities: createCollidableEntities(MapType.MOUNTAIN_PASS),
  },
};
