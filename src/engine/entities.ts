import React from "react";
import { Dimensions } from "react-native";
import { Direction, Controls, GameState, Entities, Tile } from "../types";
import { Player } from "../components/Player";
import { Map } from "../components/Map";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Constants for sizes
const TILE_SIZE = 64; // Increased tile size
const PLAYER_WIDTH = 32 * 2.0; // Match sprite width * scale
const PLAYER_HEIGHT = 40 * 2.0; // Match sprite height * scale
const MOVEMENT_SPEED = 8; // Adjusted for larger tiles

// Create a simple initial map
const createInitialMap = () => {
  const mapWidth = Math.ceil(screenWidth / TILE_SIZE) + 4; // Add extra tiles for scrolling
  const mapHeight = Math.ceil(screenHeight / TILE_SIZE) + 4; // Add extra tiles for scrolling
  const tiles: number[][] = [];

  for (let y = 0; y < mapHeight; y++) {
    const row: number[] = [];
    for (let x = 0; x < mapWidth; x++) {
      // Create a border of trees
      if (x === 0 || x === mapWidth - 1 || y === 0 || y === mapHeight - 1) {
        row.push(Tile.Tree);
      } else {
        // Random grass or path tiles for the interior
        row.push(Math.random() < 0.8 ? Tile.Grass : Tile.Path);
      }
    }
    tiles.push(row);
  }
  return tiles;
};

export const setupGameEntities = (): Entities => {
  const initialControls: Controls = {
    up: false,
    down: false,
    left: false,
    right: false,
  };

  const initialGameState: GameState = {
    controls: initialControls,
    health: 100,
    rupees: 0,
    hasItem: false,
  };

  const mapTiles = createInitialMap();
  const mapWidth = mapTiles[0].length * TILE_SIZE;
  const mapHeight = mapTiles.length * TILE_SIZE;

  // Calculate initial map position to center the map
  const initialMapX = (screenWidth - mapWidth) / 2;
  const initialMapY = (screenHeight - mapHeight) / 2;

  // Calculate player position to be exactly in the center of the screen
  const playerX = (screenWidth - PLAYER_WIDTH) / 2;
  const playerY = (screenHeight - PLAYER_HEIGHT) / 2;

  return {
    // Map should be rendered first (lower z-index)
    map: {
      x: initialMapX,
      y: initialMapY,
      width: mapWidth,
      height: mapHeight,
      tileSize: TILE_SIZE,
      tiles: mapTiles,
      renderer: Map,
    },
    // Player should be rendered last (higher z-index) and stay centered
    player: {
      direction: Direction.Down,
      isMoving: false,
      speed: MOVEMENT_SPEED,
      x: playerX,
      y: playerY,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      currentFrame: 1, // Start with middle frame
      renderer: Player,
    },
    gameState: initialGameState,
  };
};
