import { System, GameEngine } from "../GameEngine";
import { ComponentType, SpriteComponent, TransformComponent, AnimationComponent, MovementComponent } from "../types";

export class RenderSystem implements System {
  update(engine: GameEngine, deltaTime: number): void {
    const entities = engine.getEntitiesWithComponents([ComponentType.Sprite, ComponentType.Transform]);

    for (const entity of entities) {
      const sprite = engine.getComponent<SpriteComponent>(entity, ComponentType.Sprite);
      const transform = engine.getComponent<TransformComponent>(entity, ComponentType.Transform);
      const animation = engine.getComponent<AnimationComponent>(entity, ComponentType.Animation);

      if (!sprite || !transform) continue;

      // Update sprite animation
      if (animation) {
        sprite.animatedStyle = {
          position: "absolute",
          width: animation.frameWidth * animation.frames,
          height: animation.frameHeight,
          left: -animation.currentFrame * animation.frameWidth,
          transform: [{ translateX: transform.position.x }, { translateY: transform.position.y }, { scale: transform.scale.x }, { rotate: `${transform.rotation}rad` }],
        };
      } else {
        sprite.animatedStyle = {
          position: "absolute",
          width: sprite.width,
          height: sprite.height,
          transform: [{ translateX: transform.position.x }, { translateY: transform.position.y }, { scale: transform.scale.x }, { rotate: `${transform.rotation}rad` }],
        };
      }
    }
  }
}
