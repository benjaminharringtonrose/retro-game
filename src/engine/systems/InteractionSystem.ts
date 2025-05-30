import { Entity, SystemProps, Direction } from "../../types";
import { TILE_SIZE } from "../../constants/map";
import { findPath } from "../../utils/pathfinding";
import { getTileCoords } from "../../utils/coordinates";
import { logger } from "../../utils/logger";
import { PORTAL_CONFIGS } from "../../config/portals";

interface InteractionState {
  targetNPC: string | null;
  targetPortal: string | null;
  targetX: number;
  targetY: number;
  isMovingToTarget: boolean;
  currentPath: { x: number; y: number }[];
  currentPathIndex: number;
  lastRecalculationPos?: { x: number; y: number };
}

// Make interaction range smaller than dialog range to ensure we get close enough
const NPC_INTERACTION_RANGE = TILE_SIZE * 0.5; // Half a tile distance for NPCs
const PORTAL_INTERACTION_RANGE = TILE_SIZE * 0.2; // Much closer for portals
const MIN_RECALCULATION_DISTANCE = TILE_SIZE * 0.25; // Only recalculate path if we've moved at least 1/4 tile
const CLOSE_TO_WAYPOINT_THRESHOLD = TILE_SIZE * 0.2; // Consider we've reached waypoint when within 1/5 tile

const calculateDistance = (x1: number, y1: number, x2: number, y2: number): number => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
};

const getDirectionToTarget = (currentX: number, currentY: number, targetX: number, targetY: number): Direction => {
  const dx = targetX - currentX;
  const dy = targetY - currentY;

  // Use the larger difference to determine primary direction
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? Direction.Right : Direction.Left;
  } else {
    return dy > 0 ? Direction.Down : Direction.Up;
  }
};

export const InteractionSystem = (entities: { [key: string]: Entity }, { events = [] }: SystemProps) => {
  const player = entities["player-1"];
  const map = entities["map-1"];
  const dialog = entities["dialog-1"];

  if (!player || !map || !map.tileData || !map.tileData.tiles) {
    logger.error("Dialog", "Missing required entities or map data");
    return entities;
  }

  // If dialog is visible, don't process interactions
  if (dialog?.isVisible) {
    return entities;
  }

  // Initialize or get interaction state
  if (!player.interaction) {
    player.interaction = {
      targetNPC: null,
      targetPortal: null,
      targetX: 0,
      targetY: 0,
      isMovingToTarget: false,
      currentPath: [],
      currentPathIndex: 0,
    } as InteractionState;
  }

  // Handle NPC and Portal click events
  events.forEach((event) => {
    // Check for manual movement input from the Pad
    // If any direction is being pressed, cancel auto-walking
    if (event.type === "move") {
      player.interaction.isMovingToTarget = false;
      player.interaction.currentPath = [];
      player.interaction.currentPathIndex = 0;
      player.interaction.targetNPC = null;
      player.interaction.targetPortal = null;
      return entities;
    }

    if (event.type === "npc-click") {
      const npcId = event.payload.npcId;
      const npc = entities[npcId];

      if (npc && npc.absolutePosition) {
        logger.log("Dialog", `NPC clicked: ${npcId} at position:`, npc.absolutePosition);

        // Calculate target position
        const npcMapX = npc.absolutePosition.x;
        const npcMapY = npc.absolutePosition.y;

        // Get player's map position
        const playerMapX = player.position.x - map.position.x;
        const playerMapY = player.position.y - map.position.y;

        logger.log("Dialog", "Player map position:", { playerMapX, playerMapY });
        logger.log("Dialog", "Target position:", { npcMapX, npcMapY });

        // Log tile data around the path
        const startTile = getTileCoords(playerMapX, playerMapY);
        const endTile = getTileCoords(npcMapX, npcMapY);
        logger.log("Dialog", "Checking tiles from", startTile, "to", endTile);

        // Log a 5x5 area around both start and end positions
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const checkStartX = startTile.tileX + dx;
            const checkStartY = startTile.tileY + dy;
            const checkEndX = endTile.tileX + dx;
            const checkEndY = endTile.tileY + dy;

            if (checkStartY >= 0 && checkStartY < map.tileData.tiles.length && checkStartX >= 0 && checkStartX < map.tileData.tiles[0].length) {
              logger.debug("Dialog", `Tile at (${checkStartX},${checkStartY}) near start:`, map.tileData.tiles[checkStartY][checkStartX]);
            }

            if (checkEndY >= 0 && checkEndY < map.tileData.tiles.length && checkEndX >= 0 && checkEndX < map.tileData.tiles[0].length) {
              logger.debug("Dialog", `Tile at (${checkEndX},${checkEndY}) near end:`, map.tileData.tiles[checkEndY][checkEndX]);
            }
          }
        }

        // Calculate path
        const path = findPath(playerMapX, playerMapY, npcMapX, npcMapY, map.tileData.tiles);

        if (path.length > 0) {
          logger.log("Dialog", "Found path with", path.length, "waypoints:", path);
        } else {
          logger.log("Dialog", "No path found - checking walkability of start and end tiles");
          const startWalkable = map.tileData.tiles[startTile.tileY][startTile.tileX] !== 3 && map.tileData.tiles[startTile.tileY][startTile.tileX] !== 3.2;
          const endWalkable = map.tileData.tiles[endTile.tileY][endTile.tileX] !== 3 && map.tileData.tiles[endTile.tileY][endTile.tileX] !== 3.2;
          logger.log("Dialog", "Start tile walkable:", startWalkable, "End tile walkable:", endWalkable);
        }

        // Set interaction target and path
        player.interaction.targetPortal = null;
        player.interaction.targetNPC = npcId;
        player.interaction.targetX = npcMapX;
        player.interaction.targetY = npcMapY;
        player.interaction.isMovingToTarget = true;
        player.interaction.currentPath = path;
        player.interaction.currentPathIndex = 0;
      } else {
        logger.error("Dialog", "Invalid NPC or missing absolutePosition:", npcId);
      }
    } else if (event.type === "portal-click") {
      const portalId = event.payload.portalId;
      const portal = entities[portalId];
      const config = PORTAL_CONFIGS[portalId];

      if (portal && config) {
        logger.log("Portal", `Portal clicked: ${portalId} at position:`, config.position);

        // Clear any NPC target
        player.interaction.targetNPC = null;
        player.interaction.targetPortal = portalId;

        // Target the bottom center of the portal using its fixed map position
        player.interaction.targetX = config.position.x + portal.dimensions.width / 2;
        player.interaction.targetY = config.position.y + portal.dimensions.height / 2;
        player.interaction.isMovingToTarget = true;
        player.interaction.currentPath = findPath(player.position.x - map.position.x, player.position.y - map.position.y, player.interaction.targetX, player.interaction.targetY, map.tileData.tiles);
        player.interaction.currentPathIndex = 0;
      }
    }
  });

  // Handle movement to target
  if (player.interaction.isMovingToTarget) {
    const playerMapX = player.position.x - map.position.x;
    const playerMapY = player.position.y - map.position.y;

    const distance = calculateDistance(playerMapX, playerMapY, player.interaction.targetX, player.interaction.targetY);

    // Use different interaction ranges for NPCs vs portals
    const interactionRange = player.interaction.targetPortal ? PORTAL_INTERACTION_RANGE : NPC_INTERACTION_RANGE;

    if (distance <= interactionRange) {
      logger.log("Dialog", "Reached interaction range");
      // We've reached interaction range
      player.interaction.isMovingToTarget = false;
      player.interaction.currentPath = [];
      player.interaction.currentPathIndex = 0;

      // Face the target
      const direction = getDirectionToTarget(playerMapX, playerMapY, player.interaction.targetX, player.interaction.targetY);
      player.movement.direction = direction;

      // Stop movement
      player.controls.up = false;
      player.controls.down = false;
      player.controls.left = false;
      player.controls.right = false;
      player.movement.isMoving = false;

      // Trigger appropriate interaction based on target type
      if (player.interaction.targetNPC && window.gameEngine?.dispatch) {
        window.gameEngine.dispatch({
          type: "npc-click",
          payload: { npcId: player.interaction.targetNPC },
        });
      }
    } else if (player.interaction.currentPath.length > 0) {
      // Follow the calculated path
      const currentTarget = player.interaction.currentPath[player.interaction.currentPathIndex];

      if (!currentTarget) {
        logger.log("Dialog", "No current target in path, moving directly to target");
        // Move directly towards the target
        const dx = player.interaction.targetX - playerMapX;
        const dy = player.interaction.targetY - playerMapY;

        if (Math.abs(dx) > Math.abs(dy)) {
          player.controls.left = dx < 0;
          player.controls.right = dx > 0;
          player.controls.up = false;
          player.controls.down = false;
          player.movement.direction = dx < 0 ? Direction.Left : Direction.Right;
        } else {
          player.controls.up = dy < 0;
          player.controls.down = dy > 0;
          player.controls.left = false;
          player.controls.right = false;
          player.movement.direction = dy < 0 ? Direction.Up : Direction.Down;
        }
        player.movement.isMoving = true;
        return entities;
      }

      // Calculate distance to current waypoint
      const waypointDistance = calculateDistance(playerMapX, playerMapY, currentTarget.x, currentTarget.y);
      logger.debug("Dialog", "Distance to waypoint:", waypointDistance);

      if (waypointDistance < CLOSE_TO_WAYPOINT_THRESHOLD) {
        logger.log("Dialog", "Moving to next waypoint");
        // Move to next waypoint
        player.interaction.currentPathIndex++;

        // If we've reached the end of the path, only recalculate if we're far enough from the last position
        if (player.interaction.currentPathIndex >= player.interaction.currentPath.length) {
          // Store the last recalculation position if not set
          if (!player.interaction.lastRecalculationPos) {
            player.interaction.lastRecalculationPos = { x: playerMapX, y: playerMapY };
          }

          const distanceSinceLastRecalculation = calculateDistance(playerMapX, playerMapY, player.interaction.lastRecalculationPos.x, player.interaction.lastRecalculationPos.y);

          if (distanceSinceLastRecalculation > MIN_RECALCULATION_DISTANCE) {
            logger.log("Dialog", "Recalculating path after moving sufficient distance");
            const newPath = findPath(playerMapX, playerMapY, player.interaction.targetX, player.interaction.targetY, map.tileData.tiles);
            if (newPath.length > 0) {
              player.interaction.currentPath = newPath;
              player.interaction.currentPathIndex = 0;
              player.interaction.lastRecalculationPos = { x: playerMapX, y: playerMapY };
            } else {
              // If no path found, move directly towards target
              logger.log("Dialog", "No path found, moving directly towards target");
              const dx = player.interaction.targetX - playerMapX;
              const dy = player.interaction.targetY - playerMapY;

              if (Math.abs(dx) > Math.abs(dy)) {
                player.controls.left = dx < 0;
                player.controls.right = dx > 0;
                player.controls.up = false;
                player.controls.down = false;
                player.movement.direction = dx < 0 ? Direction.Left : Direction.Right;
              } else {
                player.controls.up = dy < 0;
                player.controls.down = dy > 0;
                player.controls.left = false;
                player.controls.right = false;
                player.movement.direction = dy < 0 ? Direction.Up : Direction.Down;
              }
              player.movement.isMoving = true;
            }
          } else {
            // If we're too close to the last recalculation position, just keep moving towards the target
            logger.log("Dialog", "Too close to last recalculation position, continuing towards target");
            const dx = player.interaction.targetX - playerMapX;
            const dy = player.interaction.targetY - playerMapY;

            if (Math.abs(dx) > Math.abs(dy)) {
              player.controls.left = dx < 0;
              player.controls.right = dx > 0;
              player.controls.up = false;
              player.controls.down = false;
              player.movement.direction = dx < 0 ? Direction.Left : Direction.Right;
            } else {
              player.controls.up = dy < 0;
              player.controls.down = dy > 0;
              player.controls.left = false;
              player.controls.right = false;
              player.movement.direction = dy < 0 ? Direction.Up : Direction.Down;
            }
            player.movement.isMoving = true;
          }
        }
      } else {
        // Move towards current waypoint
        const dx = currentTarget.x - playerMapX;
        const dy = currentTarget.y - playerMapY;

        // Set diagonal movement based on relative magnitudes
        const useDiagonal = Math.abs(dx) * 0.7 <= Math.abs(dy) && Math.abs(dy) * 0.7 <= Math.abs(dx);

        if (useDiagonal) {
          // Diagonal movement
          player.controls.left = dx < 0;
          player.controls.right = dx > 0;
          player.controls.up = dy < 0;
          player.controls.down = dy > 0;

          // Set diagonal direction
          if (dx > 0 && dy < 0) {
            player.movement.direction = Direction.UpRight;
          } else if (dx > 0 && dy > 0) {
            player.movement.direction = Direction.DownRight;
          } else if (dx < 0 && dy > 0) {
            player.movement.direction = Direction.DownLeft;
          } else {
            player.movement.direction = Direction.UpLeft;
          }
        } else {
          // Cardinal movement (when one direction is dominant)
          if (Math.abs(dx) > Math.abs(dy)) {
            player.controls.left = dx < 0;
            player.controls.right = dx > 0;
            player.controls.up = false;
            player.controls.down = false;
            player.movement.direction = dx < 0 ? Direction.Left : Direction.Right;
          } else {
            player.controls.up = dy < 0;
            player.controls.down = dy > 0;
            player.controls.left = false;
            player.controls.right = false;
            player.movement.direction = dy < 0 ? Direction.Up : Direction.Down;
          }
        }

        player.movement.isMoving = true;
        logger.log("Dialog", "Moving in direction:", player.movement.direction);
      }
    } else {
      logger.log("Dialog", "No path available, attempting to find one");
      // No path, try to find one
      const newPath = findPath(playerMapX, playerMapY, player.interaction.targetX, player.interaction.targetY, map.tileData.tiles);
      if (newPath.length > 0) {
        logger.log("Dialog", "Found initial path with length:", newPath.length);
        player.interaction.currentPath = newPath;
        player.interaction.currentPathIndex = 0;
        player.interaction.lastRecalculationPos = { x: playerMapX, y: playerMapY };
      } else {
        // If no path found, move directly towards target
        logger.log("Dialog", "No path found, moving directly towards target");
        const dx = player.interaction.targetX - playerMapX;
        const dy = player.interaction.targetY - playerMapY;

        if (Math.abs(dx) > Math.abs(dy)) {
          player.controls.left = dx < 0;
          player.controls.right = dx > 0;
          player.controls.up = false;
          player.controls.down = false;
          player.movement.direction = dx < 0 ? Direction.Left : Direction.Right;
        } else {
          player.controls.up = dy < 0;
          player.controls.down = dy > 0;
          player.controls.left = false;
          player.controls.right = false;
          player.movement.direction = dy < 0 ? Direction.Up : Direction.Down;
        }
        player.movement.isMoving = true;
      }
    }
  }

  return entities;
};
