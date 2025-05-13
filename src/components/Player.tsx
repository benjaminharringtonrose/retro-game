// components/Player.tsx
import React, { useRef, useEffect } from "react";
import { Image as ExpoImage, ImageRef } from "expo-image";
import Animated, { SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { Direction } from "../types";

const SPRITE_W = 32;
const SPRITE_H = 40;
const SPRITE_SCALE = 1.2;

const ROWS = {
  [Direction.Down]: 0,
  [Direction.Right]: 1,
  [Direction.Up]: 2,
  [Direction.Left]: 3,
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
  onLoadComplete?: () => void;
}

export const Player = ({ direction, isMoving, centerX, centerY, currentFrame, offsetX, offsetY, onLoadComplete }: PlayerProps) => {
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

  const handleLoadError = (error: any) => {
    console.error("Failed to load player spritesheet:", error);
  };

  return (
    <Animated.View style={containerStyle}>
      <AnimatedImage source={require("../assets/character-spritesheet.png")} style={spriteStyle} contentFit="cover" cachePolicy="memory" onLoadEnd={onLoadComplete} onError={handleLoadError} />
    </Animated.View>
  );
};
