import { Entity, SystemProps, Direction } from "../../types";
import { Dimensions } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Screen edge margins
const EDGE_MARGIN = 20;

// Logging helper to prevent spam
let lastLogTime = 0;
const LOG_INTERVAL = 500; // Only log every 500ms max

const debugLog = (message: string, force = false) => {
  const now = Date.now();
  if (force || now - lastLogTime > LOG_INTERVAL) {
    console.log(`[Movement] ${message}`);
    lastLogTime = now;
  }
};

export const MovementSystem = (entities: { [key: string]: Entity }, { time, delta = 16.666 }: SystemProps) => {
  const player = entities["player-1"];
  const map = entities["map-1"];

  if (!player?.controls || !map?.position) {
    return entities;
  }

  // Ensure delta is a valid number and convert to seconds
  const deltaSeconds = (typeof delta === "number" && delta > 0 ? delta : 16.666) / 1000;

  let deltaX = 0;
  let deltaY = 0;
  const speed = player.movement.speed * deltaSeconds;

  // Check collision state
  const blocked = player.collision?.blocked || {
    up: false,
    down: false,
    left: false,
    right: false,
  };

  if (player.controls.up && !blocked.up) {
    deltaY = -speed;
    player.movement.direction = Direction.Up;
    player.movement.isMoving = true;
  } else if (player.controls.down && !blocked.down) {
    deltaY = speed;
    player.movement.direction = Direction.Down;
    player.movement.isMoving = true;
  }

  if (player.controls.left && !blocked.left) {
    deltaX = -speed;
    player.movement.direction = Direction.Left;
    player.movement.isMoving = true;
  } else if (player.controls.right && !blocked.right) {
    deltaX = speed;
    player.movement.direction = Direction.Right;
    player.movement.isMoving = true;
  }

  if (!deltaX && !deltaY) {
    player.movement.isMoving = false;
    return entities;
  }

  // Calculate center position
  const centerX = screenWidth / 2;
  const centerY = screenHeight / 2;

  if (map.bounds) {
    // Handle X movement
    if (deltaX !== 0) {
      const newMapX = map.position.x - deltaX;
      const canMoveMapX = newMapX <= map.bounds.maxX && newMapX >= map.bounds.minX;
      const newPlayerX = player.position.x + deltaX;

      // Check if player would cross center
      const wouldCrossCenterX = (deltaX < 0 && player.position.x > centerX && newPlayerX <= centerX) || (deltaX > 0 && player.position.x < centerX && newPlayerX >= centerX);

      if (canMoveMapX && (player.position.x === centerX || wouldCrossCenterX)) {
        debugLog(`Moving map X: ${map.position.x} -> ${newMapX}`);
        map.position.x = newMapX;
        player.position.x = centerX;
      } else if (!blocked.left && !blocked.right) {
        player.position.x = Math.min(Math.max(newPlayerX, EDGE_MARGIN), screenWidth - EDGE_MARGIN);
      }
    }

    // Handle Y movement
    if (deltaY !== 0) {
      const newMapY = map.position.y - deltaY;
      const canMoveMapY = newMapY <= map.bounds.maxY && newMapY >= map.bounds.minY;
      const newPlayerY = player.position.y + deltaY;

      // Check if player would cross center
      const wouldCrossCenterY = (deltaY < 0 && player.position.y > centerY && newPlayerY <= centerY) || (deltaY > 0 && player.position.y < centerY && newPlayerY >= centerY);

      debugLog(`Y Movement - Player: ${player.position.y.toFixed(2)}, New: ${newPlayerY.toFixed(2)}, Center: ${centerY}, Delta: ${deltaY.toFixed(2)}, Can move map: ${canMoveMapY}, Would cross: ${wouldCrossCenterY}`);

      if (canMoveMapY && (player.position.y === centerY || wouldCrossCenterY)) {
        // If map can move and player is at or crossing center, move map and center player
        debugLog(`Moving map Y: ${map.position.y} -> ${newMapY}`);
        map.position.y = newMapY;
        player.position.y = centerY;
      } else if (!blocked.up && !blocked.down) {
        // Otherwise move player within screen bounds
        const boundedY = Math.min(Math.max(newPlayerY, EDGE_MARGIN), screenHeight - EDGE_MARGIN);
        player.position.y = boundedY;
        debugLog(`Moving player Y: ${player.position.y} -> ${boundedY}`);
      }
    }
  }

  return entities;
};
