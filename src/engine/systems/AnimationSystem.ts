import { Entity, SystemProps } from "../../types";

export const AnimationSystem = (entities: { [key: string]: Entity }, { time, delta = 16.666 }: SystemProps) => {
  // This accumulates time for frame updates
  const timeElapsed = delta;

  // Process all entities with animation components
  Object.keys(entities).forEach((entityKey) => {
    const entity = entities[entityKey];

    // Skip entities without animation components
    if (!entity.animation) return;

    const { frameRate, frameCount } = entity.animation;
    const isMoving = entity.movement?.isMoving || false;

    // For NPCs and moving objects, update animation frames
    if (entityKey.startsWith("npc") || isMoving) {
      // Calculate time per frame based on frame rate (higher frameRate = faster animation)
      const timePerFrame = 1000 / frameRate;

      // Debug animation every 5 seconds for NPCs
      if (entityKey.startsWith("npc") && time % 5000 < 20) {
        console.log(`[AnimationSystem] NPC animation for ${entityKey}: frameCount=${frameCount}, frameRate=${frameRate}, isMoving=${isMoving}`);
      }

      // Increment frame if enough time has passed
      entity.animation.frameAccumulator = (entity.animation.frameAccumulator || 0) + timeElapsed;

      if (entity.animation.frameAccumulator >= timePerFrame) {
        // Move to next frame and reset accumulator
        entity.animation.currentFrame = (entity.animation.currentFrame + 1) % frameCount;
        entity.animation.frameAccumulator = 0;

        // Extra debug log for frame changes on NPCs
        if (entityKey.startsWith("npc") && time % 1000 < 20) {
          console.log(`[AnimationSystem] NPC ${entityKey} frame change: ${entity.animation.currentFrame}`);
        }
      }
    } else if (!isMoving) {
      // Reset animation for non-moving entities to idle frame
      entity.animation.currentFrame = 0; // First frame is standing still
    }
  });

  return entities;
};
