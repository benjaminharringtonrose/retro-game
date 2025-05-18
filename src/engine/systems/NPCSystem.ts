import { Entity, SystemProps, Direction, Tile } from "../../types";
import { TILE_SIZE } from "../../constants/map";
import { getTileCoords } from "../../utils/pathfinding";
import { Dimensions } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface NPCState {
  currentWaitTime: number;
  targetWaitTime: number;
  isWaiting: boolean;
  lastMoveTime: number;
  moveInterval: number;
}

const MOVE_INTERVAL_MIN = 2000; // Increased: Minimum time between direction changes (ms)
const MOVE_INTERVAL_MAX = 4000; // Increased: Maximum time between direction changes (ms)
const WAIT_TIME_MIN = 1500; // Increased: Minimum wait time (ms)
const WAIT_TIME_MAX = 3000; // Increased: Maximum wait time (ms)
const MOVEMENT_AREA = 5; // How many tiles away from starting position the NPC can move

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
const isWalkable = (tileX: number, tileY: number, mapTiles: number[][]): boolean => {
  if (tileY < 0 || tileY >= mapTiles.length || tileX < 0 || tileX >= mapTiles[0].length) {
    debugLog(`Tile (${tileX}, ${tileY}) is out of bounds`, true);
    return false;
  }
  const tileType = mapTiles[tileY][tileX];
  // Only allow walking on flower tiles
  const walkable = tileType === Tile.Flower;
  debugLog(`Tile (${tileX}, ${tileY}) type: ${tileType} is walkable: ${walkable}`);
  return walkable;
};

// Constants for flower bed boundaries
const FLOWER_BED = {
  minX: 22,
  maxX: 24,
  minY: 15,
  maxY: 16,
};

// Movement speed factor (reduce speed in flower bed)
const FLOWER_BED_SPEED_FACTOR = 0.3; // 30% of normal speed

// Constants for movement transitions
const DIRECTION_CHANGE_THRESHOLD = TILE_SIZE * 0.1; // Minimum distance moved before allowing direction change
const MOVEMENT_SMOOTHING = 0.85; // Factor for smoothing movement transitions

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
    debugLog(`Processing NPC: ${npc.id}`);

    // Initialize NPC state if not exists
    if (!npc.aiState) {
      debugLog("Initializing NPC state", true);
      npc.aiState = {
        currentWaitTime: 0,
        targetWaitTime: getRandomNumber(WAIT_TIME_MIN, WAIT_TIME_MAX),
        isWaiting: false, // Start moving immediately
        lastMoveTime: time,
        moveInterval: getRandomNumber(MOVE_INTERVAL_MIN, MOVE_INTERVAL_MAX),
      } as NPCState;

      // Set initial position to center of flower bed
      const centerTileX = Math.floor((FLOWER_BED.minX + FLOWER_BED.maxX) / 2);
      const centerTileY = Math.floor((FLOWER_BED.minY + FLOWER_BED.maxY) / 2);
      npc.initialPosition = {
        x: centerTileX * TILE_SIZE,
        y: centerTileY * TILE_SIZE,
      };
      debugLog(`Set initial position to: (${npc.initialPosition.x}, ${npc.initialPosition.y})`, true);

      // Choose initial direction
      const directions = [Direction.Up, Direction.Down, Direction.Left, Direction.Right];
      npc.movement.direction = directions[Math.floor(Math.random() * directions.length)];
      npc.movement.isMoving = true;
      debugLog(`Set initial direction to: ${npc.movement.direction}`, true);
    }

    // Ensure state values are numbers
    const state = npc.aiState as NPCState;
    state.currentWaitTime = typeof state.currentWaitTime === "number" ? state.currentWaitTime : 0;
    state.targetWaitTime = typeof state.targetWaitTime === "number" ? state.targetWaitTime : getRandomNumber(WAIT_TIME_MIN, WAIT_TIME_MAX);
    state.lastMoveTime = typeof state.lastMoveTime === "number" ? state.lastMoveTime : time;
    state.moveInterval = typeof state.moveInterval === "number" ? state.moveInterval : getRandomNumber(MOVE_INTERVAL_MIN, MOVE_INTERVAL_MAX);

    // Store the absolute position (relative to map) if not set
    if (!npc.absolutePosition) {
      npc.absolutePosition = {
        x: npc.initialPosition.x,
        y: npc.initialPosition.y,
      };
      debugLog(`Set absolute position to: (${npc.absolutePosition.x}, ${npc.absolutePosition.y})`, true);
    }

    // Handle AI movement
    debugLog(`NPC State - waiting: ${state.isWaiting}, currentWaitTime: ${state.currentWaitTime}, targetWaitTime: ${state.targetWaitTime}, isMoving: ${npc.movement.isMoving}`, true);
    debugLog(`NPC Position - abs: (${npc.absolutePosition.x}, ${npc.absolutePosition.y}), screen: (${npc.position.x}, ${npc.position.y})`, true);

    if (state.isWaiting) {
      state.currentWaitTime += deltaMs;
      debugLog(`Waiting - current: ${state.currentWaitTime.toFixed(2)}ms, target: ${state.targetWaitTime}ms`, true);
      if (state.currentWaitTime >= state.targetWaitTime) {
        debugLog("Finished waiting, starting to move", true);
        state.isWaiting = false;
        state.currentWaitTime = 0;
        state.targetWaitTime = getRandomNumber(WAIT_TIME_MIN, WAIT_TIME_MAX);
        npc.movement.isMoving = true;

        // Choose a new random direction when starting to move
        const directions = [Direction.Up, Direction.Down, Direction.Left, Direction.Right];
        const randomIndex = Math.floor(Math.random() * directions.length);
        npc.movement.direction = directions[randomIndex];
        debugLog(`Starting movement in direction: ${npc.movement.direction}`, true);
      }
    } else if (time - state.lastMoveTime >= state.moveInterval) {
      debugLog(`Time since last move: ${(time - state.lastMoveTime).toFixed(2)}ms, interval: ${state.moveInterval}ms`, true);
      const currentTile = getTileCoords(npc.absolutePosition.x, npc.absolutePosition.y);
      const initialTile = getTileCoords(npc.initialPosition.x, npc.initialPosition.y);
      debugLog(`Current tile: (${currentTile.tileX}, ${currentTile.tileY}), Initial tile: (${initialTile.tileX}, ${initialTile.tileY})`);

      // Get possible directions
      const possibleDirections: Direction[] = [];

      // Check each direction
      const checks = [
        { dx: 0, dy: -1, dir: Direction.Up },
        { dx: 0, dy: 1, dir: Direction.Down },
        { dx: -1, dy: 0, dir: Direction.Left },
        { dx: 1, dy: 0, dir: Direction.Right },
      ];

      checks.forEach(({ dx, dy, dir }) => {
        const newTileX = currentTile.tileX + dx;
        const newTileY = currentTile.tileY + dy;

        // Check if the new position is within the flower bed and walkable
        const withinFlowerBed = newTileX >= FLOWER_BED.minX && newTileX <= FLOWER_BED.maxX && newTileY >= FLOWER_BED.minY && newTileY <= FLOWER_BED.maxY;

        debugLog(`Checking direction ${dir}: tile (${newTileX}, ${newTileY}) - within flower bed: ${withinFlowerBed}`);

        if (withinFlowerBed && isWalkable(newTileX, newTileY, map.tileData.tiles)) {
          possibleDirections.push(dir);
        }
      });

      debugLog(`Found ${possibleDirections.length} possible directions`);

      if (possibleDirections.length > 0) {
        // Choose a random direction from possible ones
        const randomIndex = Math.floor(Math.random() * possibleDirections.length);
        npc.movement.direction = possibleDirections[randomIndex];
        npc.movement.isMoving = true;
        debugLog(`Chose new direction from possible: ${npc.movement.direction}`, true);
      } else {
        // No valid directions, wait
        debugLog("No valid directions, waiting", true);
        state.isWaiting = true;
        npc.movement.isMoving = false;
      }

      state.lastMoveTime = time;
      state.moveInterval = getRandomNumber(MOVE_INTERVAL_MIN, MOVE_INTERVAL_MAX);
    }

    // Apply movement if moving
    if (npc.movement.isMoving && !state.isWaiting) {
      debugLog("Applying movement", true);
      // Apply reduced speed in flower bed
      const speed = npc.movement.speed * (deltaMs / 1000) * FLOWER_BED_SPEED_FACTOR;

      // Store previous position for movement smoothing
      const prevX = npc.absolutePosition.x;
      const prevY = npc.absolutePosition.y;

      let deltaX = 0;
      let deltaY = 0;

      // Calculate movement based on direction
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

      // Apply movement smoothing
      deltaX *= MOVEMENT_SMOOTHING;
      deltaY *= MOVEMENT_SMOOTHING;

      debugLog(`Movement calculation - speed: ${speed.toFixed(2)}, deltas: (${deltaX.toFixed(2)}, ${deltaY.toFixed(2)})`, true);

      // Calculate next position in map coordinates
      const nextX = npc.absolutePosition.x + deltaX;
      const nextY = npc.absolutePosition.y + deltaY;
      const nextTile = getTileCoords(nextX, nextY);
      const currentTile = getTileCoords(npc.absolutePosition.x, npc.absolutePosition.y);

      // Calculate distance moved since last direction change
      const distanceMoved = Math.sqrt(Math.pow(nextX - prevX, 2) + Math.pow(nextY - prevY, 2));

      // Add extra boundary check to prevent getting too close to edges
      const withinFlowerBed = nextTile.tileX >= FLOWER_BED.minX && nextTile.tileX <= FLOWER_BED.maxX && nextTile.tileY >= FLOWER_BED.minY && nextTile.tileY <= FLOWER_BED.maxY;

      // Add position check within tile to prevent crossing tile boundaries too much
      const nextXInTile = nextX % TILE_SIZE;
      const nextYInTile = nextY % TILE_SIZE;
      const nearTileCenter = nextXInTile > TILE_SIZE * 0.25 && nextXInTile < TILE_SIZE * 0.75 && nextYInTile > TILE_SIZE * 0.25 && nextYInTile < TILE_SIZE * 0.75;

      debugLog(`Next position - map: (${nextX}, ${nextY}), tile: (${nextTile.tileX}, ${nextTile.tileY}), within flower bed: ${withinFlowerBed}, near center: ${nearTileCenter}`);

      // Only allow movement if within flower bed and near tile center
      if (withinFlowerBed && isWalkable(nextTile.tileX, nextTile.tileY, map.tileData.tiles) && (nearTileCenter || (currentTile.tileX === nextTile.tileX && currentTile.tileY === nextTile.tileY))) {
        // Update absolute position (map-relative) with smoothing
        npc.absolutePosition.x = nextX;
        npc.absolutePosition.y = nextY;

        // Update screen position based on map position
        npc.position.x = nextX + map.position.x;
        npc.position.y = nextY + map.position.y;

        // Only allow direction changes after moving a minimum distance
        if (distanceMoved >= DIRECTION_CHANGE_THRESHOLD) {
          state.lastMoveTime = time;
        }

        debugLog(`Updated position - abs: (${nextX}, ${nextY}), screen: (${npc.position.x}, ${npc.position.y})`);
      } else {
        // Hit boundary or non-walkable tile, wait and then choose new direction
        debugLog("Hit boundary or non-walkable tile, waiting", true);
        state.isWaiting = true;
        npc.movement.isMoving = false;
        state.currentWaitTime = 0;
        state.targetWaitTime = getRandomNumber(WAIT_TIME_MIN, WAIT_TIME_MAX);
      }
    } else {
      // Even when not moving, update screen position based on map movement
      npc.position.x = npc.absolutePosition.x + map.position.x;
      npc.position.y = npc.absolutePosition.y + map.position.y;
      debugLog("Updated screen position while stationary");
    }
  });

  return entities;
};
