import { useEffect } from "react";
import { SharedValue, cancelAnimation } from "react-native-reanimated";
import { Direction } from "../types";

const FRAME_DURATION = 100; // Time each frame is shown
const TOTAL_FRAMES = 3;

export function usePlayerAnimation(isMoving: boolean, direction: Direction, currentFrame: SharedValue<number>, directionValue: SharedValue<Direction>, isMovingValue: SharedValue<boolean>) {
  useEffect(() => {
    directionValue.value = direction;
    isMovingValue.value = isMoving;

    // Cancel any existing animation
    cancelAnimation(currentFrame);

    let animationTimeout: NodeJS.Timeout | null = null;

    if (isMoving) {
      let frame = 0;
      const animate = () => {
        if (!isMovingValue.value) return;
        currentFrame.value = frame;
        frame = (frame + 1) % TOTAL_FRAMES;
        // Store the timeout ID so we can clear it later
        animationTimeout = setTimeout(animate, FRAME_DURATION);
      };
      animate();
    } else {
      currentFrame.value = 0;
    }

    // Cleanup function to cancel both the animation and any pending timeout
    return () => {
      cancelAnimation(currentFrame);
      if (animationTimeout) {
        clearTimeout(animationTimeout);
      }
    };
  }, [isMoving, direction, currentFrame, directionValue, isMovingValue]);
}
