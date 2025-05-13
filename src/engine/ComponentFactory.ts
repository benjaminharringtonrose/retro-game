import { SharedValue } from "react-native-reanimated";
import { ComponentType, MovementComponent, InputComponent, TransformComponent, RenderComponent, Vector2D } from "./types/components";
import { EntityConfig, EntityType } from "./types/EntityTypes";

export class ComponentFactory {
  static createMovementComponent(mapX: SharedValue<number>, mapY: SharedValue<number>, offsetX: SharedValue<number>, offsetY: SharedValue<number>): MovementComponent {
    return {
      type: ComponentType.Movement,
      mapX,
      mapY,
      offsetX,
      offsetY,
      velocity: { x: 0, y: 0 },
      speed: 0,
    };
  }

  static createInputComponent(isControlled: boolean = false): InputComponent {
    return {
      type: ComponentType.Input,
      direction: { x: 0, y: 1 },
      isMoving: false,
      isControlled,
    };
  }

  static createTransformComponent(position: Vector2D): TransformComponent {
    return {
      type: ComponentType.Transform,
      position: { ...position },
      scale: { x: 1, y: 1 },
      rotation: { x: 0, y: 0 },
    };
  }

  static createRenderComponent(spritesheet: any, initialDirection: Vector2D = { x: 0, y: 1 }): RenderComponent {
    return {
      type: ComponentType.Render,
      spritesheet,
      currentFrame: 0,
      direction: { x: 0, y: 1 },
    };
  }

  static createComponentsFromConfig(
    config: EntityConfig,
    sharedValues?: {
      mapX?: SharedValue<number>;
      mapY?: SharedValue<number>;
      offsetX?: SharedValue<number>;
      offsetY?: SharedValue<number>;
    }
  ) {
    const components: (TransformComponent | RenderComponent | MovementComponent | InputComponent)[] = [this.createTransformComponent(config.position)];

    if (config.spritesheet) {
      components.push(this.createRenderComponent(config.spritesheet, { x: 0, y: 1 }));
    }

    if (sharedValues && (config.type === EntityType.PLAYER || config.type === EntityType.NPC)) {
      if (sharedValues.mapX && sharedValues.mapY && sharedValues.offsetX && sharedValues.offsetY) {
        components.push(this.createMovementComponent(sharedValues.mapX, sharedValues.mapY, sharedValues.offsetX, sharedValues.offsetY));
        components.push(this.createInputComponent(config.isControlled));
      }
    }

    return components;
  }
}
