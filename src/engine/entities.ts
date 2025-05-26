import React from "react";
import { Dimensions } from "react-native";
import { Direction, MapType } from "../types/enums";
import { Entity } from "../types/entities";
import { Player } from "../components/Player";
import { Map } from "../components/Map";
import { NPC } from "../components/NPC";
import { Portal } from "../components/Portal";
import { DialogBoxRenderer } from "../components/DialogBoxRenderer";
import { DEFAULT_MAPS, TILE_SIZE } from "../constants/map";
import { NPC_CONFIGS } from "../config/npcs";
import { PORTAL_CONFIGS } from "../config/portals";
import { mapManager } from "../managers/MapManager";
import { logger } from "../utils/logger";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Constants for sizes
const PLAYER_WIDTH = 32;
const PLAYER_HEIGHT = 40;
const MOVEMENT_SPEED = 200; // Increased for smoother movement

const createPlayer = (id: string, x: number, y: number): Entity => ({
  id,
  position: {
    id: `${id}-position`,
    x,
    y,
  },
  dimensions: {
    id: `${id}-dimensions`,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
  },
  movement: {
    id: `${id}-movement`,
    speed: MOVEMENT_SPEED,
    direction: Direction.Down,
    isMoving: false,
  },
  animation: {
    id: `${id}-animation`,
    currentFrame: 1,
    frameCount: 3,
    frameRate: 12, // Increased for smoother animation
  },
  controls: {
    id: `${id}-controls`,
    up: false,
    down: false,
    left: false,
    right: false,
  },
  stats: {
    id: `${id}-stats`,
    health: 100,
    rupees: 0,
    hasItem: false,
  },
  renderer: Player,
});

const createNPC = (id: string, x: number, y: number): Entity => {
  // Get NPC config
  const config = NPC_CONFIGS[id];
  if (!config) {
    logger.error("NPC", `No configuration found for NPC: ${id}`);
    return {
      id,
      position: { id: `${id}-position`, x: 0, y: 0 },
      dimensions: { id: `${id}-dimensions`, width: 0, height: 0 },
      renderer: NPC,
    } as Entity;
  }

  // Validate initial position
  if (isNaN(x) || isNaN(y)) {
    logger.error("NPC", "Invalid initial position:", { x, y });
    x = config.initialPosition.x;
    y = config.initialPosition.y;
  }

  return {
    id,
    position: {
      id: `${id}-position`,
      x,
      y,
    },
    dimensions: {
      id: `${id}-dimensions`,
      width: config.sprite.width * config.sprite.scale,
      height: config.sprite.height * config.sprite.scale,
    },
    movement: {
      id: `${id}-movement`,
      speed: config.behavior.moveSpeed,
      direction: Direction.Down,
      isMoving: false,
      bounds: config.behavior.boundary,
    },
    animation: {
      id: `${id}-animation`,
      currentFrame: 0,
      frameCount: config.sprite.frameCount,
      frameRate: config.sprite.frameRate,
    },
    onInteract: () => {
      return {
        type: "npc-click",
        payload: { npcId: id },
      };
    },
    renderer: NPC,
  };
};

export const createPortal = (id: string, mapPosition: { x: number; y: number }): Entity => {
  // Get portal config
  const config = PORTAL_CONFIGS[id];
  if (!config) {
    logger.error("Portal", `No configuration found for Portal: ${id}`);
    return {
      id,
      position: { id: `${id}-position`, x: 0, y: 0 },
      dimensions: { id: `${id}-dimensions`, width: 0, height: 0 },
      renderer: Portal,
    } as Entity;
  }

  // Store the absolute position on the map for collision detection
  const absolutePosition = {
    x: config.position.x,
    y: config.position.y,
  };

  // For rendering, we need to offset the position by the map position
  // This ensures the portal stays fixed relative to the map's position
  const x = config.position.x + mapPosition.x;
  const y = config.position.y + mapPosition.y;

  logger.log("Portal", `Creating portal ${id} at map position (${absolutePosition.x}, ${absolutePosition.y}), screen position (${x}, ${y}), map offset (${mapPosition.x}, ${mapPosition.y})`);

  return {
    id,
    position: {
      id: `${id}-position`,
      x,
      y,
    },
    dimensions: {
      id: `${id}-dimensions`,
      width: config.dimensions.width,
      height: config.dimensions.height,
    },
    portal: {
      id: `${id}-portal`,
      targetMapType: config.targetMapType,
      targetPosition: config.targetPosition,
      isActive: true,
      triggerDistance: config.triggerDistance,
    },
    // Store the absolute position for collision detection
    absolutePosition,
    // Include mapId for easier reference to the parent map
    mapId: "map-1",
    // Add debug property that will be updated by the map's debug state
    debug: {
      boxes: [],
    },
    renderer: Portal,
  };
};

const createMap = (id: string, mapType: MapType, onImageLoad: (assetId?: string) => void): Entity => {
  const dimensions = mapManager.getMapDimensions(mapType);
  const position = mapManager.getMapPosition(mapType);
  const bounds = mapManager.getMapBounds(mapType);
  const mapData = DEFAULT_MAPS[mapType];

  logger.log("Map", `Creating map ${mapType} with:`, { dimensions, position, bounds });

  return {
    id,
    mapType,
    position: {
      id: `${id}-position`,
      x: position.x,
      y: position.y,
    },
    dimensions: {
      id: `${id}-dimensions`,
      width: dimensions.width,
      height: dimensions.height,
    },
    tileData: {
      id: `${id}-tiledata`,
      tileSize: TILE_SIZE,
      tiles: mapData.mapData,
      background: mapData.background,
    },
    bounds,
    renderer: Map,
    onImageLoad,
  };
};

const createDialog = (id: string): Entity => ({
  id,
  isVisible: false,
  message: "",
  onClose: () => {
    logger.log("Dialog", "Dialog onClose triggered");
    if (window.gameEngine?.dispatch) {
      logger.log("Dialog", "Dispatching dialog-close event");
      window.gameEngine.dispatch({
        type: "dialog-close",
        payload: { id },
      });
    } else {
      logger.warn("Dialog", "Game engine not found for dialog close");
    }
  },
  renderer: DialogBoxRenderer,
});

export const setupGameEntities = (onImageLoad: (assetId?: string) => void): { [key: string]: Entity } => {
  // Position player in a clear area in the middle of the map
  const playerX = screenWidth / 2;
  const playerY = screenHeight / 2;

  const map = createMap("map-1", MapType.FOREST, onImageLoad);
  const player = createPlayer("player-1", playerX, playerY);

  // Initialize map using MapManager
  mapManager.updateMapForType(map, MapType.FOREST, player);

  logger.log("Game", `Initial map position: (${map.position.x}, ${map.position.y}) for map type ${map.mapType}`);

  // Create all NPCs from config
  const entities: { [key: string]: Entity } = {
    "map-1": map,
    "player-1": player,
    "dialog-1": createDialog("dialog-1"),
  };

  // Dynamically add all NPCs from config
  Object.keys(NPC_CONFIGS).forEach((npcId) => {
    const npcConfig = NPC_CONFIGS[npcId];
    const npc = createNPC(npcId, npcConfig.initialPosition.x + map.position.x, npcConfig.initialPosition.y + map.position.y);

    // Store absolute position for map-relative positioning
    npc.absolutePosition = {
      x: npcConfig.initialPosition.x,
      y: npcConfig.initialPosition.y,
    };

    // Store initial position for movement bounds
    npc.initialPosition = npcConfig.initialPosition;

    entities[npcId] = npc;
  });

  // Dynamically add all portals from config
  Object.keys(PORTAL_CONFIGS).forEach((portalId) => {
    // Only create portals that belong to the current map type
    const portalConfig = PORTAL_CONFIGS[portalId];
    if (portalConfig.sourceMapType === map.mapType) {
      const portal = createPortal(portalId, map.position);
      entities[portalId] = portal;
    }
  });

  logger.log("Game", "Game entities setup complete:", Object.keys(entities));

  return entities;
};
