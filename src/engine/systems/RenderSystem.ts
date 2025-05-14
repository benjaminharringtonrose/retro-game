import { System, IGameEngine } from "../types/engine";
import { ComponentType, RenderComponent, TransformComponent, AnimationComponent } from "../types/components";

export class RenderSystem implements System {
  update(engine: IGameEngine, deltaTime: number): void {
    const entities = engine.getEntitiesWithComponents([ComponentType.Render, ComponentType.Transform]);

    for (const entity of entities) {
      const sprite = engine.getComponent<RenderComponent>(entity, ComponentType.Render);
      const transform = engine.getComponent<TransformComponent>(entity, ComponentType.Transform);
      const animation = engine.getComponent<AnimationComponent>(entity, ComponentType.Animation);

      if (!sprite || !transform) continue;

      // Update sprite animation
      if (animation) {
        sprite.animatedStyle = {
          position: "absolute",
          width: sprite.spritesheet.width * animation.frames,
          height: sprite.spritesheet.height,
          transform: [{ translateX: transform.position.x }, { translateY: transform.position.y }, { scale: transform.scale.x }, { rotate: `${transform.rotation}rad` }],
        };
      } else {
        sprite.animatedStyle = {
          position: "absolute",
          width: sprite.spritesheet.width,
          height: sprite.spritesheet.height,
          transform: [{ translateX: transform.position.x }, { translateY: transform.position.y }, { scale: transform.scale.x }, { rotate: `${transform.rotation}rad` }],
        };
      }
    }
  }
}
