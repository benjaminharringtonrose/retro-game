import React, { FC, useEffect, useRef } from "react";
import { useWindowDimensions, View } from "react-native";
import { Sprites, SpritesMethods } from "react-native-sprites";
import { SPRITE_HEIGHT, SPRITE_WIDTH } from "../constants/sprites";
import { Direction } from "../types";

export interface PlayerProps {
  direction: Direction;
  isMoving: boolean;
}

export const Player: FC<PlayerProps> = ({ direction, isMoving }) => {
  const { width, height } = useWindowDimensions();
  const spriteRef = useRef<SpritesMethods>(null);

  useEffect(() => {
    if (isMoving) {
      spriteRef.current?.play({
        type: direction,
        fps: 12,
        loop: true,
        resetAfterFinish: false,
      });
    } else {
      spriteRef.current?.stop();
    }
  }, [direction, isMoving]);

  return (
    <View
      style={{
        position: "absolute",
        left: width / 2 - 20,
        top: height / 2 - 80,
        zIndex: 10,
      }}
    >
      <Sprites
        ref={spriteRef}
        source={require("../assets/character-spritesheet.png")}
        columns={3}
        rows={4}
        animations={{
          down: { row: 0, startFrame: 0, endFrame: 2 },
          left: { row: 1, startFrame: 0, endFrame: 2 },
          up: { row: 2, startFrame: 0, endFrame: 2 },
          right: { row: 3, startFrame: 0, endFrame: 2 },
        }}
        width={SPRITE_WIDTH}
        height={SPRITE_HEIGHT}
        onLoad={() => console.log("Sprite sheet loaded")}
      />
    </View>
  );
};
