import { MapType, PortalConfig } from "../types";
import { TILE_SIZE } from "../constants/map";

// Debug the assets to make sure they're loading correctly
const portalSprite = require("../assets/portal.png");
console.log("[Portals Config] Portal sprite loaded:", portalSprite);

// Portal configurations
export const PORTAL_CONFIGS: { [key: string]: PortalConfig } = {
  // Portal in front of the cabin in the forest map
  "portal-cabin-entrance": {
    id: "portal-cabin-entrance",
    position: {
      x: 17 * TILE_SIZE + TILE_SIZE / 2, // Center of the tile
      y: 17 * TILE_SIZE - TILE_SIZE / 2, // Just in front of cabin
    },
    dimensions: {
      width: TILE_SIZE,
      height: TILE_SIZE,
    },
    targetMapType: MapType.CABIN_INTERIOR,
    targetPosition: {
      x: 6 * TILE_SIZE + TILE_SIZE / 2, // Position inside cabin - centered
      y: 11 * TILE_SIZE, // Near bottom row of new map
    },
    triggerDistance: TILE_SIZE * 0.5,
    sprite: portalSprite,
    sourceMapType: MapType.FOREST, // This portal only appears in the forest map
  },
  // Portal inside the cabin to go back outside
  "portal-cabin-exit": {
    id: "portal-cabin-exit",
    position: {
      x: 6 * TILE_SIZE + TILE_SIZE / 2, // Center of the tile in new map
      y: 12 * TILE_SIZE, // Bottom row of new map
    },
    dimensions: {
      width: TILE_SIZE * 1.2,
      height: TILE_SIZE * 1.2,
    },
    targetMapType: MapType.FOREST,
    targetPosition: {
      x: 17 * TILE_SIZE + TILE_SIZE / 2, // Position outside cabin
      y: 17 * TILE_SIZE + TILE_SIZE / 2, // Just in front of cabin
    },
    triggerDistance: TILE_SIZE * 0.8, // Make it easier to trigger
    sprite: portalSprite,
    sourceMapType: MapType.CABIN_INTERIOR, // This portal only appears in the cabin map
  },
};

// Helper function to get portals for a specific map
export const getPortalsForMap = (mapType: MapType): { [key: string]: PortalConfig } => {
  const result: { [key: string]: PortalConfig } = {};

  Object.entries(PORTAL_CONFIGS).forEach(([id, config]) => {
    if (config.sourceMapType === mapType) {
      result[id] = config;
    }
  });

  return result;
};
