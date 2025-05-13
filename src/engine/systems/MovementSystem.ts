import { System, GameEngine } from "../GameEngine";
import { ComponentType, MovementComponent, InputComponent, TransformComponent } from "../types";
import { TILE_SIZE } from "../../constants/map";
import { Tile } from "../../types";
import { MOVE_SPEED } from "../../constants/sprites";
import { runOnJS, withTiming } from "react-native-reanimated";

const BASE_SPEED = MOVE_SPEED;
const SCREEN_MARGIN = 100; // Distance from screen edge before map scrolls

export class MovementSystem implements System {
  private readonly WALKABLE_TILES = [Tile.Grass, Tile.Path] as const;
  private mapData: Tile[][];
  private cols: number;
  private rows: number;

  constructor(mapData: Tile[][]) {
    this.mapData = mapData;
    this.rows = mapData.length;
    this.cols = mapData[0]?.length || 0;
  }

  update(engine: GameEngine, deltaTime: number): void {
    const entities = engine.getEntitiesWithComponents([ComponentType.Movement, ComponentType.Input, ComponentType.Transform]);

    for (const entity of entities) {
      const movement = engine.getComponent<MovementComponent>(entity, ComponentType.Movement);
      const input = engine.getComponent<InputComponent>(entity, ComponentType.Input);
      const transform = engine.getComponent<TransformComponent>(entity, ComponentType.Transform);

      if (!movement || !input || !transform) continue;

      if (!input.isMoving) {
        continue;
      }

      // Calculate movement speed
      const speed = BASE_SPEED;
      const dx = input.direction.x * speed;
      const dy = input.direction.y * speed;

      // Calculate map bounds
      const maxX = 0;
      const minX = -(this.cols * TILE_SIZE - transform.position.x * 2);
      const maxY = 0;
      const minY = -(this.rows * TILE_SIZE - transform.position.y * 2);

      // Calculate next positions
      const nextMapX = movement.mapX.value + dx;
      const nextMapY = movement.mapY.value + dy;
      const nextOffsetX = movement.offsetX.value;
      const nextOffsetY = movement.offsetY.value;

      // Check if we're at map boundaries
      const atLeftBound = nextMapX >= maxX && dx > 0;
      const atRightBound = nextMapX <= minX && dx < 0;
      const atTopBound = nextMapY >= maxY && dy > 0;
      const atBottomBound = nextMapY <= minY && dy < 0;

      // Calculate world position for collision detection
      const worldX = -nextMapX + transform.position.x + nextOffsetX + (atLeftBound || atRightBound ? -dx : 0);
      const worldY = -nextMapY + transform.position.y + nextOffsetY + (atTopBound || atBottomBound ? -dy : 0);

      // Get tile coordinates for the next position
      const nextTileCol = Math.floor(worldX / TILE_SIZE);
      const nextTileRow = Math.floor(worldY / TILE_SIZE);

      // Check if the next tile is walkable
      const nextTile = this.getTileAt(nextTileRow, nextTileCol);

      if (nextTile === undefined || !this.WALKABLE_TILES.includes(nextTile as Tile.Grass | Tile.Path)) {
        continue;
      }

      // Handle movement separately for X and Y to prevent diagonal drift
      if (dx !== 0) {
        // Handle X movement
        if (atLeftBound || atRightBound) {
          // Move character in the opposite direction of the map movement
          movement.offsetX.value -= dx;
        } else if (movement.offsetX.value !== 0) {
          // Moving back from edge, first return character to center
          const newOffsetX = movement.offsetX.value + (movement.offsetX.value > 0 ? -speed : speed);
          // Check if we've returned to center
          if (Math.abs(newOffsetX) <= speed) {
            movement.offsetX.value = 0;
          } else {
            movement.offsetX.value = newOffsetX;
          }
        } else {
          // Normal map movement
          movement.mapX.value = Math.min(maxX, Math.max(minX, nextMapX));
        }
      }

      if (dy !== 0) {
        // Handle Y movement
        if (atTopBound || atBottomBound) {
          // Move character in the opposite direction of the map movement
          movement.offsetY.value -= dy;
        } else if (movement.offsetY.value !== 0) {
          // Moving back from edge, first return character to center
          const newOffsetY = movement.offsetY.value + (movement.offsetY.value > 0 ? -speed : speed);
          // Check if we've returned to center
          if (Math.abs(newOffsetY) <= speed) {
            movement.offsetY.value = 0;
          } else {
            movement.offsetY.value = newOffsetY;
          }
        } else {
          // Normal map movement
          movement.mapY.value = Math.min(maxY, Math.max(minY, nextMapY));
        }
      }
    }
  }

  private getTileAt(row: number, col: number): Tile | undefined {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
      return undefined;
    }
    return this.mapData[row][col];
  }
}
