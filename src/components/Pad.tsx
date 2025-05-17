import React, { useRef, useState } from "react";
import { View, StyleSheet, PanResponder, Animated, Dimensions } from "react-native";
import { Direction } from "../types";

interface PadProps {
  onDirectionChange: (direction: Direction | null) => void;
}

const STICK_RADIUS = 25;
const BASE_RADIUS = 50;
const DEAD_ZONE = 10; // Minimum distance to trigger movement

export const Pad: React.FC<PadProps> = ({ onDirectionChange }) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const [currentDirection, setCurrentDirection] = useState<Direction | null>(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        const position = { x: 0, y: 0 };
        pan.extractOffset();
        pan.setValue(position);
      },
      onPanResponderMove: (_, gesture) => {
        // Calculate distance from center
        const distance = Math.sqrt(gesture.dx * gesture.dx + gesture.dy * gesture.dy);

        // Normalize to base radius
        const scale = Math.min(distance, BASE_RADIUS) / distance;
        const x = gesture.dx * scale;
        const y = gesture.dy * scale;

        pan.setValue({ x, y });

        // Determine direction based on angle
        if (distance > DEAD_ZONE) {
          const angle = Math.atan2(y, x);
          const degrees = angle * (180 / Math.PI);

          let newDirection: Direction;
          if (degrees > -45 && degrees <= 45) {
            newDirection = Direction.Right;
          } else if (degrees > 45 && degrees <= 135) {
            newDirection = Direction.Down;
          } else if (degrees > 135 || degrees <= -135) {
            newDirection = Direction.Left;
          } else {
            newDirection = Direction.Up;
          }

          if (newDirection !== currentDirection) {
            setCurrentDirection(newDirection);
            onDirectionChange(newDirection);
          }
        }
      },
      onPanResponderRelease: () => {
        pan.flattenOffset();
        // Reset position with animation
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
        // Clear direction
        setCurrentDirection(null);
        onDirectionChange(null);
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      {/* Base circle */}
      <View style={styles.base}>
        {/* Stick */}
        <Animated.View
          style={[
            styles.stick,
            {
              transform: [{ translateX: pan.x }, { translateY: pan.y }],
            },
          ]}
          {...panResponder.panHandlers}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 40,
    left: 40,
    width: BASE_RADIUS * 2,
    height: BASE_RADIUS * 2,
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
