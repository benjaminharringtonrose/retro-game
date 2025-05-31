import { Entity, SystemProps, Direction } from "../../types";
import { Dimensions } from "react-native";
import { DEFAULT_MAPS } from "../../constants/map";
import { mapManager } from "../../managers/MapManager";
import { logger } from "../../utils/logger";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Helper to get the closest cardinal direction based on movement deltas
const getClosestDirection = (deltaX: number, deltaY: number): Direction => {
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    return deltaX > 0 ? Direction.Right : Direction.Left;
  } else {
    return deltaY > 0 ? Direction.Down : Direction.Up;
  }
};

export const MovementSystem = (entities: { [key: string]: Entity }, props: SystemProps) => {
  const player = entities["player-1"];
  const map = entities["map-1"];

  if (!player?.controls || !map?.position || !map.dimensions) {
    return entities;
  }

  // Get movement type from map config
  const mapData = DEFAULT_MAPS[map.mapType as keyof typeof DEFAULT_MAPS];
  const isFixedMap = mapData?.movementType === "fixed";

  // Delta convert to seconds
  const deltaSeconds = props.time.delta / 1000;

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
      if (props.time.current % 1000 < 16) {
        logger.log("Movement", `[Movement] Fixed map bounds: left=${mapLeft}, right=${mapRight}, top=${mapTop}, bottom=${mapBottom}`);
        logger.log("Movement", `[Movement] Player position: x=${player.position.x}, y=${player.position.y}`);
      }
    } else {
      // Handle scrolling maps
      // Handle X and Y movement together for diagonal movement
      if (deltaX !== 0 || deltaY !== 0) {
        const newPlayerX = player.position.x + deltaX;
        const newPlayerY = player.position.y + deltaY;
        const mapLeft = map.position.x;
        const mapRight = mapLeft + map.dimensions.width;
        const mapTop = map.position.y;
        const mapBottom = mapTop + map.dimensions.height;
        const playerWidth = player.dimensions?.width || 32;
        const playerHeight = player.dimensions?.height || 40;

        logger.log("Movement", `[Movement] Current position: (${player.position.x}, ${player.position.y}), Attempting move to: (${newPlayerX}, ${newPlayerY})`);
        logger.log("Movement", `[Movement] Map bounds - Left: ${mapLeft}, Right: ${mapRight}, Top: ${mapTop}, Bottom: ${mapBottom}`);

        // Check if we can scroll in either direction
        const canScrollLeft = map.position.x < 0;
        const canScrollRight = map.position.x > -(map.dimensions.width - screenWidth);
        const canScrollUp = map.position.y < 0;
        const canScrollDown = map.position.y > -(map.dimensions.height - screenHeight);

        logger.log("Movement", `[Movement] Can scroll? Left: ${canScrollLeft}, Right: ${canScrollRight}, Up: ${canScrollUp}, Down: ${canScrollDown}`);

        // Try to scroll the map first
        let mapScrolledX = false;
        let mapScrolledY = false;
        try {
          // Determine if we should scroll based on player position and movement direction
          const shouldAttemptScrollX =
            (deltaX > 0 && player.position.x > centerX && canScrollRight) || // Moving right and can scroll right
            (deltaX < 0 && player.position.x < centerX && canScrollLeft); // Moving left and can scroll left

          const shouldAttemptScrollY =
            (deltaY > 0 && player.position.y > centerY && canScrollDown) || // Moving down and can scroll down
            (deltaY < 0 && player.position.y < centerY && canScrollUp); // Moving up and can scroll up

          // Check if we should attempt scrolling in either direction
          if ((deltaX !== 0 && shouldAttemptScrollX) || (deltaY !== 0 && shouldAttemptScrollY)) {
            // Only apply the movement vector for the axes that should scroll
            const scrollDeltaX = shouldAttemptScrollX ? deltaX : 0;
            const scrollDeltaY = shouldAttemptScrollY ? deltaY : 0;

            logger.log("Movement", `[Movement] Attempting scroll with deltas: (${scrollDeltaX}, ${scrollDeltaY})`);

            // Apply the filtered movement vector
            const scrolled = mapManager.updateMapScroll(map, scrollDeltaX, scrollDeltaY);

            // Track which axes actually scrolled
            if (scrolled) {
              if (shouldAttemptScrollX) mapScrolledX = true;
              if (shouldAttemptScrollY) mapScrolledY = true;
            }

            // Only reset position on the axis that actually scrolled
            // And only if we're moving in that direction
            if (mapScrolledX && deltaX !== 0) {
              // Smoothly move towards center when scrolling
              const distanceToCenterX = centerX - player.position.x;
              player.position.x += distanceToCenterX * 0.5; // Move 50% of the way to center each frame
            }
            if (mapScrolledY && deltaY !== 0) {
              // Smoothly move towards center when scrolling
              const distanceToCenterY = centerY - player.position.y;
              player.position.y += distanceToCenterY * 0.5; // Move 50% of the way to center each frame
            }
          }
        } catch (error) {
          logger.error("Movement", `[Movement] Error during map scroll: ${error}`);
        }

        // If map didn't scroll on an axis, allow free movement on that axis
        if (!mapScrolledX || !mapScrolledY) {
          const boundedX = !mapScrolledX ? Math.min(Math.max(newPlayerX, mapLeft + playerWidth / 2), mapRight - playerWidth / 2) : player.position.x;
          const boundedY = !mapScrolledY ? Math.min(Math.max(newPlayerY, mapTop + playerHeight / 2), mapBottom - playerHeight / 2) : player.position.y;
          logger.log("Movement", `[Movement] Allowing bounded movement to: (${boundedX}, ${boundedY})`);
          player.position.x = boundedX;
          player.position.y = boundedY;
        }

        // Log final position and movement state
        if (deltaX !== 0 || deltaY !== 0) {
          logger.log("Movement", `[Final Position] Player at (${player.position.x}, ${player.position.y})`);
          logger.log("Movement", `[Movement State] Direction: ${player.movement.direction}, Moving: ${player.movement.isMoving}`);
        }
      }
    }
  }

  return entities;
};
