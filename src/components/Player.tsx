import React, { useState, useEffect, useRef } from "react";
import { View, Image } from "react-native";
import { Direction } from "../types";

const SPRITE_W = 32;
const SPRITE_H = 40;
const ROWS = { down: 0, left: 1, up: 2, right: 3 };
const FRAMES = 3;
const ANIM_INTERVAL = 100; // ms

export interface PlayerProps {
  direction: Direction;
  isMoving: boolean;
  centerX: number;
  centerY: number;
}

export const Player: React.FC<PlayerProps> = ({
  direction,
  isMoving,
  centerX,
  centerY,
}) => {
  const [frame, setFrame] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>(undefined);

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

  return (
    <View
      style={{
        position: "absolute",
        left: centerX - SPRITE_W / 2,
        top: centerY - SPRITE_H / 2,
        width: SPRITE_W,
        height: SPRITE_H,
        overflow: "hidden",
        zIndex: 10,
      }}
    >
      <Image
        source={require("../assets/character-spritesheet.png")}
        style={{
          position: "absolute",
          width: SPRITE_W * FRAMES,
          height: SPRITE_H * 4,
          left: -frame * SPRITE_W,
          top: -ROWS[direction] * SPRITE_H,
        }}
      />
    </View>
  );
};
