import { Entity, SystemProps } from "../../types";

const TOTAL_COLUMNS = 3; // Spritesheet has 3 columns per row
const FRAME_DURATION = 150; // How long each frame shows for in milliseconds

export const AnimationSystem = (entities: { [key: string]: Entity }, { time, delta = 16.666 }: SystemProps) => {
  Object.keys(entities).forEach((id) => {
    const entity = entities[id];

    if (!entity.animation || !entity.movement) {
      return;
    }

    // Initialize or update accumulated time
    if (!entity.animation.accumulatedTime) {
      entity.animation.accumulatedTime = 0;
    }

    if (entity.movement.isMoving) {
      // Accumulate time
      entity.animation.accumulatedTime += delta;

      // Check if enough time has passed for next frame
      if (entity.animation.accumulatedTime >= FRAME_DURATION) {
        // Update frame
        entity.animation.currentFrame = (entity.animation.currentFrame + 1) % TOTAL_COLUMNS;
        // Reset accumulated time, keeping remainder for smoother animation
        entity.animation.accumulatedTime = entity.animation.accumulatedTime % FRAME_DURATION;
      }
    } else {
      // Reset to middle frame (1) when not moving
      entity.animation.currentFrame = 1;
      entity.animation.accumulatedTime = 0;
    }
  });

  return entities;
};
