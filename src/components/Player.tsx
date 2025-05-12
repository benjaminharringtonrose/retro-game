// components/Player.tsx
import React, { useState, useEffect, useRef } from "react";
import { Image as ExpoImage, ImageRef } from "expo-image";
import Animated, {
  useAnimatedStyle,
  SharedValue,
} from "react-native-reanimated";
import { Direction } from "../types";

const SPRITE_W = 32;
const SPRITE_H = 40;
const ROWS = { down: 0, left: 1, up: 2, right: 3 };
const FRAMES = 3;
const ANIM_INTERVAL = 100; // ms

export interface PlayerProps {
  direction: Direction;
  isMoving: boolean;
  centerX: SharedValue<number>;
  centerY: SharedValue<number>;
}

// wrap ExpoImage so we can animate its container if needed
const AnimatedImage = Animated.createAnimatedComponent(ExpoImage);

export const Player: React.FC<PlayerProps> = ({
  direction,
  isMoving,
  centerX,
  centerY,
}) => {
  const [frame, setFrame] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>(undefined);
  const imgRef = useRef<ImageRef>(null);

  useEffect(() => {
    if (isMoving) {
      intervalRef.current = setInterval(() => {
        setFrame((f) => (f + 1) % FRAMES);
      }, ANIM_INTERVAL);
    } else {
      clearInterval(intervalRef.current);
      setFrame(0);
    }
    return () => clearInterval(intervalRef.current);
  }, [isMoving]);

  // if you ever need to force-reload in dev:
  // useEffect(() => { imgRef.current?.reloadAsync(); }, [direction, frame]);

  const playerStyle = useAnimatedStyle(() => ({
    position: "absolute",
    left: centerX.value - SPRITE_W / 2,
    top: centerY.value - SPRITE_H / 2,
    width: SPRITE_W,
    height: SPRITE_H,
    overflow: "hidden",
    zIndex: 10,
  }));

  return (
    <Animated.View style={playerStyle}>
      <AnimatedImage
        ref={imgRef as any}
        source={require("../assets/character-spritesheet.png")}
        cachePolicy="memory-disk"
        style={{
          position: "absolute",
          width: SPRITE_W * FRAMES,
          height: SPRITE_H * 4,
          left: -frame * SPRITE_W,
          top: -ROWS[direction] * SPRITE_H,
        }}
      />
    </Animated.View>
  );
};
