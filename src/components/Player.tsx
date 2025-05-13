// components/Player.tsx
import React, { useRef } from "react";
import { Image as ExpoImage, ImageRef } from "expo-image";
import Animated, { SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { Direction } from "../types";

const SPRITE_W = 32;
const SPRITE_H = 40;
const SPRITE_SCALE = 1.2;

const ROWS = {
  up: 0,
  right: 1,
  down: 2,
  left: 3,
};

// Memoize the sprite image
const SPRITE_IMAGE = {
  uri: require("../assets/character-spritesheet.png"),
  cacheKey: "character-sprite",
};

// Create animated version of ExpoImage
const AnimatedImage = Animated.createAnimatedComponent(ExpoImage);

export interface PlayerProps {
  direction: Direction;
  isMoving: boolean;
  centerX: SharedValue<number>;
  centerY: SharedValue<number>;
  currentFrame: SharedValue<number>;
  offsetX: SharedValue<number>;
  offsetY: SharedValue<number>;
}

export const Player = ({ direction, isMoving, centerX, centerY, currentFrame, offsetX, offsetY }: PlayerProps) => {
  const containerStyle = useAnimatedStyle(() => {
    "worklet";
    return {
      position: "absolute",
      left: centerX.value - (SPRITE_W * SPRITE_SCALE) / 2 + offsetX.value,
      top: centerY.value - (SPRITE_H * SPRITE_SCALE) / 2 + offsetY.value,
      width: SPRITE_W * SPRITE_SCALE,
      height: SPRITE_H * SPRITE_SCALE,
      overflow: "hidden",
      zIndex: 2000,
    };
  });

  const spriteStyle = useAnimatedStyle(() => {
    "worklet";
    return {
      position: "absolute",
      width: SPRITE_W * 3 * SPRITE_SCALE,
      height: SPRITE_H * 4 * SPRITE_SCALE,
      transform: [
        {
          translateX: -currentFrame.value * SPRITE_W * SPRITE_SCALE,
        },
        {
          translateY: -ROWS[direction] * SPRITE_H * SPRITE_SCALE,
        },
      ],
    };
  });

  return (
    <Animated.View style={containerStyle}>
      <AnimatedImage source={require("../assets/character-spritesheet.png")} cachePolicy="memory-disk" contentFit="cover" style={spriteStyle} />
    </Animated.View>
  );
};
