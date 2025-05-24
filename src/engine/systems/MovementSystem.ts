import { Entity, SystemProps, Direction, MapType } from "../../types";
import { Dimensions } from "react-native";
import { DEFAULT_MAPS } from "../../constants/map";

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

// Helper to get the closest cardinal direction based on movement deltas
const getClosestDirection = (deltaX: number, deltaY: number): Direction => {
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    return deltaX > 0 ? Direction.Right : Direction.Left;
  } else {
    return deltaY > 0 ? Direction.Down : Direction.Up;
  }
};

export const MovementSystem = (entities: { [key: string]: Entity }, { time, delta = 16.666 }: SystemProps) => {
  const player = entities["player-1"];
  const map = entities["map-1"];

  if (!player?.controls || !map?.position || !map.dimensions) {
    return entities;
  }

  // Get movement type from map config
  const mapData = DEFAULT_MAPS[map.mapType as keyof typeof DEFAULT_MAPS];
  const isFixedMap = mapData?.movementType === "fixed";

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

  // Calculate movement deltas based on controls
  if (player.controls.up && !blocked.up) {
    deltaY = -speed;
  }
  if (player.controls.down && !blocked.down) {
    deltaY = speed;
  }
  if (player.controls.left && !blocked.left) {
    deltaX = -speed;
  }
  if (player.controls.right && !blocked.right) {
    deltaX = speed;
  }

  // If moving diagonally, normalize the speed
  if (deltaX !== 0 && deltaY !== 0) {
    const normalizer = Math.sqrt(2);
    deltaX /= normalizer;
    deltaY /= normalizer;
  }

  if (deltaX === 0 && deltaY === 0) {
    player.movement.isMoving = false;
    return entities;
  }

  // Update movement direction based on the dominant axis
  player.movement.direction = getClosestDirection(deltaX, deltaY);
  player.movement.isMoving = true;

  // Calculate center position
  const centerX = screenWidth / 2;
  const centerY = screenHeight / 2;

  if (map.bounds) {
    if (isFixedMap) {
      // For fixed maps, only move the player within the visible map area
      const mapLeft = map.position.x;
      const mapRight = mapLeft + map.dimensions.width;
      const mapTop = map.position.y;
      const mapBottom = mapTop + map.dimensions.height;
      const playerWidth = player.dimensions?.width || 32;
      const playerHeight = player.dimensions?.height || 40;

      // Calculate new player position
      const newPlayerX = player.position.x + deltaX;
      const newPlayerY = player.position.y + deltaY;

      // Keep player within map bounds
      if (!blocked.left && !blocked.right) {
        player.position.x = Math.min(Math.max(newPlayerX, mapLeft + playerWidth / 2), mapRight - playerWidth / 2);
      }
      if (!blocked.up && !blocked.down) {
        player.position.y = Math.min(Math.max(newPlayerY, mapTop + playerHeight / 2), mapBottom - playerHeight / 2);
      }

      // Log position occasionally for debugging
      if (time % 1000 < 16) {
        console.log(`[Movement] Fixed map bounds: left=${mapLeft}, right=${mapRight}, top=${mapTop}, bottom=${mapBottom}`);
        console.log(`[Movement] Player position: x=${player.position.x}, y=${player.position.y}`);
      }
    } else {
      // Handle scrolling maps
      // Handle X movement
      if (deltaX !== 0) {
        const newMapX = map.position.x - deltaX;
        const canMoveMapX = newMapX <= map.bounds.maxX && newMapX >= map.bounds.minX;
        const newPlayerX = player.position.x + deltaX;
        const wouldCrossCenterX = (deltaX < 0 && player.position.x > centerX && newPlayerX <= centerX) || (deltaX > 0 && player.position.x < centerX && newPlayerX >= centerX);

        if (canMoveMapX && (player.position.x === centerX || wouldCrossCenterX)) {
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
        const wouldCrossCenterY = (deltaY < 0 && player.position.y > centerY && newPlayerY <= centerY) || (deltaY > 0 && player.position.y < centerY && newPlayerY >= centerY);

        if (canMoveMapY && (player.position.y === centerY || wouldCrossCenterY)) {
          map.position.y = newMapY;
          player.position.y = centerY;
        } else if (!blocked.up && !blocked.down) {
          player.position.y = Math.min(Math.max(newPlayerY, EDGE_MARGIN), screenHeight - EDGE_MARGIN);
        }
      }
    }
  }

  return entities;
};
