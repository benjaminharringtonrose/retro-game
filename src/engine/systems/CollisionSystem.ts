import { GameEngine } from "../GameEngine";
import { System } from "../types/engine";
import { ComponentType, MovementComponent, InputComponent, TransformComponent } from "../types/components";
import { TILE_SIZE } from "../../constants/map";
import { CollidableEntity } from "../../types";

// Define player hitbox size, matching what's in MovementSystem
const PLAYER_HITBOX = {
  width: TILE_SIZE / 2,
  height: TILE_SIZE / 2,
};

interface Bounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export class CollisionSystem implements System {
  private collidableEntities: CollidableEntity[];
  private debugFrameCount = 0;

  constructor(collidableEntities: CollidableEntity[]) {
    this.collidableEntities = collidableEntities || [];
    console.log(`CollisionSystem initialized with ${this.collidableEntities.length} entities`);
  }

  update(engine: GameEngine, deltaTime: number): void {
    // We're not handling movement here anymore - that's the MovementSystem's job
    // This is now just a verification system to ensure collisions are being detected correctly

    const shouldLog = this.debugFrameCount % 60 === 0; // Less frequent logging
    this.debugFrameCount++;

    // Only run the verification if we should log
    if (!shouldLog) return;

    const entities = engine.getEntitiesWithComponents([ComponentType.Movement, ComponentType.Transform]);

    for (const entityId of entities) {
      const movement = engine.getComponent<MovementComponent>(entityId, ComponentType.Movement);
      const transform = engine.getComponent<TransformComponent>(entityId, ComponentType.Transform);

      if (!movement || !transform) continue;

      // Calculate world position (center of player)
      const worldX = -movement.mapX.value + transform.position.x;
      const worldY = -movement.mapY.value + transform.position.y;

      // Create player bounds
      const playerBounds = {
        left: worldX - PLAYER_HITBOX.width / 2,
        right: worldX + PLAYER_HITBOX.width / 2,
        top: worldY - PLAYER_HITBOX.height / 2,
        bottom: worldY + PLAYER_HITBOX.height / 2,
      };

      // Check for any entity collisions
      for (const entity of this.collidableEntities) {
        const entityBounds = this.getEntityBounds(entity);

        if (this.checkCollision(playerBounds, entityBounds)) {
          console.warn("COLLISION DETECTED: Player overlapping with entity", {
            entity: entity.type,
            playerPos: { x: worldX, y: worldY },
            entityPos: { row: entity.position.row, col: entity.position.col },
          });
        }
      }
    }
  }

  private getEntityBounds(entity: CollidableEntity): Bounds {
    const size = {
      width: entity.collision.width * TILE_SIZE,
      height: entity.collision.height * TILE_SIZE,
    };

    const scaledSize = {
      width: size.width * entity.collision.scale,
      height: size.height * entity.collision.scale,
    };

    const offset = {
      left: (scaledSize.width - size.width) / 2,
      top: (scaledSize.height - size.height) / 2,
    };

    return {
      left: entity.position.col * TILE_SIZE - offset.left,
      top: entity.position.row * TILE_SIZE - offset.top,
      right: entity.position.col * TILE_SIZE - offset.left + scaledSize.width,
      bottom: entity.position.row * TILE_SIZE - offset.top + scaledSize.height,
    };
  }

  private checkCollision(a: Bounds, b: Bounds): boolean {
    return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
  }
}
