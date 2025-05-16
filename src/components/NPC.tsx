import React from "react";
import { Image as ExpoImage } from "expo-image";
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

// Create animated version of ExpoImage
const AnimatedImage = Animated.createAnimatedComponent(ExpoImage);

export interface NPCProps {
  direction: Direction;
  isMoving: boolean;
  centerX: SharedValue<number>;
  centerY: SharedValue<number>;
  currentFrame: SharedValue<number>;
  spritesheet: any;
  onLoadComplete?: () => void;
}

export const NPC = ({ direction, isMoving, centerX, centerY, currentFrame, spritesheet, onLoadComplete }: NPCProps) => {
  const containerStyle = useAnimatedStyle(() => {
    return {
      position: "absolute",
      left: centerX.value - (SPRITE_W * SPRITE_SCALE) / 2,
      top: centerY.value - (SPRITE_H * SPRITE_SCALE) / 2,
      width: SPRITE_W * SPRITE_SCALE,
      height: SPRITE_H * SPRITE_SCALE,
      overflow: "hidden",
      zIndex: 1900, // Above container (2000) but below player (2000)
    };
  });

  const spriteStyle = useAnimatedStyle(() => {
    return {
      position: "absolute",
      width: SPRITE_W * 3 * SPRITE_SCALE, // Full spritesheet width (3 frames)
      height: SPRITE_H * 4 * SPRITE_SCALE, // Full spritesheet height (4 directions)
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
    console.error("Failed to load NPC spritesheet:", error);
  };

  return (
    <Animated.View style={containerStyle}>
      <AnimatedImage source={spritesheet} style={spriteStyle} contentFit="cover" cachePolicy="memory" onLoadEnd={onLoadComplete} onError={handleLoadError} />
    </Animated.View>
  );
};
