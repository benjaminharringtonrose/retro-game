import { Entity, SystemProps, Direction, MapType } from "../../types";
import { Dimensions } from "react-native";
import { DEFAULT_MAPS } from "../../constants/map";
import { mapManager } from "../../managers/MapManager";
import { logger } from "../../utils/logger";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Screen edge margins
const EDGE_MARGIN = 20;

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
        logger.log("Movement", `[Movement] Fixed map bounds: left=${mapLeft}, right=${mapRight}, top=${mapTop}, bottom=${mapBottom}`);
        logger.log("Movement", `[Movement] Player position: x=${player.position.x}, y=${player.position.y}`);
      }
    } else {
      // Handle scrolling maps
      // Handle X movement
      if (deltaX !== 0) {
        const newPlayerX = player.position.x + deltaX;
        const mapLeft = map.position.x;
        const mapRight = mapLeft + map.dimensions.width;
        const playerWidth = player.dimensions?.width || 32;

        logger.log("Movement", `[X Movement] Current player X: ${player.position.x}, Attempting move to: ${newPlayerX}`);
        logger.log("Movement", `[X Movement] Map bounds - Left: ${mapLeft}, Right: ${mapRight}`);
        logger.log("Movement", `[X Movement] Map absolute bounds - Left: ${map.bounds.left}, Right: ${map.bounds.right}`);

        // Check if we're at the absolute edges of the map
        const isAtLeftEdge = Math.abs(map.position.x - (-map.dimensions.width + screenWidth)) < 1;
        const isAtRightEdge = Math.abs(map.position.x) < 1;

        // Check if we can scroll in either direction
        const canScrollLeft = map.position.x < 0;
        const canScrollRight = map.position.x > -(map.dimensions.width - screenWidth);

        logger.log("Movement", `[X Movement] Can scroll? Left: ${canScrollLeft}, Right: ${canScrollRight}`);

        // Calculate distance from center
        const distanceFromCenter = Math.abs(player.position.x - centerX);

        // If we're at an edge, allow free movement within bounds
        if (isAtLeftEdge || isAtRightEdge) {
          const boundedX = Math.min(Math.max(newPlayerX, mapLeft + playerWidth / 2), mapRight - playerWidth / 2);
          logger.log("Movement", `[X Movement] At edge, allowing bounded movement to: ${boundedX}`);
          player.position.x = boundedX;
          return entities;
        }

        // If we're moving towards the center, allow free movement within bounds
        const isMovingTowardsCenter = (player.position.x > centerX && deltaX < 0) || (player.position.x < centerX && deltaX > 0);

        if (isMovingTowardsCenter) {
          const boundedX = Math.min(Math.max(newPlayerX, mapLeft + playerWidth / 2), mapRight - playerWidth / 2);
          logger.log("Movement", `[X Movement] Moving towards center, allowing bounded movement to: ${boundedX}`);
          player.position.x = boundedX;
          return entities;
        }

        // If we're moving away from center and within dead zone, allow free movement within bounds
        if (distanceFromCenter >= screenWidth / 2) {
          const boundedX = Math.min(Math.max(newPlayerX, mapLeft + playerWidth / 2), mapRight - playerWidth / 2);
          logger.log("Movement", `[X Movement] Within dead zone (${distanceFromCenter}px from center), allowing bounded movement to: ${boundedX}`);
          player.position.x = boundedX;
          return entities;
        }

        // If we're at or beyond dead zone and moving away from center, try to scroll the map
        const scrollDelta = deltaX;
        try {
          const scrollSuccess = mapManager.updateMapScroll(map, scrollDelta, 0);
          if (scrollSuccess) {
            logger.log("Movement", `[X Movement] Map scroll attempt: succeeded`);
            // Keep player centered when map scrolls
            player.position.x = centerX;
            logger.log("Movement", `[X Movement] Keeping player centered at: ${centerX}`);
            return entities;
          }
        } catch (error) {
          logger.error("Movement", `[X Movement] Error during map scroll: ${error}`);
          // If scroll fails, allow free movement within bounds
          const boundedX = Math.min(Math.max(newPlayerX, mapLeft + playerWidth / 2), mapRight - playerWidth / 2);
          player.position.x = boundedX;
          return entities;
        }

        // If map couldn't scroll, allow free movement within bounds
        const boundedX = Math.min(Math.max(newPlayerX, mapLeft + playerWidth / 2), mapRight - playerWidth / 2);
        logger.log("Movement", `[X Movement] Map couldn't scroll, allowing bounded movement to: ${boundedX}`);
        player.position.x = boundedX;
      }

      // Handle Y movement
      if (deltaY !== 0) {
        const newPlayerY = player.position.y + deltaY;
        const mapTop = map.position.y;
        const mapBottom = mapTop + map.dimensions.height;
        const playerHeight = player.dimensions?.height || 40;

        logger.log("Movement", `[Y Movement] Current player Y: ${player.position.y}, Attempting move to: ${newPlayerY}`);
        logger.log("Movement", `[Y Movement] Map bounds - Top: ${mapTop}, Bottom: ${mapBottom}`);
        logger.log("Movement", `[Y Movement] Map absolute bounds - Top: ${map.bounds.top}, Bottom: ${map.bounds.bottom}`);

        // Check if we're at the absolute edges of the map
        const isAtTopEdge = Math.abs(map.position.y - (-map.dimensions.height + screenHeight)) < 1;
        const isAtBottomEdge = Math.abs(map.position.y) < 1;

        // Check if we can scroll in either direction
        const canScrollUp = map.position.y < 0;
        const canScrollDown = map.position.y > -(map.dimensions.height - screenHeight);

        logger.log("Movement", `[Y Movement] Can scroll? Up: ${canScrollUp}, Down: ${canScrollDown}`);

        // Calculate distance from center
        const distanceFromCenter = Math.abs(player.position.y - centerY);

        // If we're at an edge, allow free movement within bounds
        if (isAtTopEdge || isAtBottomEdge) {
          const boundedY = Math.min(Math.max(newPlayerY, mapTop + playerHeight / 2), mapBottom - playerHeight / 2);
          logger.log("Movement", `[Y Movement] At edge, allowing bounded movement to: ${boundedY}`);
          player.position.y = boundedY;
          return entities;
        }

        // If we're moving towards the center, allow free movement within bounds
        const isMovingTowardsCenter = (player.position.y > centerY && deltaY < 0) || (player.position.y < centerY && deltaY > 0);

        if (isMovingTowardsCenter) {
          const boundedY = Math.min(Math.max(newPlayerY, mapTop + playerHeight / 2), mapBottom - playerHeight / 2);
          logger.log("Movement", `[Y Movement] Moving towards center, allowing bounded movement to: ${boundedY}`);
          player.position.y = boundedY;
          return entities;
        }

        // If we're moving away from center and within dead zone, allow free movement within bounds
        if (distanceFromCenter >= screenHeight / 2) {
          const boundedY = Math.min(Math.max(newPlayerY, mapTop + playerHeight / 2), mapBottom - playerHeight / 2);
          logger.log("Movement", `[Y Movement] Within dead zone (${distanceFromCenter}px from center), allowing bounded movement to: ${boundedY}`);
          player.position.y = boundedY;
          return entities;
        }

        // If we're at or beyond dead zone and moving away from center, try to scroll the map
        const scrollDelta = deltaY;
        try {
          const scrollSuccess = mapManager.updateMapScroll(map, 0, scrollDelta);
          if (scrollSuccess) {
            logger.log("Movement", `[Y Movement] Map scroll attempt: succeeded`);
            // Keep player centered when map scrolls
            player.position.y = centerY;
            logger.log("Movement", `[Y Movement] Keeping player centered at: ${centerY}`);
            return entities;
          }
        } catch (error) {
          logger.error("Movement", `[Y Movement] Error during map scroll: ${error}`);
          // If scroll fails, allow free movement within bounds
          const boundedY = Math.min(Math.max(newPlayerY, mapTop + playerHeight / 2), mapBottom - playerHeight / 2);
          player.position.y = boundedY;
          return entities;
        }

        // If map couldn't scroll, allow free movement within bounds
        const boundedY = Math.min(Math.max(newPlayerY, mapTop + playerHeight / 2), mapBottom - playerHeight / 2);
        logger.log("Movement", `[Y Movement] Map couldn't scroll, allowing bounded movement to: ${boundedY}`);
        player.position.y = boundedY;
      }

      // Log final position and movement state
      if (deltaX !== 0 || deltaY !== 0) {
        logger.log("Movement", `[Final Position] Player at (${player.position.x}, ${player.position.y})`);
        logger.log("Movement", `[Movement State] Direction: ${player.movement.direction}, Moving: ${player.movement.isMoving}`);
      }
    }
  }

  return entities;
};
