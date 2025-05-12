import { Tile } from "../types";

export const staticMap: Tile[][] = Array.from({ length: 30 }, (_, row) =>
  Array.from({ length: 30 }, (_, col) => {
    // example pattern:
    if (col === 15) return Tile.Water; // a vertical river
    if (row % 7 === 0 && col % 7 === 0)
      // trees at every 7th tile
      return Tile.Tree;
    if (row === 10) return Tile.Path; // a horizontal path
    return Tile.Grass; // default
  })
);
