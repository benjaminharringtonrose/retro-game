import React from "react";
import { Dimensions } from "react-native";
import { Direction, MapType, Entity } from "../types";
import { Player } from "../components/Player";
import { Map } from "../components/Map";
import { NPC } from "../components/NPC";
import { DialogBoxRenderer } from "../components/DialogBoxRenderer";
import { DEFAULT_MAPS, TILE_SIZE } from "../constants/map";
import { NPC_CONFIGS } from "../config/npcs";

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
    console.error(`No configuration found for NPC: ${id}`);
    return {
      id,
      position: { id: `${id}-position`, x: 0, y: 0 },
      dimensions: { id: `${id}-dimensions`, width: 0, height: 0 },
      renderer: NPC,
    } as Entity;
  }

  // Validate initial position
  if (isNaN(x) || isNaN(y)) {
    console.error("Invalid initial position:", { x, y });
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

const createMap = (id: string, mapType: MapType): Entity => {
  const mapData = DEFAULT_MAPS[mapType];
  const mapTiles = mapData.mapData;
  const mapWidth = mapTiles[0].length * TILE_SIZE;
  const mapHeight = mapTiles.length * TILE_SIZE;

  return {
    id,
    position: {
      id: `${id}-position`,
      x: mapData.initialPosition.x,
      y: mapData.initialPosition.y,
    },
    dimensions: {
      id: `${id}-dimensions`,
      width: mapWidth,
      height: mapHeight,
    },
    tileData: {
      id: `${id}-tiledata`,
      tileSize: TILE_SIZE,
      tiles: mapTiles,
    },
    bounds: {
      id: `${id}-bounds`,
      width: mapWidth,
      height: mapHeight,
      minX: -(mapWidth - screenWidth),
      maxX: 0,
      minY: -(mapHeight - screenHeight),
      maxY: 0,
    },
    renderer: Map,
  };
};

const createDialog = (id: string): Entity => ({
  id,
  isVisible: false,
  message: "",
  onClose: () => {
    console.log("Dialog onClose triggered");
    if (window.gameEngine?.dispatch) {
      console.log("Dispatching dialog-close event");
      window.gameEngine.dispatch({
        type: "dialog-close",
        payload: { id },
      });
    } else {
      console.warn("Game engine not found for dialog close");
    }
  },
  renderer: DialogBoxRenderer,
});

export const setupGameEntities = (): { [key: string]: Entity } => {
  // Position player in a clear area in the middle of the map
  const playerX = screenWidth / 2;
  const playerY = screenHeight / 2;

  const map = createMap("map-1", MapType.FOREST);
  const player = createPlayer("player-1", playerX, playerY);

  // Adjust initial map position to ensure player starts in a clear area
  map.position.x = -TILE_SIZE * 12;
  map.position.y = -TILE_SIZE * 12;

  // Create Lilly NPC with config-based position
  const lillyConfig = NPC_CONFIGS["npc-lilly"];
  const lilly = createNPC("npc-lilly", lillyConfig.initialPosition.x + map.position.x, lillyConfig.initialPosition.y + map.position.y);

  // Store absolute position for map-relative positioning
  lilly.absolutePosition = {
    x: lillyConfig.initialPosition.x,
    y: lillyConfig.initialPosition.y,
  };

  // Store initial position for movement bounds
  lilly.initialPosition = lillyConfig.initialPosition;

  // Create dialog entity
  const dialog = createDialog("dialog-1");

  return {
    "map-1": map,
    "player-1": player,
    "npc-lilly": lilly,
    "dialog-1": dialog,
  };
};
