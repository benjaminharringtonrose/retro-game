import { Entity, SystemProps } from "../../types";
import { Tile } from "../../types/enums";
import { logger } from "../../utils/logger";
import { Z_INDEX } from "../../constants/zIndex";

export const RenderingSystem = (entities: { [key: string]: Entity }, { time }: SystemProps) => {
  const player = entities["player-1"];
  const map = entities["map-1"];

  if (!player?.position || !map?.position || !map.tileData) {
    return entities;
  }

  // Calculate player's position relative to the map
  const playerMapPos = {
    x: player.position.x - map.position.x,
    y: player.position.y - map.position.y,
  };

  // Get all cabin tiles
  const { tiles, tileSize } = map.tileData;
  const cabinTiles: { row: number; col: number; y: number }[] = [];

  // Find all cabin tiles and their positions
  tiles.forEach((row: number[], rowIndex: number) => {
    row.forEach((tile: number, colIndex: number) => {
      if (tile === Tile.Cabin) {
        const tileY = rowIndex * tileSize;
        cabinTiles.push({ row: rowIndex, col: colIndex, y: tileY });
      }
    });
  });

  // Initialize debug object if it doesn't exist
  if (!map.debug) {
    map.debug = {
      showDebug: false,
      boxes: [],
      renderingDebug: [],
      objectZIndex: Z_INDEX.CABIN_FRONT,
    };
  }

  // For each cabin tile, determine if the player is behind or in front of it
  cabinTiles.forEach(({ y: cabinY }, index) => {
    // The cabin's collision area starts a bit above its base

    // If player is behind the cabin
    if (playerMapPos.y < cabinY) {
      // Player should render below cabin
      player.zIndex = Z_INDEX.PLAYER;
    } else {
      // Player should render above cabin
      player.zIndex = Z_INDEX.CABIN_FRONT + 1;
    }

    // Debug logging
    if (time.current % 1000 < 16) {
      logger.debug("RenderingSystem", `Building ${index}:`, {
        buildingBaseY: cabinY,
        playerMapY: playerMapPos.y,
        isBehind: playerMapPos.y < cabinY,
        playerZIndex: player.zIndex,
        objectZIndex: map.debug.objectZIndex,
        tile: "Cabin",
      });
    }
  });

  // Update z-indices for all other entities
  Object.entries(entities).forEach(([id, entity]) => {
    if (id.startsWith("portal-")) {
      entity.zIndex = Z_INDEX.PORTALS;
    } else if (id.startsWith("npc-")) {
      entity.zIndex = Z_INDEX.NPCS;
    } else if (id === "dialog-1") {
      entity.zIndex = Z_INDEX.DIALOG;
    }
  });

  return entities;
};
