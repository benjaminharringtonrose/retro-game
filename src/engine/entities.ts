import React from "react";
import { Dimensions } from "react-native";
import { Direction, MapType, Entity } from "../types";
import { Player } from "../components/Player";
import { Map } from "../components/Map";
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

  return {
    "player-1": player,
    "map-1": map,
  };
};
