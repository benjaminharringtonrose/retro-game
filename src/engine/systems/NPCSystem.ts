import { Entity, SystemProps, Direction } from "../../types";
import { TILE_SIZE } from "../../constants/map";
import { getTileCoords } from "../../utils/pathfinding";
import { NPC_CONFIGS } from "../../config/npcs";

// Debug logging helper
let lastLogTime = 0;
const LOG_INTERVAL = 500; // Log every 500ms to avoid spam
const debugLog = (message: string, force = false) => {
  const now = Date.now();
  if (force || now - lastLogTime > LOG_INTERVAL) {
    console.log(`[NPCSystem] ${message}`);
    lastLogTime = now;
  }
};

// Helper to get a random number between min and max
const getRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Helper to check if a tile is walkable
const isWalkable = (tileX: number, tileY: number, mapTiles: number[][], allowedTiles: number[]): boolean => {
  // First check if within map bounds
  if (tileY < 0 || tileY >= mapTiles.length || tileX < 0 || tileX >= mapTiles[0].length) {
    debugLog(`Tile (${tileX}, ${tileY}) is out of map bounds`, true);
    return false;
  }

  const tileType = mapTiles[tileY][tileX];
  // Check if tile type is allowed
  if (!allowedTiles.includes(tileType)) {
    debugLog(`Tile (${tileX}, ${tileY}) is not an allowed tile type (${tileType})`, true);
    return false;
  }

  return true;
};

export const NPCSystem = (entities: { [key: string]: Entity }, { time, delta = 16.666 }: SystemProps) => {
  // Ensure delta is a valid number
  const deltaMs = typeof delta === "number" && !isNaN(delta) ? delta : 16.666;

  const npcs = Object.values(entities).filter((entity) => entity.id.startsWith("npc"));
  const map = entities["map-1"];

  if (!map?.position || !map.tileData?.tiles) return entities;

  npcs.forEach((npc) => {
    if (!npc.position || !npc.movement) {
      debugLog(`NPC ${npc.id} missing position or movement`, true);
      return;
    }

    // Get NPC config
    const config = NPC_CONFIGS[npc.id];
    if (!config) {
      debugLog(`No configuration found for NPC: ${npc.id}`, true);
      return;
    }

    debugLog(`Processing NPC: ${npc.id}`);

    // Initialize NPC state if not exists
    if (!npc.aiState) {
      debugLog("Initializing NPC state", true);
      npc.aiState = {
        currentWaitTime: 0,
        targetWaitTime: getRandomNumber(config.behavior.waitTimeRange.min, config.behavior.waitTimeRange.max),
        isWaiting: false,
        lastMoveTime: time,
        moveInterval: getRandomNumber(config.behavior.moveIntervalRange.min, config.behavior.moveIntervalRange.max),
      };

      // Set initial position from config
      npc.initialPosition = config.initialPosition;
      debugLog(`Set initial position to: (${npc.initialPosition.x}, ${npc.initialPosition.y})`, true);

      // Choose initial direction
      const directions = [Direction.Up, Direction.Down, Direction.Left, Direction.Right];
      npc.movement.direction = directions[Math.floor(Math.random() * directions.length)];
      npc.movement.isMoving = true;
      debugLog(`Set initial direction to: ${npc.movement.direction}`, true);
    }

    const state = npc.aiState;
    const { behavior } = config;

    // Store the absolute position (relative to map) if not set
    if (!npc.absolutePosition) {
      npc.absolutePosition = {
        x: npc.initialPosition.x,
        y: npc.initialPosition.y,
      };
    }

    // Handle AI movement based on behavior type
    if (behavior.type === "stationary") {
      // Stationary NPCs don't move
      npc.movement.isMoving = false;
    } else if (behavior.type === "wander") {
      if (state.isWaiting) {
        state.currentWaitTime += deltaMs;
        if (state.currentWaitTime >= state.targetWaitTime) {
          state.isWaiting = false;
          state.currentWaitTime = 0;
          state.targetWaitTime = getRandomNumber(behavior.waitTimeRange.min, behavior.waitTimeRange.max);
          npc.movement.isMoving = true;

          // Choose a new random direction
          const directions = [Direction.Up, Direction.Down, Direction.Left, Direction.Right];
          npc.movement.direction = directions[Math.floor(Math.random() * directions.length)];
        }
      } else if (time - state.lastMoveTime >= state.moveInterval) {
        const currentTile = getTileCoords(npc.absolutePosition.x, npc.absolutePosition.y);
        const possibleDirections: Direction[] = [];

        // Check each direction
        [
          { dx: 0, dy: -1, dir: Direction.Up },
          { dx: 0, dy: 1, dir: Direction.Down },
          { dx: -1, dy: 0, dir: Direction.Left },
          { dx: 1, dy: 0, dir: Direction.Right },
        ].forEach(({ dx, dy, dir }) => {
          const newTileX = currentTile.tileX + dx;
          const newTileY = currentTile.tileY + dy;

          // Check if the new position is within bounds and walkable
          const withinBounds = newTileX >= behavior.boundary.minX && newTileX <= behavior.boundary.maxX && newTileY >= behavior.boundary.minY && newTileY <= behavior.boundary.maxY;

          if (withinBounds && isWalkable(newTileX, newTileY, map.tileData.tiles, behavior.allowedTiles)) {
            possibleDirections.push(dir);
          }
        });

        if (possibleDirections.length > 0) {
          const randomIndex = Math.floor(Math.random() * possibleDirections.length);
          npc.movement.direction = possibleDirections[randomIndex];
          npc.movement.isMoving = true;
        } else {
          state.isWaiting = true;
          npc.movement.isMoving = false;
        }

        state.lastMoveTime = time;
        state.moveInterval = getRandomNumber(behavior.moveIntervalRange.min, behavior.moveIntervalRange.max);
      }

      // Apply movement if moving
      if (npc.movement.isMoving && !state.isWaiting) {
        const speed = behavior.moveSpeed * (deltaMs / 1000);
        const prevX = npc.absolutePosition.x;
        const prevY = npc.absolutePosition.y;

        let deltaX = 0;
        let deltaY = 0;

        switch (npc.movement.direction) {
          case Direction.Up:
            deltaY = -speed;
            break;
          case Direction.Down:
            deltaY = speed;
            break;
          case Direction.Left:
            deltaX = -speed;
            break;
          case Direction.Right:
            deltaX = speed;
            break;
        }

        // Calculate next position
        const nextX = npc.absolutePosition.x + deltaX;
        const nextY = npc.absolutePosition.y + deltaY;
        const nextTile = getTileCoords(nextX, nextY);
        const currentTile = getTileCoords(npc.absolutePosition.x, npc.absolutePosition.y);

        // Check if next position is valid
        const withinBounds =
          nextTile.tileX >= behavior.boundary.minX &&
          nextTile.tileX <= behavior.boundary.maxX &&
          nextTile.tileY >= behavior.boundary.minY &&
          nextTile.tileY <= behavior.boundary.maxY &&
          nextX >= behavior.boundary.minX * TILE_SIZE + TILE_SIZE * 0.25 &&
          nextX <= behavior.boundary.maxX * TILE_SIZE + TILE_SIZE * 0.75 &&
          nextY >= behavior.boundary.minY * TILE_SIZE + TILE_SIZE * 0.25 &&
          nextY <= behavior.boundary.maxY * TILE_SIZE + TILE_SIZE * 0.75;

        const nextXInTile = nextX % TILE_SIZE;
        const nextYInTile = nextY % TILE_SIZE;
        const nearTileCenter = nextXInTile > TILE_SIZE * 0.4 && nextXInTile < TILE_SIZE * 0.6 && nextYInTile > TILE_SIZE * 0.4 && nextYInTile < TILE_SIZE * 0.6;

        if (withinBounds && isWalkable(nextTile.tileX, nextTile.tileY, map.tileData.tiles, behavior.allowedTiles) && (nearTileCenter || (currentTile.tileX === nextTile.tileX && currentTile.tileY === nextTile.tileY))) {
          npc.absolutePosition.x = nextX;
          npc.absolutePosition.y = nextY;
          npc.position.x = nextX + map.position.x;
          npc.position.y = nextY + map.position.y;
        } else {
          state.isWaiting = true;
          npc.movement.isMoving = false;
          state.currentWaitTime = 0;
          state.targetWaitTime = getRandomNumber(behavior.waitTimeRange.min, behavior.waitTimeRange.max);
        }
      }
    }

    // Always update screen position based on map movement
    npc.position.x = npc.absolutePosition.x + map.position.x;
    npc.position.y = npc.absolutePosition.y + map.position.y;
  });

  return entities;
};
