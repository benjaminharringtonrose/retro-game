import { GameEngine } from "../GameEngine";
import { System } from "../types/engine";
import { ComponentType, MovementComponent, InputComponent, TransformComponent } from "../types/components";
import { TILE_SIZE } from "../../constants/map";
import { Tile } from "../../types";
import { MOVE_SPEED } from "../../constants/sprites";
import { runOnJS, withTiming } from "react-native-reanimated";

const BASE_SPEED = MOVE_SPEED;
const SCREEN_MARGIN = 100; // Distance from screen edge before map scrolls

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
  private entityComponents: Map<number, EntityComponents> = new Map();
  private lastProcessedEntities: number[] = [];

  constructor(mapData: Tile[][]) {
    this.mapData = mapData;
    this.rows = mapData.length;
    this.cols = mapData[0]?.length || 0;
  }

  update(engine: GameEngine, deltaTime: number): void {
    const entities = engine.getEntitiesWithComponents([ComponentType.Movement, ComponentType.Input, ComponentType.Transform]);

    // Check if we need to update our cached components
    const entitiesChanged = this.haveEntitiesChanged(entities);
    if (entitiesChanged) {
      this.updateEntityComponents(engine, entities);
    }

    // Process movement for each entity
    for (const entityId of entities) {
      const components = this.entityComponents.get(entityId);
      if (!components) continue;

      const { movement, input, transform } = components;

      if (!input.isMoving) {
        continue;
      }

      // Calculate movement speed
      const speed = BASE_SPEED;
      const dx = input.direction.x * speed;
      const dy = input.direction.y * speed;

      // Calculate next positions
      const nextMapX = movement.mapX.value + dx;
      const nextMapY = movement.mapY.value + dy;
      const nextOffsetX = movement.offsetX.value;
      const nextOffsetY = movement.offsetY.value;

      // Calculate map bounds once
      const bounds = this.calculateBounds(transform);

      // Check if we're at map boundaries
      const atBounds = this.checkBoundaries(nextMapX, nextMapY, dx, dy, bounds);

      // Calculate world position for collision detection
      const worldPos = this.calculateWorldPosition(nextMapX, nextMapY, transform, nextOffsetX, nextOffsetY, dx, dy, atBounds);

      // Get tile coordinates for the next position
      const nextTile = this.getTileAtWorldPos(worldPos.x, worldPos.y);

      if (nextTile === undefined || !this.WALKABLE_TILES.includes(nextTile as Tile.Grass | Tile.Path)) {
        continue;
      }

      // Handle movement
      this.processMovement(movement, dx, dy, nextMapX, nextMapY, bounds, atBounds);
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

  private calculateBounds(transform: TransformComponent) {
    return {
      maxX: 0,
      minX: -(this.cols * TILE_SIZE - transform.position.x * 2),
      maxY: 0,
      minY: -(this.rows * TILE_SIZE - transform.position.y * 2),
    };
  }

  private checkBoundaries(nextMapX: number, nextMapY: number, dx: number, dy: number, bounds: any) {
    return {
      atLeftBound: nextMapX >= bounds.maxX && dx > 0,
      atRightBound: nextMapX <= bounds.minX && dx < 0,
      atTopBound: nextMapY >= bounds.maxY && dy > 0,
      atBottomBound: nextMapY <= bounds.minY && dy < 0,
    };
  }

  private calculateWorldPosition(nextMapX: number, nextMapY: number, transform: TransformComponent, nextOffsetX: number, nextOffsetY: number, dx: number, dy: number, atBounds: any) {
    return {
      x: -nextMapX + transform.position.x + nextOffsetX + (atBounds.atLeftBound || atBounds.atRightBound ? -dx : 0),
      y: -nextMapY + transform.position.y + nextOffsetY + (atBounds.atTopBound || atBounds.atBottomBound ? -dy : 0),
    };
  }

  private getTileAtWorldPos(worldX: number, worldY: number): Tile | undefined {
    const nextTileCol = Math.floor(worldX / TILE_SIZE);
    const nextTileRow = Math.floor(worldY / TILE_SIZE);
    return this.getTileAt(nextTileRow, nextTileCol);
  }

  private processMovement(movement: MovementComponent, dx: number, dy: number, nextMapX: number, nextMapY: number, bounds: any, atBounds: any): void {
    const speed = BASE_SPEED;

    // Handle X movement
    if (dx !== 0) {
      if (atBounds.atLeftBound || atBounds.atRightBound) {
        movement.offsetX.value -= dx;
      } else if (movement.offsetX.value !== 0) {
        const newOffsetX = movement.offsetX.value + (movement.offsetX.value > 0 ? -speed : speed);
        movement.offsetX.value = Math.abs(newOffsetX) <= speed ? 0 : newOffsetX;
      } else {
        movement.mapX.value = Math.min(bounds.maxX, Math.max(bounds.minX, nextMapX));
      }
    }

    // Handle Y movement
    if (dy !== 0) {
      if (atBounds.atTopBound || atBounds.atBottomBound) {
        movement.offsetY.value -= dy;
      } else if (movement.offsetY.value !== 0) {
        const newOffsetY = movement.offsetY.value + (movement.offsetY.value > 0 ? -speed : speed);
        movement.offsetY.value = Math.abs(newOffsetY) <= speed ? 0 : newOffsetY;
      } else {
        movement.mapY.value = Math.min(bounds.maxY, Math.max(bounds.minY, nextMapY));
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
