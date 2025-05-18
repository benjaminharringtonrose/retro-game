import { Entity, SystemProps, Direction } from "../../types";
import { TILE_SIZE } from "../../constants/map";
import { findPath, getTileCoords } from "../../utils/pathfinding";

interface InteractionState {
  targetNPC: string | null;
  targetX: number;
  targetY: number;
  isMovingToTarget: boolean;
  currentPath: { x: number; y: number }[];
  currentPathIndex: number;
  lastRecalculationPos?: { x: number; y: number };
}

// Make interaction range smaller than dialog range to ensure we get close enough
const INTERACTION_RANGE = TILE_SIZE * 0.5; // Half a tile distance
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
    console.error("Missing required entities or map data");
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
      targetX: 0,
      targetY: 0,
      isMovingToTarget: false,
      currentPath: [],
      currentPathIndex: 0,
    } as InteractionState;
  }

  // Handle NPC click events
  events.forEach((event) => {
    if (event.type === "npc-click") {
      const npcId = event.payload.npcId;
      const npc = entities[npcId];

      if (npc && npc.absolutePosition) {
        console.log("NPC clicked:", npcId, "at position:", npc.absolutePosition);

        // Calculate target position
        const npcMapX = npc.absolutePosition.x;
        const npcMapY = npc.absolutePosition.y;

        // Get player's map position
        const playerMapX = player.position.x - map.position.x;
        const playerMapY = player.position.y - map.position.y;

        console.log("Player map position:", { playerMapX, playerMapY });
        console.log("Target position:", { npcMapX, npcMapY });

        // Log tile data around the path
        const startTile = getTileCoords(playerMapX, playerMapY);
        const endTile = getTileCoords(npcMapX, npcMapY);
        console.log("Checking tiles from", startTile, "to", endTile);

        // Log a 5x5 area around both start and end positions
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const checkStartX = startTile.tileX + dx;
            const checkStartY = startTile.tileY + dy;
            const checkEndX = endTile.tileX + dx;
            const checkEndY = endTile.tileY + dy;

            if (checkStartY >= 0 && checkStartY < map.tileData.tiles.length && checkStartX >= 0 && checkStartX < map.tileData.tiles[0].length) {
              console.log(`Tile at (${checkStartX},${checkStartY}) near start:`, map.tileData.tiles[checkStartY][checkStartX]);
            }

            if (checkEndY >= 0 && checkEndY < map.tileData.tiles.length && checkEndX >= 0 && checkEndX < map.tileData.tiles[0].length) {
              console.log(`Tile at (${checkEndX},${checkEndY}) near end:`, map.tileData.tiles[checkEndY][checkEndX]);
            }
          }
        }

        // Calculate path
        const path = findPath(playerMapX, playerMapY, npcMapX, npcMapY, map.tileData.tiles);

        if (path.length > 0) {
          console.log("Found path with", path.length, "waypoints:", path);
        } else {
          console.log("No path found - checking walkability of start and end tiles");
          const startWalkable = map.tileData.tiles[startTile.tileY][startTile.tileX] !== 3 && map.tileData.tiles[startTile.tileY][startTile.tileX] !== 3.2;
          const endWalkable = map.tileData.tiles[endTile.tileY][endTile.tileX] !== 3 && map.tileData.tiles[endTile.tileY][endTile.tileX] !== 3.2;
          console.log("Start tile walkable:", startWalkable, "End tile walkable:", endWalkable);
        }

        // Set interaction target and path
        player.interaction.targetNPC = npcId;
        player.interaction.targetX = npcMapX;
        player.interaction.targetY = npcMapY;
        player.interaction.isMovingToTarget = true;
        player.interaction.currentPath = path;
        player.interaction.currentPathIndex = 0;
      } else {
        console.error("Invalid NPC or missing absolutePosition:", npcId);
      }
    }
  });

  // Handle movement to target
  if (player.interaction.isMovingToTarget && player.interaction.targetNPC) {
    const playerMapX = player.position.x - map.position.x;
    const playerMapY = player.position.y - map.position.y;

    const distance = calculateDistance(playerMapX, playerMapY, player.interaction.targetX, player.interaction.targetY);

    if (distance <= INTERACTION_RANGE) {
      console.log("Reached interaction range");
      // We've reached interaction range
      player.interaction.isMovingToTarget = false;
      player.interaction.currentPath = [];
      player.interaction.currentPathIndex = 0;

      // Face the NPC
      const direction = getDirectionToTarget(playerMapX, playerMapY, player.interaction.targetX, player.interaction.targetY);
      player.movement.direction = direction;

      // Stop movement
      player.controls.up = false;
      player.controls.down = false;
      player.controls.left = false;
      player.controls.right = false;
      player.movement.isMoving = false;

      // Trigger dialog
      if (window.gameEngine?.dispatch) {
        window.gameEngine.dispatch({
          type: "npc-click",
          payload: { npcId: player.interaction.targetNPC },
        });
      }
    } else if (player.interaction.currentPath.length > 0) {
      // Follow the calculated path
      const currentTarget = player.interaction.currentPath[player.interaction.currentPathIndex];

      if (!currentTarget) {
        console.log("No current target in path, moving directly to target");
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
      console.log("Distance to waypoint:", waypointDistance);

      if (waypointDistance < CLOSE_TO_WAYPOINT_THRESHOLD) {
        console.log("Moving to next waypoint");
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
            console.log("Recalculating path after moving sufficient distance");
            const newPath = findPath(playerMapX, playerMapY, player.interaction.targetX, player.interaction.targetY, map.tileData.tiles);
            if (newPath.length > 0) {
              player.interaction.currentPath = newPath;
              player.interaction.currentPathIndex = 0;
              player.interaction.lastRecalculationPos = { x: playerMapX, y: playerMapY };
            } else {
              // If no path found, move directly towards target
              console.log("No path found, moving directly towards target");
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
            console.log("Too close to last recalculation position, continuing towards target");
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

        // Determine primary movement direction based on larger delta
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
        console.log("Moving in direction:", player.movement.direction);
      }
    } else {
      console.log("No path available, attempting to find one");
      // No path, try to find one
      const newPath = findPath(playerMapX, playerMapY, player.interaction.targetX, player.interaction.targetY, map.tileData.tiles);
      if (newPath.length > 0) {
        console.log("Found initial path with length:", newPath.length);
        player.interaction.currentPath = newPath;
        player.interaction.currentPathIndex = 0;
        player.interaction.lastRecalculationPos = { x: playerMapX, y: playerMapY };
      } else {
        // If no path found, move directly towards target
        console.log("No path found, moving directly towards target");
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
