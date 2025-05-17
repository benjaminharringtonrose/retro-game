import React from "react";
import { Dimensions } from "react-native";
import { Direction, MapType, Entity } from "../types";
import { Player } from "../components/Player";
import { Map } from "../components/Map";
import { NPC } from "../components/NPC";
import { DEFAULT_MAPS, TILE_SIZE } from "../constants/map";

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

const createNPC = (id: string, x: number, y: number, boundsTiles: { minX: number; maxX: number; minY: number; maxY: number }): Entity => {
  // Validate initial position
  if (isNaN(x) || isNaN(y)) {
    console.error("Invalid initial position:", { x, y });
    x = screenWidth / 2;
    y = screenHeight / 2;
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
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
    },
    movement: {
      id: `${id}-movement`,
      speed: MOVEMENT_SPEED * 0.5,
      direction: Direction.Down,
      isMoving: true,
      bounds: {
        minX: boundsTiles.minX * TILE_SIZE,
        maxX: boundsTiles.maxX * TILE_SIZE,
        minY: boundsTiles.minY * TILE_SIZE,
        maxY: boundsTiles.maxY * TILE_SIZE,
      },
    },
    animation: {
      id: `${id}-animation`,
      currentFrame: 0,
      frameCount: 3,
      frameRate: 12,
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

export const setupGameEntities = (): { [key: string]: Entity } => {
  // Position player in a clear area in the middle of the map
  const playerX = screenWidth / 2;
  const playerY = screenHeight / 2;

  const map = createMap("map-1", MapType.FOREST);
  const player = createPlayer("player-1", playerX, playerY);

  // Adjust initial map position to ensure player starts in a clear area
  map.position.x = -TILE_SIZE * 12; // Move map to position player in clear area
  map.position.y = -TILE_SIZE * 12; // Move map to position player in clear area

  // Create Lilly NPC just one tile to the right of player's starting position
  const lillyMapX = -map.position.x + playerX + TILE_SIZE; // One tile right of player
  const lillyMapY = -map.position.y + playerY; // Same Y as player

  const lilly = createNPC("npc-lilly", lillyMapX + map.position.x, lillyMapY + map.position.y, {
    minX: 0,
    maxX: screenWidth,
    minY: 0,
    maxY: screenHeight,
  });

  // Store absolute position for map-relative positioning
  lilly.absolutePosition = {
    x: lillyMapX,
    y: lillyMapY,
  };

  // Initialize dialog state
  const dialog = {
    id: "dialog",
    isVisible: false,
    message: "",
  };

  // Log initial state for debugging
  console.log("Created Lilly at:", {
    position: lilly.position,
    absolutePosition: lilly.absolutePosition,
    mapPosition: map.position,
    playerPosition: { x: playerX, y: playerY },
  });

  return {
    "map-1": map,
    "player-1": player,
    "npc-lilly": lilly,
    dialog,
  };
};
