import { MapType, PortalConfig } from "../types";
import { TILE_SIZE } from "../constants/map";

// Debug the assets to make sure they're loading correctly
const portalSprite = require("../assets/portal-5.png");

// Animation configuration for portals
const PORTAL_ANIMATION = {
  frameCount: 3,
  frameRate: 200, // milliseconds between frames
  spriteWidth: 80, // width of a single frame
  spriteHeight: 128, // height of a single frame
};

// Portal configurations
export const PORTAL_CONFIGS: { [key: string]: PortalConfig } = {
  // Portal in front of the cabin in the forest map
  "portal-cabin-entrance": {
    id: "portal-cabin-entrance",
    position: {
      x: 16.3 * TILE_SIZE + TILE_SIZE / 2, // Center of the tile
      y: 14.7 * TILE_SIZE - TILE_SIZE / 2, // Just in front of cabin
    },
    dimensions: {
      width: PORTAL_ANIMATION.spriteWidth,
      height: PORTAL_ANIMATION.spriteHeight,
    },
    targetMapType: MapType.CABIN_INTERIOR,
    targetPosition: {
      x: 4.5 * TILE_SIZE, // Center on the door in cabin interior
      y: 6 * TILE_SIZE, // Position at row 6 where door is
    },
    triggerDistance: TILE_SIZE * 1.5,
    sprite: portalSprite,
    sourceMapType: MapType.FOREST, // This portal only appears in the forest map
    animation: {
      frameCount: PORTAL_ANIMATION.frameCount,
      frameRate: PORTAL_ANIMATION.frameRate,
    },
  },
  // Portal inside the cabin to go back outside
  "portal-cabin-exit": {
    id: "portal-cabin-exit",
    position: {
      x: 3 * TILE_SIZE,
      y: 4 * TILE_SIZE,
    },
    dimensions: {
      width: PORTAL_ANIMATION.spriteWidth,
      height: PORTAL_ANIMATION.spriteHeight,
    },
    targetMapType: MapType.FOREST,
    targetPosition: {
      x: 3 * TILE_SIZE + TILE_SIZE / 2, // Position outside cabin
      y: 4.8 * TILE_SIZE + TILE_SIZE / 2, // Just in front of cabin
    },
    triggerDistance: TILE_SIZE * 1.5,
    sprite: portalSprite,
    sourceMapType: MapType.CABIN_INTERIOR, // This portal only appears in the cabin map
    animation: {
      frameCount: PORTAL_ANIMATION.frameCount,
      frameRate: PORTAL_ANIMATION.frameRate,
    },
  },
  "portal-forest-town-entrance": {
    id: "portal-forest-town-entrance",
    position: {
      x: 28.4 * TILE_SIZE + TILE_SIZE / 2, // Center of the tile
      y: 15.6 * TILE_SIZE - TILE_SIZE / 2, // Just in front of cabin
    },
    dimensions: {
      width: PORTAL_ANIMATION.spriteWidth,
      height: PORTAL_ANIMATION.spriteHeight,
    },
    targetMapType: MapType.CABIN_INTERIOR,
    targetPosition: {
      x: 4.5 * TILE_SIZE, // Center on the door in cabin interior
      y: 6 * TILE_SIZE, // Position at row 6 where door is
    },
    triggerDistance: TILE_SIZE * 1.5,
    sprite: portalSprite,
    sourceMapType: MapType.FOREST, // This portal only appears in the forest map
    animation: {
      frameCount: PORTAL_ANIMATION.frameCount,
      frameRate: PORTAL_ANIMATION.frameRate,
    },
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
