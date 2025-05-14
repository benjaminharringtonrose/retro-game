import { GameEngine } from "../GameEngine";
import { System } from "../types/engine";
import { ComponentType, MovementComponent, InputComponent, TransformComponent } from "../types/components";
import { Portal, PortalEntryPoint } from "../types/PortalTypes";
import { TILE_SIZE } from "../../constants/map";
import { MapType } from "../../types";

export class PortalSystem implements System {
  private portals: Portal[];
  private isTransitioning: boolean = false;
  private onMapTransition: (newMapType: MapType) => void;

  constructor(portals: Portal[], onMapTransition: (newMapType: MapType) => void) {
    this.portals = portals;
    this.onMapTransition = onMapTransition;
  }

  update(engine: GameEngine, deltaTime: number): void {
    if (this.isTransitioning) return;

    const entities = engine.getEntitiesWithComponents([ComponentType.Movement, ComponentType.Input, ComponentType.Transform]);

    for (const entityId of entities) {
      const movement = engine.getComponent<MovementComponent>(entityId, ComponentType.Movement);
      const input = engine.getComponent<InputComponent>(entityId, ComponentType.Input);
      const transform = engine.getComponent<TransformComponent>(entityId, ComponentType.Transform);

      if (!movement || !input || !transform) continue;

      // Calculate world position
      const worldX = transform.position.x - movement.mapX.value;
      const worldY = transform.position.y - movement.mapY.value;

      // Check each portal
      for (const portal of this.portals) {
        if (this.checkPortalTrigger(portal.entryPoint, worldX, worldY, input)) {
          this.triggerPortal(portal, movement, input);
          break;
        }
      }
    }
  }

  private checkPortalTrigger(entryPoint: PortalEntryPoint, worldX: number, worldY: number, input: InputComponent): boolean {
    const bounds = {
      left: entryPoint.bounds.x,
      right: entryPoint.bounds.x + entryPoint.bounds.width,
      top: entryPoint.bounds.y,
      bottom: entryPoint.bounds.y + entryPoint.bounds.height,
    };

    // Check if player is within portal bounds
    const isInBounds = worldX >= bounds.left && worldX <= bounds.right && worldY >= bounds.top && worldY <= bounds.bottom;

    // Check direction requirement if specified
    if (entryPoint.requiredDirection && input.direction) {
      switch (entryPoint.requiredDirection) {
        case "up":
          return isInBounds && input.direction.y < 0;
        case "down":
          return isInBounds && input.direction.y > 0;
        case "left":
          return isInBounds && input.direction.x < 0;
        case "right":
          return isInBounds && input.direction.x > 0;
      }
    }

    return isInBounds;
  }

  private triggerPortal(portal: Portal, movement: MovementComponent, input: InputComponent): void {
    this.isTransitioning = true;

    // Notify about map change
    this.onMapTransition(portal.destination.mapType);

    // Update map position
    movement.mapX.value = portal.destination.position.x;
    movement.mapY.value = portal.destination.position.y;

    // Update player direction if specified
    if (portal.destination.facingDirection) {
      switch (portal.destination.facingDirection) {
        case "up":
          input.direction = { x: 0, y: -1 };
          break;
        case "down":
          input.direction = { x: 0, y: 1 };
          break;
        case "left":
          input.direction = { x: -1, y: 0 };
          break;
        case "right":
          input.direction = { x: 1, y: 0 };
          break;
      }
    }

    // Handle transition effect
    if (portal.transition) {
      setTimeout(() => {
        this.isTransitioning = false;
      }, portal.transition.duration);
    } else {
      this.isTransitioning = false;
    }
  }
}
