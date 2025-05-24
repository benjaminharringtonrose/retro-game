import { TILE_SIZE } from "../constants/map";

export interface Node {
  tileX: number;
  tileY: number;
  g: number; // Cost from start to current node
  h: number; // Estimated cost from current node to end
  f: number; // Total cost (g + h)
  parent: Node | null;
}

export interface TileCoordinates {
  tileX: number;
  tileY: number;
}

export interface MapCoordinates {
  x: number;
  y: number;
}
