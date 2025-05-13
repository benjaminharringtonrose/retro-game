import { FC } from "react";
import { View, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Direction } from "../types";

export interface PadProps {
  setDirection: (direction: Direction) => void;
  setIsMoving: (value: boolean) => void;
}

export const Pad: FC<PadProps> = ({ setDirection, setIsMoving }) => {
  const padOffsetX = useSharedValue(0);
  const padOffsetY = useSharedValue(0);

  const padRadius = 100; // half of pad width/height
  const knobRadius = 25; // half of padCenter width/height
  const maxKnobDistance = padRadius - knobRadius;
  const deadZone = 10; // minimum distance to trigger movement

  const padCenterAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: padOffsetX.value }, { translateY: padOffsetY.value }],
  }));

  const pan = Gesture.Pan()
    .onBegin((e) => {
      runOnJS(setIsMoving)(true);
    })
    .onUpdate((e) => {
      // Use translationX/Y instead of absolute positions
      const x = e.translationX;
      const y = e.translationY;

      // Calculate distance from center
      const dist = Math.hypot(x, y);

      // If within dead zone, don't move
      if (dist < deadZone) {
        padOffsetX.value = 0;
        padOffsetY.value = 0;
        runOnJS(setIsMoving)(false);
        return;
      }

      // Normalize and scale the movement
      let tx = x;
      let ty = y;

      if (dist > maxKnobDistance) {
        const angle = Math.atan2(y, x);
        tx = Math.cos(angle) * maxKnobDistance;
        ty = Math.sin(angle) * maxKnobDistance;
      }

      padOffsetX.value = tx;
      padOffsetY.value = ty;

      // Determine direction based on angle
      const angle = (Math.atan2(ty, tx) * 180) / Math.PI;
      let newDirection;

      if (angle > -45 && angle <= 45) {
        newDirection = Direction.Left;
      } else if (angle > 45 && angle <= 135) {
        newDirection = Direction.Up;
      } else if (angle > 135 || angle <= -135) {
        newDirection = Direction.Right;
      } else {
        newDirection = Direction.Down;
      }

      // Always ensure we're moving when outside deadzone
      runOnJS(setIsMoving)(true);
      runOnJS(setDirection)(newDirection);
    })
    .onEnd(() => {
      padOffsetX.value = withTiming(0);
      padOffsetY.value = withTiming(0);
      runOnJS(setIsMoving)(false);
    })
    .onFinalize(() => {
      padOffsetX.value = withTiming(0);
      padOffsetY.value = withTiming(0);
      runOnJS(setIsMoving)(false);
    });

  return (
    <GestureDetector gesture={pan}>
      <View style={styles.pad}>
        <Animated.View style={[styles.padCenter, padCenterAnimatedStyle]} />
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  pad: {
    position: "absolute",
    bottom: 40,
    left: 40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  padCenter: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
});
