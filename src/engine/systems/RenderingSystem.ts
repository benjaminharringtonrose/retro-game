import { Entity, SystemProps } from "../../types";
import { Tile } from "../../types/enums";

// Z-index constants
const Z_INDEX = {
  GROUND: 1,
  TREES: 50,
  PORTALS: 100,
  PLAYER_BEHIND: 200, // Player when behind cabin
  CABIN: 250, // Base cabin z-index
  PLAYER_FRONT: 300, // Player when in front of cabin
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
    // The cabin's base position (accounting for scale)
    const CABIN_SCALE = 3.5; // Match the scale in CabinTile.tsx
    const scaledTileSize = tileSize * CABIN_SCALE;

    // Calculate the cabin's visual base (where the player would transition)
    const cabinBaseY = cabinY + scaledTileSize * 0.75; // Transition point at 75% of cabin height

    // If player is behind the cabin (above the base line)
    if (playerMapY < cabinBaseY) {
      // Player is behind cabin
      player.zIndex = Z_INDEX.PLAYER_BEHIND;
    } else {
      // Player is in front of cabin
      player.zIndex = Z_INDEX.PLAYER_FRONT;
    }

    // Update cabin z-index in the map component
    map.cabinZIndex = Z_INDEX.CABIN;
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
