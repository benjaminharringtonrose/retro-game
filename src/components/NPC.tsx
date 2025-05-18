import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { NPCProps, Direction } from "../types";

const SPRITE_WIDTH = 32;
const SPRITE_HEIGHT = 41;
const SPRITE_SCALE = 1.0;
const lillySprite = require("../assets/lilly-spritesheet.png");

// Sprite row mapping for each direction
const SPRITE_ROWS = {
  [Direction.Down]: 0,
  [Direction.Left]: 1,
  [Direction.Right]: 2,
  [Direction.Up]: 3,
  // Map diagonal directions to their closest cardinal direction
  [Direction.UpLeft]: 1, // Use left-facing sprite
  [Direction.UpRight]: 2, // Use right-facing sprite
  [Direction.DownLeft]: 1, // Use left-facing sprite
  [Direction.DownRight]: 2, // Use right-facing sprite
};

export const NPC: React.FC<NPCProps> = ({ position, movement, animation, onInteract }) => {
  const { x, y } = position;
  const { direction, isMoving } = movement;
  const { currentFrame } = animation;

  const spriteWidth = SPRITE_WIDTH * SPRITE_SCALE;
  const spriteHeight = SPRITE_HEIGHT * SPRITE_SCALE;

  // Get the appropriate sprite row based on direction
  const row = SPRITE_ROWS[direction] ?? SPRITE_ROWS[Direction.Down]; // Default to down if direction not found

  // Calculate frame position
  // When moving: use the current animation frame (0, 1, or 2)
  // When idle: use frame 1 (middle frame) for a neutral stance
  const frameX = isMoving ? currentFrame : 1;

  const spritePosition = {
    left: -(frameX * SPRITE_WIDTH),
    top: -(row * SPRITE_HEIGHT),
  };

  const handlePress = () => {
    if (onInteract) {
      const event = onInteract();
      // Get the game engine instance and dispatch the event
      const gameEngine = window.gameEngine;
      if (gameEngine?.dispatch) {
        gameEngine.dispatch(event);
      }
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          position: "absolute",
          left: x - spriteWidth / 2,
          top: y - spriteHeight / 2,
          width: spriteWidth,
          height: spriteHeight,
          zIndex: 2000,
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.spriteWrapper}>
        <Image
          source={lillySprite}
          style={[
            styles.sprite,
            {
              width: spriteWidth * 3, // 3 frames per row
              height: spriteHeight * 4, // 4 directions
              transform: [{ translateX: spritePosition.left }, { translateY: spritePosition.top }],
            },
          ]}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  spriteWrapper: {
    overflow: "hidden",
    width: SPRITE_WIDTH,
    height: SPRITE_HEIGHT,
  },
  sprite: {
    position: "absolute",
  },
});
