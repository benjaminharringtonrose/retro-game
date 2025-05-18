import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { NPCProps, Direction } from "../types";

const SPRITE_WIDTH = 32;
const SPRITE_HEIGHT = 41;
const SPRITE_SCALE = 1.0;
const lillySprite = require("../assets/lilly-spritesheet.png");

export const NPC: React.FC<NPCProps> = ({ position, movement, animation, onInteract }) => {
  const { x, y } = position;
  const { direction, isMoving } = movement;
  const { currentFrame } = animation;

  const spriteWidth = SPRITE_WIDTH * SPRITE_SCALE;
  const spriteHeight = SPRITE_HEIGHT * SPRITE_SCALE;

  // Calculate sprite position based on direction and animation frame
  const getSpritePosition = () => {
    let row = 0; // Default to facing down
    switch (direction) {
      case Direction.Up:
      case Direction.UpLeft:
      case Direction.UpRight:
        row = 3;
        break;
      case Direction.Right:
        row = 2;
        break;
      case Direction.Down:
      case Direction.DownLeft:
      case Direction.DownRight:
        row = 0;
        break;
      case Direction.Left:
        row = 1;
        break;
    }

    // Calculate frame position (0, 1, or 2)
    const frameX = isMoving ? currentFrame % 3 : 1;

    return {
      left: -(frameX * SPRITE_WIDTH),
      top: -(row * SPRITE_HEIGHT),
    };
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

  const spritePosition = getSpritePosition();

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
              position: "absolute",
              width: SPRITE_WIDTH * 3, // 3 frames per row
              height: SPRITE_HEIGHT * 4, // 4 rows (directions)
              left: spritePosition.left,
              top: spritePosition.top,
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
  },
  spriteWrapper: {
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },
  sprite: {
    position: "absolute",
  },
});
