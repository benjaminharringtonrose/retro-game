// components/Player.tsx
import React, { useRef } from "react";
import { Image as ExpoImage, ImageRef } from "expo-image";
import Animated, { SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { Direction } from "../types";

const SPRITE_W = 32;
const SPRITE_H = 40;
const ROWS = {
  up: 0, // Changed from down: 0
  right: 1, // Changed from left: 1
  down: 2, // Changed from up: 2
  left: 3, // Changed from right: 3
};

export interface PlayerProps {
  direction: Direction;
  isMoving: boolean;
  centerX: SharedValue<number>;
  centerY: SharedValue<number>;
  currentFrame: SharedValue<number>;
}

// wrap ExpoImage so we can animate its container if needed
const AnimatedImage = Animated.createAnimatedComponent(ExpoImage);

export const Player: React.FC<PlayerProps> = ({ direction, isMoving, centerX, centerY, currentFrame }) => {
  const imgRef = useRef<ImageRef>(null);

  const containerStyle = useAnimatedStyle(() => ({
    position: "absolute",
    left: centerX.value - SPRITE_W / 2,
    top: centerY.value - SPRITE_H / 2,
    width: SPRITE_W,
    height: SPRITE_H,
    overflow: "hidden",
    zIndex: 10,
  }));

  const spriteStyle = useAnimatedStyle(() => ({
    position: "absolute",
    width: SPRITE_W * 3, // 3 frames
    height: SPRITE_H * 4, // 4 directions
    transform: [{ translateX: -currentFrame.value * SPRITE_W }, { translateY: -ROWS[direction] * SPRITE_H }],
  }));

  return (
    <Animated.View style={containerStyle}>
      <AnimatedImage ref={imgRef as any} source={require("../assets/character-spritesheet.png")} cachePolicy="memory-disk" contentFit="cover" style={spriteStyle} />
    </Animated.View>
  );
};
