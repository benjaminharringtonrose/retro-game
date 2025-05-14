import { GameEngine } from "../GameEngine";
import { System } from "../types/engine";
import { ComponentType, MovementComponent, InputComponent, TransformComponent } from "../types/components";
import { TILE_SIZE } from "../../constants/map";
import { Tile } from "../../types";
import { MOVE_SPEED } from "../../constants/sprites";
import { Dimensions } from "react-native";

const BASE_SPEED = MOVE_SPEED;
const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get("window");

interface EntityComponents {
  movement: MovementComponent;
  input: InputComponent;
  transform: TransformComponent;
}

export class MovementSystem implements System {
  private readonly WALKABLE_TILES = [Tile.Grass, Tile.Path] as const;
  private mapData: Tile[][];
  private cols: number;
  private rows: number;
  private mapWidth: number;
  private mapHeight: number;
  private entityComponents: Map<number, EntityComponents> = new Map();
  private lastProcessedEntities: number[] = [];
  private debugFrameCount = 0;

  constructor(mapData: Tile[][]) {
    this.mapData = mapData;
    this.rows = mapData.length;
    this.cols = mapData[0]?.length || 0;
    this.mapWidth = this.cols * TILE_SIZE;
    this.mapHeight = this.rows * TILE_SIZE;
  }

  update(engine: GameEngine, deltaTime: number): void {
    // Only log every 30 frames to keep console readable
    const shouldLog = this.debugFrameCount % 30 === 0;
    this.debugFrameCount++;

    const entities = engine.getEntitiesWithComponents([ComponentType.Movement, ComponentType.Input, ComponentType.Transform]);

    if (this.haveEntitiesChanged(entities)) {
      this.updateEntityComponents(engine, entities);
    }

    for (const entityId of entities) {
      const components = this.entityComponents.get(entityId);
      if (!components) continue;

      const { movement, input, transform } = components;
      if (!input.isMoving) continue;

      const speed = BASE_SPEED;
      const dx = input.direction.x * speed;
      const dy = input.direction.y * speed;

      if (shouldLog) {
        // Calculate current tile position
        const currentWorldX = -movement.mapX.value + transform.position.x + movement.offsetX.value;
        const currentWorldY = -movement.mapY.value + transform.position.y + movement.offsetY.value;
        const currentTileCol = Math.floor(currentWorldX / TILE_SIZE);
        const currentTileRow = Math.floor(currentWorldY / TILE_SIZE);
        const currentTile = this.getTileAt(currentTileRow, currentTileCol);

        console.log("\n--- Movement Debug ---");
        console.log("Current Tile:", {
          row: currentTileRow,
          col: currentTileCol,
          type: currentTile,
          worldX: currentWorldX.toFixed(2),
          worldY: currentWorldY.toFixed(2),
        });
        console.log("Current Position:", {
          mapX: movement.mapX.value.toFixed(2),
          mapY: movement.mapY.value.toFixed(2),
          offsetX: movement.offsetX.value.toFixed(2),
          offsetY: movement.offsetY.value.toFixed(2),
        });
        console.log("Movement Input:", {
          dx: dx.toFixed(2),
          dy: dy.toFixed(2),
          direction: input.direction,
        });
      }

      // Calculate map bounds considering window size
      const maxX = 0; // Don't allow scrolling right past initial position
      const minX = Math.min(0, -(this.mapWidth - WINDOW_WIDTH)); // Don't scroll left past map width minus window
      const maxY = 0; // Don't allow scrolling down past initial position
      const minY = Math.min(0, -(this.mapHeight - WINDOW_HEIGHT)); // Don't scroll up past map height minus window

      if (shouldLog) {
        console.log("Map Bounds:", {
          maxX,
          minX,
          maxY,
          minY,
          mapWidth: this.mapWidth,
          mapHeight: this.mapHeight,
          windowWidth: WINDOW_WIDTH,
          windowHeight: WINDOW_HEIGHT,
        });
      }

      // Try X movement
      if (dx !== 0) {
        const nextMapX = movement.mapX.value + dx;
        // Clamp the next position to the bounds
        const clampedNextMapX = Math.max(minX, Math.min(maxX, nextMapX));
        const atMapBoundX = clampedNextMapX !== nextMapX;

        // Calculate world position after potential move
        const nextWorldX = -clampedNextMapX + transform.position.x + movement.offsetX.value + (atMapBoundX ? -dx : 0);
        const currentWorldY = -movement.mapY.value + transform.position.y + movement.offsetY.value;

        // Calculate tile positions
        const currentWorldX = -movement.mapX.value + transform.position.x + movement.offsetX.value;
        const currentTileCol = Math.floor(currentWorldX / TILE_SIZE);
        const currentTileRow = Math.floor(currentWorldY / TILE_SIZE);
        const nextTileCol = Math.floor(nextWorldX / TILE_SIZE);

        if (shouldLog && dx !== 0) {
          console.log("X Movement:", {
            nextMapX: clampedNextMapX.toFixed(2),
            atMapBoundX,
            currentWorldX: currentWorldX.toFixed(2),
            nextWorldX: nextWorldX.toFixed(2),
            currentTile: { col: currentTileCol, row: currentTileRow },
            nextTile: { col: nextTileCol, row: currentTileRow },
          });
        }

        // Prevent offset from pushing player too far left
        const maxOffset = transform.position.x - TILE_SIZE;
        const minOffset = -maxOffset;
        const wouldExceedOffset = dx < 0 && movement.offsetX.value + dx < minOffset;
        const isAtOffsetLimit = movement.offsetX.value <= minOffset || movement.offsetX.value >= maxOffset;
        const movingAwayFromEdge = (movement.offsetX.value < 0 && dx > 0) || (movement.offsetX.value > 0 && dx < 0);

        // Check if move is valid
        const nextTile = this.getTileAtWorldPos(nextWorldX, currentWorldY);
        const canMove = nextTile !== undefined && this.WALKABLE_TILES.includes(nextTile as Tile.Grass);

        if (shouldLog && dx !== 0) {
          console.log("X Movement Check:", {
            nextTile,
            canMove,
            offsetX: movement.offsetX.value.toFixed(2),
            wouldExceedOffset,
            minOffset,
            isAtOffsetLimit,
            movingAwayFromEdge,
          });
        }

        if (canMove) {
          if (atMapBoundX && !movingAwayFromEdge) {
            if (shouldLog) console.log("At X bound, moving player offset");
            const newOffsetX = movement.offsetX.value - dx;
            // Clamp the offset value
            movement.offsetX.value = Math.max(minOffset, Math.min(maxOffset, newOffsetX));
          } else if (movement.offsetX.value !== 0) {
            // Moving away from edge or recentering
            const newOffsetX = movement.offsetX.value - dx;
            const centeringDistance = Math.abs(newOffsetX);
            const movementDistance = Math.abs(dx);

            if (centeringDistance <= movementDistance) {
              if (shouldLog) console.log("Recentering X - split movement");
              // Calculate remaining movement after reaching center
              const remaining = dx > 0 ? movementDistance - Math.abs(movement.offsetX.value) : -(movementDistance - Math.abs(movement.offsetX.value));
              movement.offsetX.value = 0;
              if (Math.abs(remaining) > 0) {
                movement.mapX.value += remaining;
              }
            } else {
              if (shouldLog) console.log("Recentering X - moving toward center");
              movement.offsetX.value = newOffsetX;
            }
          } else {
            if (shouldLog) console.log("Moving map X");
            movement.mapX.value = clampedNextMapX;
          }
        } else {
          if (shouldLog) console.log("X Movement blocked by collision");
        }
      }

      // Try Y movement
      if (dy !== 0) {
        const nextMapY = movement.mapY.value + dy;
        // Clamp the next position to the bounds
        const clampedNextMapY = Math.max(minY, Math.min(maxY, nextMapY));
        const atMapBoundY = clampedNextMapY !== nextMapY;

        // Calculate world position after potential move
        const currentWorldX = -movement.mapX.value + transform.position.x + movement.offsetX.value;
        const nextWorldY = -clampedNextMapY + transform.position.y + movement.offsetY.value + (atMapBoundY ? -dy : 0);

        // Calculate tile positions
        const currentWorldY = -movement.mapY.value + transform.position.y + movement.offsetY.value;
        const currentTileCol = Math.floor(currentWorldX / TILE_SIZE);
        const currentTileRow = Math.floor(currentWorldY / TILE_SIZE);
        const nextTileRow = Math.floor(nextWorldY / TILE_SIZE);

        if (shouldLog && dy !== 0) {
          console.log("Y Movement:", {
            nextMapY: clampedNextMapY.toFixed(2),
            atMapBoundY,
            currentWorldY: currentWorldY.toFixed(2),
            nextWorldY: nextWorldY.toFixed(2),
            currentTile: { col: currentTileCol, row: currentTileRow },
            nextTile: { col: currentTileCol, row: nextTileRow },
          });
        }

        // Prevent offset from pushing player too far up/down
        const maxOffsetY = transform.position.y - TILE_SIZE;
        const minOffsetY = -maxOffsetY;
        const wouldExceedOffset = dy < 0 && movement.offsetY.value + dy < minOffsetY;
        const isAtOffsetLimit = movement.offsetY.value <= minOffsetY || movement.offsetY.value >= maxOffsetY;
        const movingAwayFromEdge = (movement.offsetY.value < 0 && dy > 0) || (movement.offsetY.value > 0 && dy < 0);

        // Check if move is valid
        const nextTile = this.getTileAtWorldPos(currentWorldX, nextWorldY);
        const canMove = nextTile !== undefined && this.WALKABLE_TILES.includes(nextTile as Tile.Grass);

        if (shouldLog && dy !== 0) {
          console.log("Y Movement Check:", {
            nextTile,
            canMove,
            offsetY: movement.offsetY.value.toFixed(2),
            wouldExceedOffset,
            minOffsetY,
            isAtOffsetLimit,
            movingAwayFromEdge,
          });
        }

        if (canMove) {
          if (atMapBoundY && !movingAwayFromEdge) {
            if (shouldLog) console.log("At Y bound, moving player offset");
            const newOffsetY = movement.offsetY.value - dy;
            // Clamp the offset value
            movement.offsetY.value = Math.max(minOffsetY, Math.min(maxOffsetY, newOffsetY));
          } else if (movement.offsetY.value !== 0) {
            // Moving away from edge or recentering
            const newOffsetY = movement.offsetY.value - dy;
            const centeringDistance = Math.abs(newOffsetY);
            const movementDistance = Math.abs(dy);

            if (centeringDistance <= movementDistance) {
              if (shouldLog) console.log("Recentering Y - split movement");
              // Calculate remaining movement after reaching center
              const remaining = dy > 0 ? movementDistance - Math.abs(movement.offsetY.value) : -(movementDistance - Math.abs(movement.offsetY.value));
              movement.offsetY.value = 0;
              if (Math.abs(remaining) > 0) {
                movement.mapY.value += remaining;
              }
            } else {
              if (shouldLog) console.log("Recentering Y - moving toward center");
              movement.offsetY.value = newOffsetY;
            }
          } else {
            if (shouldLog) console.log("Moving map Y");
            movement.mapY.value = clampedNextMapY;
          }
        } else {
          if (shouldLog) console.log("Y Movement blocked by collision");
        }
      }

      if (shouldLog) {
        console.log("Final Position:", {
          mapX: movement.mapX.value.toFixed(2),
          mapY: movement.mapY.value.toFixed(2),
          offsetX: movement.offsetX.value.toFixed(2),
          offsetY: movement.offsetY.value.toFixed(2),
        });
      }
    }

    this.lastProcessedEntities = entities;
  }

  private haveEntitiesChanged(currentEntities: number[]): boolean {
    if (currentEntities.length !== this.lastProcessedEntities.length) return true;
    return !currentEntities.every((id, index) => id === this.lastProcessedEntities[index]);
  }

  private updateEntityComponents(engine: GameEngine, entities: number[]): void {
    this.entityComponents.clear();
    for (const entityId of entities) {
      const movement = engine.getComponent<MovementComponent>(entityId, ComponentType.Movement);
      const input = engine.getComponent<InputComponent>(entityId, ComponentType.Input);
      const transform = engine.getComponent<TransformComponent>(entityId, ComponentType.Transform);

      if (movement && input && transform) {
        this.entityComponents.set(entityId, { movement, input, transform });
      }
    }
  }

  private getTileAtWorldPos(worldX: number, worldY: number): Tile | undefined {
    const tileCol = Math.floor(worldX / TILE_SIZE);
    const tileRow = Math.floor(worldY / TILE_SIZE);

    // Check if position is within map bounds
    if (tileCol < 0 || tileCol >= this.cols || tileRow < 0 || tileRow >= this.rows) {
      return undefined;
    }

    const tile = this.mapData[tileRow][tileCol];
    return tile;
  }

  private getTileAt(row: number, col: number): Tile | undefined {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
      return undefined;
    }
    return this.mapData[row][col];
  }
}
