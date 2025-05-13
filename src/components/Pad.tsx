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
  const maxKnobDistance = padRadius - knobRadius; // 100 - 25 = 75

  const padCenterAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: padOffsetX.value }, { translateY: padOffsetY.value }],
  }));

  const pan = Gesture.Pan()
    .onBegin(() => {
      runOnJS(setIsMoving)(true);
    })
    .onUpdate((e) => {
      // raw translation
      let tx = e.translationX;
      let ty = e.translationY;
      // clamp vector length so knob stays inside outer circle
      const dist = Math.hypot(tx, ty);
      if (dist > maxKnobDistance) {
        const angle = Math.atan2(ty, tx);
        tx = Math.cos(angle) * maxKnobDistance;
        ty = Math.sin(angle) * maxKnobDistance;
      }
      padOffsetX.value = tx;
      padOffsetY.value = ty;

      // update direction as before
      const newDirection = Math.abs(tx) > Math.abs(ty) ? (tx > 0 ? Direction.Right : Direction.Left) : ty > 0 ? Direction.Down : Direction.Up;
      runOnJS(setDirection)(newDirection);
    })
    .onEnd(() => {
      // snap knob back to center
      padOffsetX.value = withTiming(0);
      padOffsetY.value = withTiming(0);
      runOnJS(setIsMoving)(false);
    })
    .onFinalize(() => {
      // ensure movement stops
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
    bottom: 10,
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
