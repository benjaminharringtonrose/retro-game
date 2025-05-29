import { MapType, PortalConfig, Portals } from "../types";
import { TILE_SIZE } from "../constants/map";

const PORTAL_SPRITE = require("../assets/portal-7.png");

const PORTAL_ANIMATION = {
  frameCount: 3,
  frameRate: 200,
  spriteWidth: 88.6,
  spriteHeight: 80,
  scale: 0.9,
};

export const PORTAL_CONFIGS: { [key: string]: PortalConfig } = {
  [Portals.HomeEntrance]: {
    id: Portals.HomeEntrance,
    position: {
      x: 16.3 * TILE_SIZE + TILE_SIZE / 2,
      y: 15 * TILE_SIZE - TILE_SIZE / 2,
    },
    dimensions: {
      width: PORTAL_ANIMATION.spriteWidth * PORTAL_ANIMATION.scale,
      height: PORTAL_ANIMATION.spriteHeight * PORTAL_ANIMATION.scale,
    },
    targetMapType: MapType.CABIN_INTERIOR,
    triggerDistance: TILE_SIZE * 0.75,
    sprite: PORTAL_SPRITE,
    sourceMapType: MapType.FOREST,
    animation: {
      frameCount: PORTAL_ANIMATION.frameCount,
      frameRate: PORTAL_ANIMATION.frameRate,
    },
  },
  [Portals.HomeExit]: {
    id: Portals.HomeExit,
    position: {
      x: 3 * TILE_SIZE,
      y: 4 * TILE_SIZE,
    },
    dimensions: {
      width: PORTAL_ANIMATION.spriteWidth,
      height: PORTAL_ANIMATION.spriteHeight,
    },
    targetMapType: MapType.FOREST,
    triggerDistance: TILE_SIZE / 2,
    sprite: PORTAL_SPRITE,
    sourceMapType: MapType.CABIN_INTERIOR,
    animation: {
      frameCount: PORTAL_ANIMATION.frameCount,
      frameRate: PORTAL_ANIMATION.frameRate,
    },
  },
  [Portals.ForestTownEntrance]: {
    id: Portals.ForestTownEntrance,
    position: {
      x: 28.4 * TILE_SIZE + TILE_SIZE / 2,
      y: 15.6 * TILE_SIZE - TILE_SIZE / 2,
    },
    dimensions: {
      width: PORTAL_ANIMATION.spriteWidth,
      height: PORTAL_ANIMATION.spriteHeight,
    },
    targetMapType: MapType.CABIN_INTERIOR,
    triggerDistance: TILE_SIZE / 2,
    sprite: PORTAL_SPRITE,
    sourceMapType: MapType.FOREST,
    animation: {
      frameCount: PORTAL_ANIMATION.frameCount,
      frameRate: PORTAL_ANIMATION.frameRate,
    },
  },
};

export const getPortalsForMap = (mapType: MapType): { [key: string]: PortalConfig } => {
  const result: { [key: string]: PortalConfig } = {};

  Object.entries(PORTAL_CONFIGS).forEach(([id, config]) => {
    if (config.sourceMapType === mapType) {
      result[id] = config;
    }
  });

  return result;
};
