import { Entity, SystemProps } from "../../types";

const TOTAL_COLUMNS = 3; // Spritesheet has 3 columns per row
const FRAME_DURATION = 150; // How long each frame shows for in milliseconds

let tickCount = 0;
const TICKS_PER_FRAME = 10; // Increase this number to slow down animation

export const AnimationSystem = (entities: { [key: string]: Entity }, { time }: SystemProps) => {
  Object.keys(entities).forEach((id) => {
    const entity = entities[id];

    if (!entity.animation || !entity.movement) {
      return;
    }

    if (entity.movement.isMoving) {
      // Only update frame every TICKS_PER_FRAME ticks
      tickCount = (tickCount + 1) % TICKS_PER_FRAME;
      if (tickCount === 0) {
        entity.animation.currentFrame = (entity.animation.currentFrame + 1) % TOTAL_COLUMNS;
      }
    } else {
      // Reset to middle frame (1) when not moving
      entity.animation.currentFrame = 1;
    }
  });

  return entities;
};
