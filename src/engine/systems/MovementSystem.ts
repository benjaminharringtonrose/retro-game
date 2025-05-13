import { System, GameEngine } from "../GameEngine";
import { ComponentType, MovementComponent, InputComponent, TransformComponent } from "../types";
import { TILE_SIZE } from "../../constants/map";
import { Tile } from "../../types";
import { MOVE_SPEED } from "../../constants/sprites";
import { runOnJS, withTiming } from "react-native-reanimated";

const BASE_SPEED = MOVE_SPEED; // Use the consistent speed from constants

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

      // Calculate next position
      const nextMapX = movement.mapX.value + dx;
      const nextMapY = movement.mapY.value + dy;

      // Calculate world position for collision detection
      const worldX = -nextMapX + transform.position.x;
      const worldY = -nextMapY + transform.position.y;

      // Get tile coordinates
      const nextTileCol = Math.floor(worldX / TILE_SIZE);
      const nextTileRow = Math.floor(worldY / TILE_SIZE);

      // Check if the next tile is walkable
      const nextTile = this.getTileAt(nextTileRow, nextTileCol);
      if (nextTile === undefined || !this.WALKABLE_TILES.includes(nextTile as Tile.Grass | Tile.Path)) {
        continue;
      }

      // Calculate bounds
      const maxX = 0;
      const minX = -(this.cols * TILE_SIZE - transform.position.x * 2);
      const maxY = 0;
      const minY = -(this.rows * TILE_SIZE - transform.position.y * 2);

      // Update map position with bounds checking using Reanimated
      const targetX = Math.min(maxX, Math.max(minX, nextMapX));
      const targetY = Math.min(maxY, Math.max(minY, nextMapY));

      movement.mapX.value = targetX;
      movement.mapY.value = targetY;
    }
  }

  private getTileAt(row: number, col: number): Tile | undefined {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
      return undefined;
    }
    return this.mapData[row][col];
  }
}
