import { Entity, SystemProps } from "../../types";
import { Tile } from "../../types/enums";

// Z-index constants
const Z_INDEX = {
  GROUND: 1,
  TREES: 50,
  PORTALS: 100,
  PLAYER: 200,
  CABIN_FRONT: 300,
  NPCS: 400,
  DIALOG: 500,
};

export const RenderingSystem = (entities: { [key: string]: Entity }, { time, delta = 16.666 }: SystemProps) => {
  const player = entities["player-1"];
  const map = entities["map-1"];

  if (!player?.position || !map?.position || !map.tileData) {
    return entities;
  }

  // Calculate player's position relative to the map
  const playerMapY = player.position.y - map.position.y;

  // Get all cabin tiles
  const { tiles, tileSize } = map.tileData;
  let cabinTiles: { row: number; col: number; y: number }[] = [];

  // Find all cabin tiles and their positions
  tiles.forEach((row: number[], rowIndex: number) => {
    row.forEach((tile: number, colIndex: number) => {
      if (tile === Tile.Cabin) {
        const tileY = rowIndex * tileSize;
        cabinTiles.push({ row: rowIndex, col: colIndex, y: tileY });
      }
    });
  });

  // For each cabin tile, determine if the player is behind or in front of it
  cabinTiles.forEach(({ y: cabinY }) => {
    // The cabin's collision area starts a bit above its base
    const cabinCollisionY = cabinY + tileSize * 0.4; // Adjust this value to match the cabin's visual base

    // If player is behind the cabin
    if (playerMapY < cabinCollisionY) {
      // Player should render below cabin
      player.zIndex = Z_INDEX.PLAYER;
    } else {
      // Player should render above cabin
      player.zIndex = Z_INDEX.CABIN_FRONT + 1;
    }
  });

  // Update z-indices for all entities
  Object.values(entities).forEach((entity) => {
    if (entity.id.startsWith("portal-")) {
      entity.zIndex = Z_INDEX.PORTALS;
    } else if (entity.id.startsWith("npc-")) {
      entity.zIndex = Z_INDEX.NPCS;
    } else if (entity.id === "dialog-1") {
      entity.zIndex = Z_INDEX.DIALOG;
    }
  });

  return entities;
};
