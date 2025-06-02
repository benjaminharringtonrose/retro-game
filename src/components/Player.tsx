// components/Player.tsx
import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { Direction, PlayerProps } from "../types";

const SPRITE_W = 64;
const SPRITE_H = 64;
const SPRITE_SCALE = 0.9; // Reverted back to normal scale
const characterSprite = require("../assets/player-walk.png");

const SPRITE_ROWS = {
  [Direction.Up]: 0,
  [Direction.Left]: 1,
  [Direction.Down]: 2,
  [Direction.Right]: 3,
  [Direction.UpLeft]: 1, // Use left-facing sprite
  [Direction.UpRight]: 3, // Use right-facing sprite
  [Direction.DownLeft]: 1, // Use left-facing sprite
  [Direction.DownRight]: 3, // Use right-facing sprite
};

export const Player: React.FC<PlayerProps> = ({ position, movement, animation, zIndex }) => {
  const { x, y } = position;
  const { direction } = movement;
  const { currentFrame } = animation;
  const row = SPRITE_ROWS[direction];

  const spriteWidth = SPRITE_W * SPRITE_SCALE;
  const spriteHeight = SPRITE_H * SPRITE_SCALE;

  return (
    <View
      style={[
        styles.container,
        {
          left: x - spriteWidth / 2,
          top: y - spriteHeight / 2,
          width: spriteWidth,
          height: spriteHeight,
          backgroundColor: "transparent",
          zIndex,
        },
      ]}
    >
      <View style={styles.spriteWrapper}>
        <Image
          source={characterSprite}
          style={[
            styles.sprite,
            {
              width: spriteWidth * 9,
              height: spriteHeight * 4,
              transform: [{ translateX: -currentFrame * spriteWidth }, { translateY: -row * spriteHeight }],
            },
          ]}
          resizeMode="cover"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    overflow: "visible",
  },
  spriteWrapper: {
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },
  sprite: {
    position: "absolute",
    left: 0,
    top: 0,
  },
});
