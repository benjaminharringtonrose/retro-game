import { Entity, SystemProps } from "../../types";
import { Tile } from "../../types/enums";
import { logger } from "../../utils/logger";

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

export const RenderingSystem = (entities: { [key: string]: Entity }, { time }: SystemProps) => {
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

  // Initialize debug object if it doesn't exist
  if (!map.debug) {
    map.debug = {
      showDebug: false,
      boxes: [],
      renderingDebug: [],
    };
  }

  // Clear previous rendering debug info
  map.debug.renderingDebug = [];

  // For each cabin tile, determine if the player is behind or in front of it
  cabinTiles.forEach(({ y: cabinY, row, col }) => {
    // The cabin's base position (accounting for scale)
    const CABIN_SCALE = 3.5; // Match the scale in CabinTile.tsx
    const scaledTileSize = tileSize * CABIN_SCALE;

    // Calculate the cabin's visual base (where the player would transition)
    // Moved transition point to 25% of cabin height to be closer to the front
    const cabinBaseY = cabinY;

    // Since Y increases downward in our coordinate system,
    // player is behind cabin when their Y is less than the cabin's base Y
    const isBehindCabin = playerMapY < cabinBaseY;

    // Log the current state
    const debugInfo = {
      cabin: {
        position: { row, col, y: cabinY },
        baseY: cabinBaseY,
        scale: CABIN_SCALE,
        zIndex: Z_INDEX.CABIN,
      },
      player: {
        screenPosition: { x: player.position.x, y: player.position.y },
        mapPosition: { x: player.position.x - map.position.x, y: playerMapY },
        isBehindCabin,
      },
      zIndices: {
        player: isBehindCabin ? Z_INDEX.PLAYER_BEHIND : Z_INDEX.PLAYER_FRONT,
        cabin: Z_INDEX.CABIN,
      },
    };

    // Store debug info
    map.debug.renderingDebug.push(debugInfo);

    if (time.current % 1000 < 16) {
      // Log to console
      logger.debug("RenderingSystem", `Cabin at (${row}, ${col}):`, {
        cabinBaseY,
        playerMapY,
        isBehindCabin,
        playerZIndex: debugInfo.zIndices.player,
        cabinZIndex: Z_INDEX.CABIN,
      });
    }

    // If player is behind the cabin (above the base line)
    if (isBehindCabin) {
      // Player is behind cabin
      player.zIndex = Z_INDEX.PLAYER_BEHIND;
      map.debug.cabinZIndex = Z_INDEX.CABIN;
      if (time.current % 1000 < 16) {
        logger.debug("RenderingSystem", "Player is BEHIND cabin");
      }
    } else {
      // Player is in front of cabin
      player.zIndex = Z_INDEX.PLAYER_FRONT;
      map.debug.cabinZIndex = Z_INDEX.CABIN;
      if (time.current % 1000 < 16) {
        logger.debug("RenderingSystem", "Player is IN FRONT OF cabin");
      }
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
