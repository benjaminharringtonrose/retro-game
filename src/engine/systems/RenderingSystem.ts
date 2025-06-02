import { Entity, SystemProps } from "../../types";
import { Tile } from "../../types/enums";
import { logger } from "../../utils/logger";
import { Z_INDEX } from "../../constants/zIndex";
import { CABIN_SCALE } from "../../components/CabinTile";

interface ObjectProperties {
  scale: number;
  name: string;
}

// Define interactive objects and their properties
const INTERACTIVE_OBJECTS: Record<number, ObjectProperties> = {
  [Tile.Cabin]: { scale: CABIN_SCALE, name: "Cabin" },
  [Tile.Tree]: { scale: 1.5, name: "Tree" },
  [Tile.Tree2]: { scale: 1.5, name: "Tree2" },
};

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

  // Get all interactive object tiles
  const { tiles, tileSize } = map.tileData;
  const objectTiles: { row: number; col: number; y: number; x: number; type: Tile }[] = [];

  // Find all interactive object tiles and their positions
  tiles.forEach((row: number[], rowIndex: number) => {
    row.forEach((tile: number, colIndex: number) => {
      if (tile in INTERACTIVE_OBJECTS) {
        objectTiles.push({
          row: rowIndex,
          col: colIndex,
          y: rowIndex * tileSize,
          x: colIndex * tileSize,
          type: tile as Tile,
        });
      }
    });
  });

  map.objectZIndex = Z_INDEX.OBJECT;

  // Default player z-index when not near any object
  player.zIndex = Z_INDEX.OBJECT + 1;

  // For each object tile, determine if the player is behind or in front of it
  objectTiles.forEach(({ y: objectY, x: objectX, type }, index) => {
    const objectProps = INTERACTIVE_OBJECTS[type];
    const scaledSize = tileSize * objectProps.scale;
    const interactionRange = scaledSize / 2;

    // Check if player is within interaction range
    const horizontalDistance = Math.abs(playerMapPos.x - (objectX + tileSize / 2));
    const verticalDistance = Math.abs(playerMapPos.y - objectY);
    const isNearObject = horizontalDistance < interactionRange && verticalDistance < scaledSize;

    if (isNearObject) {
      // If player is behind the object
      if (playerMapPos.y < objectY) {
        player.zIndex = Z_INDEX.PLAYER;
      } else {
        player.zIndex = Z_INDEX.OBJECT + 1;
      }

      // Debug logging
      if (time.current % 1000 < 16) {
        logger.debug("Rendering", `${objectProps.name} ${index}:`, {
          objectBaseY: objectY,
          objectX,
          playerMapY: playerMapPos.y,
          playerMapX: playerMapPos.x,
          horizontalDistance,
          verticalDistance,
          isNearObject,
          isBehind: playerMapPos.y < objectY,
          playerZIndex: player.zIndex,
          objectZIndex: map.objectZIndex,
          type: objectProps.name,
        });
      }
    }
  });

  // Update z-indices for all other entities
  Object.entries(entities).forEach(([id, entity]) => {
    if (id.startsWith("portal-")) {
      entity.zIndex = Z_INDEX.OBJECT;
    } else if (id.startsWith("npc-")) {
      entity.zIndex = Z_INDEX.NPCS;
    } else if (id === "dialog-1") {
      entity.zIndex = Z_INDEX.DIALOG;
    }
  });

  return entities;
};
