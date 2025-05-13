import { Entity, Component, ComponentType, Vector2D, TransformComponent, SpriteComponent, AnimationComponent, InputComponent, MovementComponent } from "./types";
import { SharedValue } from "react-native-reanimated";

export class EntityFactory {
  private static nextEntityId = 0;

  static createPlayer(position: Vector2D, mapX: SharedValue<number>, mapY: SharedValue<number>, offsetX: SharedValue<number>, offsetY: SharedValue<number>, spriteSource: any): Entity {
    const components = new Set<Component>();

    // Transform component
    components.add({
      type: ComponentType.Transform,
      position,
      scale: { x: 1, y: 1 },
      rotation: 0,
    } as TransformComponent);

    // Sprite component
    components.add({
      type: ComponentType.Sprite,
      source: spriteSource,
      width: 32,
      height: 40,
    } as SpriteComponent);

    // Animation component
    components.add({
      type: ComponentType.Animation,
      frames: 3,
      currentFrame: 0,
      frameWidth: 32,
      frameHeight: 40,
      frameRate: 7,
      isPlaying: false,
    } as AnimationComponent);

    // Input component
    components.add({
      type: ComponentType.Input,
      direction: { x: 0, y: 0 },
      isMoving: false,
    } as InputComponent);

    // Movement component
    components.add({
      type: ComponentType.Movement,
      velocity: { x: 0, y: 0 },
      speed: 200,
      mapX,
      mapY,
      offsetX,
      offsetY,
    } as MovementComponent);

    return {
      id: `entity_${EntityFactory.nextEntityId++}`,
      components,
    };
  }

  static createNPC(position: Vector2D, spriteSource: any): Entity {
    const components = new Set<Component>();

    components.add({
      type: ComponentType.Transform,
      position,
      scale: { x: 1, y: 1 },
      rotation: 0,
    } as TransformComponent);

    components.add({
      type: ComponentType.Sprite,
      source: spriteSource,
      width: 32,
      height: 40,
    } as SpriteComponent);

    return {
      id: `entity_${EntityFactory.nextEntityId++}`,
      components,
    };
  }
}
