import { Entity, SystemProps } from "../../types";
import { Tile } from "../../types/enums";
import { logger } from "../../utils/logger";
import { ZIndexService } from "../../services/ZIndexService";
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

  // Get all building (cabin) positions
  const { tiles, tileSize } = map.tileData;
  const buildingPositions: { baseY: number }[] = [];

  // Find all building tiles and their positions
  tiles.forEach((row: number[], rowIndex: number) => {
    row.forEach((tile: number, colIndex: number) => {
      if (tile === Tile.Cabin) {
        buildingPositions.push({
          baseY: rowIndex * tileSize,
        });
      }
    });
  });

  // Initialize debug object if it doesn't exist
  if (!map.debug) {
    map.debug = {
      showDebug: false,
      boxes: [],
      renderingDebug: [],
      cabinZIndex: Z_INDEX.BUILDINGS,
    };
  }

  // Clear previous rendering debug info
  map.debug.renderingDebug = [];

  // Determine if player is behind any cabin
  let isPlayerBehindAnyBuilding = false;
  buildingPositions.forEach(({ baseY }) => {
    if (ZIndexService.isEntityBehindBuilding(playerMapPos, baseY)) {
      isPlayerBehindAnyBuilding = true;
    }
  });

  // Update player z-index
  player.zIndex = isPlayerBehindAnyBuilding ? Z_INDEX.BUILDING_BEHIND : Z_INDEX.BUILDING_FRONT;

  // Set cabin z-index in map debug
  map.debug.cabinZIndex = Z_INDEX.BUILDINGS;

  // Debug logging
  if (time.current % 1000 < 16) {
    buildingPositions.forEach(({ baseY }, index) => {
      const isBehind = ZIndexService.isEntityBehindBuilding(playerMapPos, baseY);
      logger.debug("RenderingSystem", `Building ${index}:`, {
        buildingBaseY: baseY,
        playerMapY: playerMapPos.y,
        isBehind,
        playerZIndex: player.zIndex,
        cabinZIndex: map.debug.cabinZIndex,
      });
    });
  }

  return entities;
};
