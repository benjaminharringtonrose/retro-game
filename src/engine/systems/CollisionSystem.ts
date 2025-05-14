import { GameEngine } from "../GameEngine";
import { System } from "../types/engine";
import { ComponentType, MovementComponent, InputComponent, TransformComponent } from "../types/components";
import { TILE_SIZE } from "../../constants/map";
import { CollidableEntity } from "../../types";

export class CollisionSystem implements System {
  private collidableEntities: CollidableEntity[];
  private debugFrameCount = 0;

  constructor(collidableEntities: CollidableEntity[]) {
    this.collidableEntities = collidableEntities;
  }

  update(engine: GameEngine, deltaTime: number): void {
    const shouldLog = this.debugFrameCount % 30 === 0;
    this.debugFrameCount++;

    const entities = engine.getEntitiesWithComponents([ComponentType.Movement, ComponentType.Input, ComponentType.Transform]);

    for (const entityId of entities) {
      const movement = engine.getComponent<MovementComponent>(entityId, ComponentType.Movement);
      const input = engine.getComponent<InputComponent>(entityId, ComponentType.Input);
      const transform = engine.getComponent<TransformComponent>(entityId, ComponentType.Transform);

      if (!movement || !input || !transform) continue;
      if (!input.isMoving) continue;

      const speed = 5;
      const dx = input.direction.x * speed;
      const dy = input.direction.y * speed;

      // Calculate world positions
      const currentWorldX = transform.position.x - movement.mapX.value;
      const currentWorldY = transform.position.y - movement.mapY.value;
      const nextWorldX = currentWorldX - dx; // Note the negative dx because map moves opposite to player
      const nextWorldY = currentWorldY - dy; // Note the negative dy because map moves opposite to player

      if (shouldLog) {
        console.log("Position Debug:", {
          currentWorld: { x: currentWorldX, y: currentWorldY },
          nextWorld: { x: nextWorldX, y: nextWorldY },
          movement: { dx, dy },
          mapPos: { x: movement.mapX.value, y: movement.mapY.value },
        });
      }

      // Player hitbox (smaller than tile size)
      const playerHitbox = {
        width: TILE_SIZE / 2,
        height: TILE_SIZE / 2,
      };

      // Check collisions for each axis separately
      let collisionX = false;
      let collisionY = false;

      for (const entity of this.collidableEntities) {
        const entityBounds = {
          left: entity.position.col * TILE_SIZE,
          top: entity.position.row * TILE_SIZE,
          right: (entity.position.col + entity.collision.width) * TILE_SIZE,
          bottom: (entity.position.row + entity.collision.height) * TILE_SIZE,
        };

        // Test X movement
        const playerBoundsX = {
          left: nextWorldX - playerHitbox.width / 2,
          right: nextWorldX + playerHitbox.width / 2,
          top: currentWorldY - playerHitbox.height / 2,
          bottom: currentWorldY + playerHitbox.height / 2,
        };

        // Test Y movement
        const playerBoundsY = {
          left: currentWorldX - playerHitbox.width / 2,
          right: currentWorldX + playerHitbox.width / 2,
          top: nextWorldY - playerHitbox.height / 2,
          bottom: nextWorldY + playerHitbox.height / 2,
        };

        if (dx !== 0 && this.checkCollision(playerBoundsX, entityBounds)) {
          collisionX = true;
          if (shouldLog) {
            console.log("X Collision detected", { playerBoundsX, entityBounds });
          }
        }

        if (dy !== 0 && this.checkCollision(playerBoundsY, entityBounds)) {
          collisionY = true;
          if (shouldLog) {
            console.log("Y Collision detected", { playerBoundsY, entityBounds });
          }
        }
      }

      // Apply collision response
      if (collisionX) {
        // Only prevent the movement in the collision direction
        movement.mapX.value = movement.mapX.value;
      } else {
        movement.mapX.value += dx;
      }

      if (collisionY) {
        // Only prevent the movement in the collision direction
        movement.mapY.value = movement.mapY.value;
      } else {
        movement.mapY.value += dy;
      }
    }
  }

  private checkCollision(a: Bounds, b: Bounds): boolean {
    return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
  }
}

interface Bounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}
