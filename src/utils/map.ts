import { Tile } from "../types/enums";

export const getTileColor = (tile: number) => {
  switch (tile) {
    case Tile.Grass:
      return "rgba(144, 238, 144, 0.1)";
    case Tile.Path:
      return "rgba(139, 69, 19, 0.3)";
    case Tile.Water:
      return "rgba(65, 105, 225, 0.4)";
    case Tile.Tree:
    case Tile.Tree2:
      return "transparent";
    case Tile.Rock:
      return "transparent";
    case Tile.Flower:
      return "transparent";
    case Tile.Cabin:
      return "transparent";
    default:
      return "transparent";
  }
};
