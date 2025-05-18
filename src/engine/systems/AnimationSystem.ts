import { Entity, SystemProps } from "../../types";

const TOTAL_COLUMNS = 3; // Spritesheet has 3 columns per row
const FRAME_DURATION = 200; // Increased duration for slower animation to match slower movement
const TRANSITION_FRAMES = 2; // Number of frames to transition when changing direction

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

    // For NPCs, adjust animation based on movement state
    if (id.startsWith("npc")) {
      if (entity.movement.isMoving) {
        // Accumulate time
        entity.animation.accumulatedTime += delta;

        // Check if enough time has passed for next frame
        if (entity.animation.accumulatedTime >= FRAME_DURATION) {
          // Update frame with smoother transition
          const nextFrame = (entity.animation.currentFrame + 1) % TOTAL_COLUMNS;
          entity.animation.currentFrame = nextFrame;

          // Reset accumulated time, keeping remainder for smoother animation
          entity.animation.accumulatedTime = entity.animation.accumulatedTime % FRAME_DURATION;
        }
      } else {
        // When not moving, gradually return to idle frame (1)
        if (entity.animation.currentFrame !== 1) {
          entity.animation.accumulatedTime += delta;
          if (entity.animation.accumulatedTime >= FRAME_DURATION / 2) {
            // Faster transition to idle
            entity.animation.currentFrame = 1;
            entity.animation.accumulatedTime = 0;
          }
        }
      }
    } else {
      // For non-NPCs (like player), use original animation logic
      if (entity.movement.isMoving) {
        entity.animation.accumulatedTime += delta;
        if (entity.animation.accumulatedTime >= FRAME_DURATION) {
          entity.animation.currentFrame = (entity.animation.currentFrame + 1) % TOTAL_COLUMNS;
          entity.animation.accumulatedTime = entity.animation.accumulatedTime % FRAME_DURATION;
        }
      } else {
        entity.animation.currentFrame = 1;
        entity.animation.accumulatedTime = 0;
      }
    }
  });

  return entities;
};
