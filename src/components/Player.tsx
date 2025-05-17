// components/Player.tsx
import React from "react";
import { View, Image } from "react-native";
import { Direction, PlayerProps } from "../types";

const SPRITE_W = 32;
const SPRITE_H = 40;
const SPRITE_SCALE = 1.2;
const characterSprite = require("../assets/character-spritesheet.png");

const SPRITE_ROWS = {
  [Direction.Down]: 0,
  [Direction.Left]: 1,
  [Direction.Up]: 2,
  [Direction.Right]: 3,
};

export const Player: React.FC<PlayerProps> = ({ x, y, direction, currentFrame }) => {
  const row = SPRITE_ROWS[direction];

  return (
    <View
      style={[
        {
          position: "absolute",
          left: x - (SPRITE_W * SPRITE_SCALE) / 2,
          top: y - (SPRITE_H * SPRITE_SCALE) / 2,
          width: SPRITE_W * SPRITE_SCALE,
          height: SPRITE_H * SPRITE_SCALE,
          overflow: "hidden",
          zIndex: 2000,
        },
      ]}
    >
      <Image
        source={characterSprite}
        style={{
          position: "absolute",
          width: SPRITE_W * 3 * SPRITE_SCALE,
          height: SPRITE_H * 4 * SPRITE_SCALE,
          transform: [
            {
              translateX: -currentFrame * SPRITE_W * SPRITE_SCALE,
            },
            {
              translateY: -row * SPRITE_H * SPRITE_SCALE,
            },
          ],
        }}
      />
    </View>
  );
};
