import { GameEngine } from "../GameEngine";
import { System } from "../types/engine";
import { ComponentType, AnimationComponent, InputComponent } from "../types/components";

export class AnimationSystem implements System {
  private accumulatedTime: number = 0;

  update(engine: GameEngine, deltaTime: number): void {
    const entities = engine.getEntitiesWithComponents([ComponentType.Animation, ComponentType.Input]);

    for (const entity of entities) {
      const animation = engine.getComponent<AnimationComponent>(entity, ComponentType.Animation);
      const input = engine.getComponent<InputComponent>(entity, ComponentType.Input);

      if (!animation || !input) continue;

      if (!input.isMoving) {
        animation.currentFrame = 0;
        animation.isPlaying = false;
        continue;
      }

      if (!animation.isPlaying) {
        animation.isPlaying = true;
        this.accumulatedTime = 0;
      }

      // Update frame based on frame rate
      this.accumulatedTime += deltaTime;
      if (this.accumulatedTime >= 1 / animation.frameRate) {
        animation.currentFrame = (animation.currentFrame + 1) % animation.frames;
        this.accumulatedTime = 0;
      }
    }
  }
}
