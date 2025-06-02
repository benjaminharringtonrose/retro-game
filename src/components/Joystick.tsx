import React, { memo, useCallback, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { Direction } from "../types";

interface JoystickProps {
  onDirectionChange: (direction: Direction | null, angle?: number) => void;
}

const STICK_RADIUS = 25;
const BASE_RADIUS = 50;
const DEAD_ZONE = 10;

const springConfig = {
  damping: 15,
  stiffness: 400,
};

export const Joystick: React.FC<JoystickProps> = memo(({ onDirectionChange }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const currentDirection = useSharedValue<Direction | null>(null);

  const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 });
  const [joystickVisible, setJoystickVisible] = useState(false);

  const updateDirection = useCallback(
    (x: number, y: number) => {
      const distance = Math.sqrt(x * x + y * y);

      if (distance > DEAD_ZONE) {
        const angle = Math.atan2(y, x);
        const degrees = angle * (180 / Math.PI);

        let newDirection: Direction;
        if (degrees > -22.5 && degrees <= 22.5) {
          newDirection = Direction.Right;
        } else if (degrees > 22.5 && degrees <= 67.5) {
          newDirection = Direction.DownRight;
        } else if (degrees > 67.5 && degrees <= 112.5) {
          newDirection = Direction.Down;
        } else if (degrees > 112.5 && degrees <= 157.5) {
          newDirection = Direction.DownLeft;
        } else if (degrees > 157.5 || degrees <= -157.5) {
          newDirection = Direction.Left;
        } else if (degrees > -157.5 && degrees <= -112.5) {
          newDirection = Direction.UpLeft;
        } else if (degrees > -112.5 && degrees <= -67.5) {
          newDirection = Direction.Up;
        } else {
          newDirection = Direction.UpRight;
        }

        if (newDirection !== currentDirection.value) {
          currentDirection.value = newDirection;
          onDirectionChange(newDirection, degrees);
        }
      } else if (currentDirection.value !== null) {
        currentDirection.value = null;
        onDirectionChange(null);
      }
    },
    [onDirectionChange]
  );

  const pan = Gesture.Pan()
    .onStart((e) => {
      translateX.value = 0;
      translateY.value = 0;
      runOnJS(setJoystickPosition)({ x: e.absoluteX, y: e.absoluteY });
      runOnJS(setJoystickVisible)(true);
    })
    .onUpdate((e) => {
      const distance = Math.sqrt(e.translationX * e.translationX + e.translationY * e.translationY);
      const scale = Math.min(distance, BASE_RADIUS) / distance;
      const x = e.translationX * scale;
      const y = e.translationY * scale;

      translateX.value = x;
      translateY.value = y;
      runOnJS(updateDirection)(x, y);
    })
    .onFinalize(() => {
      translateX.value = withSpring(0, springConfig);
      translateY.value = withSpring(0, springConfig);
      currentDirection.value = null;
      runOnJS(onDirectionChange)(null);
      runOnJS(setJoystickVisible)(false);
    });

  const stickStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
    };
  });

  return (
    <GestureDetector gesture={pan}>
      <View style={[StyleSheet.absoluteFill, { zIndex: 999 }]}>
        {joystickVisible && (
          <View
            style={[
              styles.container,
              {
                left: joystickPosition.x - BASE_RADIUS,
                top: joystickPosition.y - BASE_RADIUS,
              },
            ]}
          >
            <View style={styles.base}>
              <Animated.View style={[styles.stick, stickStyle]} />
            </View>
          </View>
        )}
      </View>
    </GestureDetector>
  );
});

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: BASE_RADIUS * 2,
    height: BASE_RADIUS * 2,
    zIndex: 1000,
  },
  base: {
    width: BASE_RADIUS * 2,
    height: BASE_RADIUS * 2,
    borderRadius: BASE_RADIUS,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  stick: {
    width: STICK_RADIUS * 2,
    height: STICK_RADIUS * 2,
    borderRadius: STICK_RADIUS,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderWidth: 2,
    borderColor: "white",
  },
});
