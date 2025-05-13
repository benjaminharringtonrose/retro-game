import { useEffect } from "react";
import { SharedValue, withTiming, withRepeat, withSequence, cancelAnimation } from "react-native-reanimated";
import { Direction } from "../types";

const ANIMATION_FRAME_DURATION = 150;

export function usePlayerAnimation(isMoving: boolean, direction: Direction, currentFrame: SharedValue<number>, directionValue: SharedValue<Direction>, isMovingValue: SharedValue<boolean>) {
  useEffect(() => {
    directionValue.value = direction;
    isMovingValue.value = isMoving;

    if (isMoving) {
      cancelAnimation(currentFrame);
      currentFrame.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 0 }),
          withTiming(1, { duration: ANIMATION_FRAME_DURATION }),
          withTiming(2, { duration: 0 }),
          withTiming(2, { duration: ANIMATION_FRAME_DURATION }),
          withTiming(0, { duration: 0 }),
          withTiming(0, { duration: ANIMATION_FRAME_DURATION })
        ),
        -1
      );
    } else {
      cancelAnimation(currentFrame);
      currentFrame.value = 0;
    }
  }, [isMoving, direction, currentFrame, directionValue, isMovingValue]);
}
