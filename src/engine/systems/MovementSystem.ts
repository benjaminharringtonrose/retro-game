import { GameEngine } from "../GameEngine";
import { System } from "../types/engine";
import { ComponentType, MovementComponent, InputComponent, TransformComponent } from "../types/components";
import { TILE_SIZE } from "../../constants/map";
import { Tile, MapData, CollidableEntity } from "../../types";
import { MOVE_SPEED } from "../../constants/sprites";
import { Dimensions } from "react-native";

const BASE_SPEED = MOVE_SPEED;
const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get("window");

// Constants for boundary calculations
const SCREEN_PADDING = TILE_SIZE; // Minimum padding from screen edge
const HALF_SCREEN_WIDTH = WINDOW_WIDTH / 2;
const HALF_SCREEN_HEIGHT = WINDOW_HEIGHT / 2;

interface EntityComponents {
  movement: MovementComponent;
  input: InputComponent;
  transform: TransformComponent;
}

// Pixel size of the player collision box (smaller than visual sprite)
const PLAYER_HITBOX = {
  width: 24,
  height: 24,
};

export class MovementSystem implements System {
  private readonly WALKABLE_TILES = [Tile.Grass, Tile.Path] as const;
  private readonly BLOCKED_TILES = [Tile.Water, Tile.Tree, Tile.Tree2, Tile.Rock] as const;
  private mapData: Tile[][];
  private cols: number;
  private rows: number;
  private mapWidth: number;
  private mapHeight: number;
  private mapBounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    width: number;
    height: number;
  };
  private collidableEntities: CollidableEntity[] = [];
  private entityComponents: Map<number, EntityComponents> = new Map();
  private lastProcessedEntities: number[] = [];
  private debugFrameCount = 0;

  constructor(mapConfig: MapData) {
    if (!mapConfig || !mapConfig.mapData) {
      throw new Error("MovementSystem requires valid mapConfig with mapData");
    }

    this.mapData = mapConfig.mapData;
    this.rows = mapConfig.mapData.length;
    this.cols = mapConfig.mapData[0]?.length || 0;
    this.mapWidth = this.cols * TILE_SIZE;
    this.mapHeight = this.rows * TILE_SIZE;
    this.collidableEntities = mapConfig.collidableEntities || [];

    // Calculate map boundaries considering the centered player and screen dimensions
    this.mapBounds = this.calculateMapBounds();

    console.log("Map dimensions:", {
      rows: this.rows,
      cols: this.cols,
      width: this.mapWidth,
      height: this.mapHeight,
      bounds: this.mapBounds,
      entities: this.collidableEntities.length,
      window: { width: WINDOW_WIDTH, height: WINDOW_HEIGHT },
    });
  }

  private calculateMapBounds() {
    // For a map smaller than the screen, center it
    const mapSmallerThanScreenX = this.mapWidth < WINDOW_WIDTH;
    const mapSmallerThanScreenY = this.mapHeight < WINDOW_HEIGHT;

    // Calculate boundaries that keep the map on screen
    const maxX = mapSmallerThanScreenX ? (WINDOW_WIDTH - this.mapWidth) / 2 : 0;
    const minX = mapSmallerThanScreenX ? maxX : -(this.mapWidth - WINDOW_WIDTH);

    const maxY = mapSmallerThanScreenY ? (WINDOW_HEIGHT - this.mapHeight) / 2 : 0;
    const minY = mapSmallerThanScreenY ? maxY : -(this.mapHeight - WINDOW_HEIGHT);

    return {
      minX,
      maxX,
      minY,
      maxY,
      width: this.mapWidth,
      height: this.mapHeight,
    };
  }

  private isWithinMapBounds(worldX: number, worldY: number): boolean {
    // For checking if a specific point is within the map's playable area
    return worldX >= 0 && worldX <= this.mapWidth && worldY >= 0 && worldY <= this.mapHeight;
  }

  update(engine: GameEngine, deltaTime: number): void {
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

      this.processEntityMovement(movement, input, transform, shouldLog);
    }

    this.lastProcessedEntities = entities;
  }

  private processEntityMovement(movement: MovementComponent, input: InputComponent, transform: TransformComponent, shouldLog: boolean): void {
    // Calculate movement deltas
    const speed = BASE_SPEED;
    const dx = input.direction.x * speed;
    const dy = input.direction.y * speed;

    // Ensure current position is within map bounds
    this.clampMapPosition(movement);

    // Calculate current world position (center of player)
    const currentWorldX = this.calculateWorldX(movement, transform);
    const currentWorldY = this.calculateWorldY(movement, transform);

    if (shouldLog) {
      this.logCurrentPosition(movement, currentWorldX, currentWorldY, dx, dy);
    }

    // Handle X movement
    if (dx !== 0) {
      this.handleXMovement(movement, transform, dx, currentWorldX, currentWorldY, shouldLog);
    }

    // Handle Y movement
    if (dy !== 0) {
      this.handleYMovement(movement, transform, dy, currentWorldX, currentWorldY, shouldLog);
    }
  }

  private clampMapPosition(movement: MovementComponent): void {
    movement.mapX.value = Math.max(this.mapBounds.minX, Math.min(this.mapBounds.maxX, movement.mapX.value));
    movement.mapY.value = Math.max(this.mapBounds.minY, Math.min(this.mapBounds.maxY, movement.mapY.value));
  }

  private calculateWorldX(movement: MovementComponent, transform: TransformComponent): number {
    return -movement.mapX.value + transform.position.x + movement.offsetX.value;
  }

  private calculateWorldY(movement: MovementComponent, transform: TransformComponent): number {
    return -movement.mapY.value + transform.position.y + movement.offsetY.value;
  }

  private calculateNextMapPosition(currentValue: number, delta: number): { next: number; bounded: number; atMapBoundary: boolean } {
    const next = currentValue + delta;
    const bounded = Math.max(this.mapBounds.minX, Math.min(this.mapBounds.maxX, next));
    const atMapBoundary = bounded !== next;

    return { next, bounded, atMapBoundary };
  }

  private handleXMovement(movement: MovementComponent, transform: TransformComponent, dx: number, currentWorldX: number, currentWorldY: number, shouldLog: boolean): void {
    const { next, bounded, atMapBoundary } = this.calculateNextMapPosition(movement.mapX.value, dx);

    if (atMapBoundary) {
      this.handleMapBoundaryXMovement(movement, dx, currentWorldX, currentWorldY, shouldLog);
      return;
    }

    this.handleNormalXMovement(movement, transform, dx, currentWorldX, currentWorldY, bounded);
  }

  private handleYMovement(movement: MovementComponent, transform: TransformComponent, dy: number, currentWorldX: number, currentWorldY: number, shouldLog: boolean): void {
    const { next, bounded, atMapBoundary } = this.calculateNextMapPosition(movement.mapY.value, dy);

    if (atMapBoundary) {
      this.handleMapBoundaryYMovement(movement, dy, currentWorldX, currentWorldY, shouldLog);
      return;
    }

    this.handleNormalYMovement(movement, transform, dy, currentWorldX, currentWorldY, bounded);
  }

  private handleMapBoundaryXMovement(movement: MovementComponent, dx: number, currentWorldX: number, currentWorldY: number, shouldLog: boolean): void {
    const newOffsetX = movement.offsetX.value - dx;
    const maxScreenOffset = this.calculateMaxScreenOffsetX();

    if (this.isWithinScreenBounds(newOffsetX, maxScreenOffset)) {
      const nextWorldXWithOffset = currentWorldX + dx;
      if (this.canMoveToPosition(nextWorldXWithOffset, currentWorldY)) {
        movement.offsetX.value = newOffsetX;
        if (shouldLog) console.log("Player moving at boundary, offset:", newOffsetX);
      }
    }
  }

  private handleMapBoundaryYMovement(movement: MovementComponent, dy: number, currentWorldX: number, currentWorldY: number, shouldLog: boolean): void {
    const newOffsetY = movement.offsetY.value - dy;
    const maxScreenOffset = this.calculateMaxScreenOffsetY();

    if (this.isWithinScreenBounds(newOffsetY, maxScreenOffset)) {
      const nextWorldYWithOffset = currentWorldY + dy;
      if (this.canMoveToPosition(currentWorldX, nextWorldYWithOffset)) {
        movement.offsetY.value = newOffsetY;
        if (shouldLog) console.log("Player moving at boundary, offset:", newOffsetY);
      }
    }
  }

  private handleNormalXMovement(movement: MovementComponent, transform: TransformComponent, dx: number, currentWorldX: number, currentWorldY: number, boundedMapX: number): void {
    if (movement.offsetX.value !== 0) {
      this.handleOffsetXMovement(movement, dx, currentWorldX, currentWorldY);
    } else {
      this.handleCenteredXMovement(movement, transform, dx, currentWorldX, currentWorldY, boundedMapX);
    }
  }

  private handleNormalYMovement(movement: MovementComponent, transform: TransformComponent, dy: number, currentWorldX: number, currentWorldY: number, boundedMapY: number): void {
    if (movement.offsetY.value !== 0) {
      this.handleOffsetYMovement(movement, dy, currentWorldX, currentWorldY);
    } else {
      this.handleCenteredYMovement(movement, transform, dy, currentWorldX, currentWorldY, boundedMapY);
    }
  }

  private handleOffsetXMovement(movement: MovementComponent, dx: number, currentWorldX: number, currentWorldY: number): void {
    const isMovingTowardCenter = (movement.offsetX.value > 0 && dx < 0) || (movement.offsetX.value < 0 && dx > 0);

    if (isMovingTowardCenter) {
      this.reduceOffsetX(movement, dx);
    } else {
      this.handleMovingAwayFromCenterX(movement, dx, currentWorldX, currentWorldY);
    }
  }

  private handleOffsetYMovement(movement: MovementComponent, dy: number, currentWorldX: number, currentWorldY: number): void {
    const isMovingTowardCenter = (movement.offsetY.value > 0 && dy < 0) || (movement.offsetY.value < 0 && dy > 0);

    if (isMovingTowardCenter) {
      this.reduceOffsetY(movement, dy);
    } else {
      this.handleMovingAwayFromCenterY(movement, dy, currentWorldX, currentWorldY);
    }
  }

  private reduceOffsetX(movement: MovementComponent, dx: number): void {
    const offsetReduction = Math.min(Math.abs(dx), Math.abs(movement.offsetX.value)) * Math.sign(movement.offsetX.value) * -1;
    movement.offsetX.value += offsetReduction;
  }

  private reduceOffsetY(movement: MovementComponent, dy: number): void {
    const offsetReduction = Math.min(Math.abs(dy), Math.abs(movement.offsetY.value)) * Math.sign(movement.offsetY.value) * -1;
    movement.offsetY.value += offsetReduction;
  }

  private handleMovingAwayFromCenterX(movement: MovementComponent, dx: number, currentWorldX: number, currentWorldY: number): void {
    const newOffsetX = movement.offsetX.value - dx;
    const maxScreenOffset = this.calculateMaxScreenOffsetX();

    if (this.isWithinScreenBounds(newOffsetX, maxScreenOffset)) {
      const nextWorldXWithOffset = currentWorldX + dx;
      if (this.canMoveToPosition(nextWorldXWithOffset, currentWorldY)) {
        movement.offsetX.value = newOffsetX;
      }
    }
  }

  private handleMovingAwayFromCenterY(movement: MovementComponent, dy: number, currentWorldX: number, currentWorldY: number): void {
    const newOffsetY = movement.offsetY.value - dy;
    const maxScreenOffset = this.calculateMaxScreenOffsetY();

    if (this.isWithinScreenBounds(newOffsetY, maxScreenOffset)) {
      const nextWorldYWithOffset = currentWorldY + dy;
      if (this.canMoveToPosition(currentWorldX, nextWorldYWithOffset)) {
        movement.offsetY.value = newOffsetY;
      }
    }
  }

  private handleCenteredXMovement(movement: MovementComponent, transform: TransformComponent, dx: number, currentWorldX: number, currentWorldY: number, boundedMapX: number): void {
    const nextWorldX = -boundedMapX + transform.position.x + movement.offsetX.value;
    if (this.canMoveToPosition(nextWorldX, currentWorldY)) {
      movement.mapX.value = boundedMapX;
    }
  }

  private handleCenteredYMovement(movement: MovementComponent, transform: TransformComponent, dy: number, currentWorldX: number, currentWorldY: number, boundedMapY: number): void {
    const nextWorldY = -boundedMapY + transform.position.y + movement.offsetY.value;
    if (this.canMoveToPosition(currentWorldX, nextWorldY)) {
      movement.mapY.value = boundedMapY;
    }
  }

  private calculateMaxScreenOffsetX(): number {
    return WINDOW_WIDTH / 2 - PLAYER_HITBOX.width / 2;
  }

  private calculateMaxScreenOffsetY(): number {
    return WINDOW_HEIGHT / 2 - PLAYER_HITBOX.height / 2;
  }

  private isWithinScreenBounds(offset: number, maxOffset: number): boolean {
    return Math.abs(offset) <= maxOffset;
  }

  private canMoveToPosition(worldX: number, worldY: number): boolean {
    // Get the four corners of the player hitbox
    const left = worldX - PLAYER_HITBOX.width / 2;
    const right = worldX + PLAYER_HITBOX.width / 2;
    const top = worldY - PLAYER_HITBOX.height / 2;
    const bottom = worldY + PLAYER_HITBOX.height / 2;

    // Get tile positions for all four corners
    const positions = [
      { row: Math.floor(top / TILE_SIZE), col: Math.floor(left / TILE_SIZE) }, // Top-left
      { row: Math.floor(top / TILE_SIZE), col: Math.floor(right / TILE_SIZE) }, // Top-right
      { row: Math.floor(bottom / TILE_SIZE), col: Math.floor(left / TILE_SIZE) }, // Bottom-left
      { row: Math.floor(bottom / TILE_SIZE), col: Math.floor(right / TILE_SIZE) }, // Bottom-right
      { row: Math.floor(worldY / TILE_SIZE), col: Math.floor(worldX / TILE_SIZE) }, // Center
    ];

    // Check if any corner is out of bounds or on an unwalkable tile
    for (const pos of positions) {
      // Check map bounds
      if (pos.row < 0 || pos.row >= this.rows || pos.col < 0 || pos.col >= this.cols) {
        return false;
      }

      // Check tile type
      const tile = this.mapData[pos.row][pos.col];
      if (!this.WALKABLE_TILES.includes(tile as Tile.Grass)) {
        return false;
      }
    }

    // Check collision with entities
    for (const entity of this.collidableEntities) {
      const entityBounds = {
        left: entity.position.col * TILE_SIZE,
        top: entity.position.row * TILE_SIZE,
        right: (entity.position.col + entity.collision.width) * TILE_SIZE,
        bottom: (entity.position.row + entity.collision.height) * TILE_SIZE,
      };

      const playerBounds = {
        left,
        top,
        right,
        bottom,
      };

      if (this.intersect(playerBounds, entityBounds)) {
        return false;
      }
    }

    return true;
  }

  private intersect(rect1: any, rect2: any): boolean {
    return !(rect1.right < rect2.left || rect1.left > rect2.right || rect1.bottom < rect2.top || rect1.top > rect2.bottom);
  }

  private logCurrentPosition(movement: MovementComponent, worldX: number, worldY: number, dx: number, dy: number): void {
    const tileCol = Math.floor(worldX / TILE_SIZE);
    const tileRow = Math.floor(worldY / TILE_SIZE);
    let tileType = "unknown";

    if (tileRow >= 0 && tileRow < this.rows && tileCol >= 0 && tileCol < this.cols) {
      tileType = this.mapData[tileRow][tileCol].toString();
    }

    console.log("Position Debug:", {
      world: { x: worldX, y: worldY },
      map: { x: movement.mapX.value, y: movement.mapY.value },
      offset: { x: movement.offsetX.value, y: movement.offsetY.value },
      tile: { row: tileRow, col: tileCol, type: tileType },
      movement: { dx, dy },
      mapBounds: this.mapBounds,
    });
  }

  private haveEntitiesChanged(entities: number[]): boolean {
    if (entities.length !== this.lastProcessedEntities.length) return true;
    return entities.some((id, index) => id !== this.lastProcessedEntities[index]);
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
}
