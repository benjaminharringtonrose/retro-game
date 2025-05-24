import { TILE_SIZE } from "../constants/map";
import { TileCoordinates, MapCoordinates } from "../types/pathfinding";

// Helper to get tile coordinates from map coordinates
export const getTileCoords = (x: number, y: number): TileCoordinates => ({
  tileX: Math.floor(x / TILE_SIZE),
  tileY: Math.floor(y / TILE_SIZE),
});

// Helper to get map coordinates from tile coordinates
export const getMapCoords = (tileX: number, tileY: number): MapCoordinates => ({
  x: tileX * TILE_SIZE + TILE_SIZE / 2,
  y: tileY * TILE_SIZE + TILE_SIZE / 2,
});
