import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { NPCProps } from "../types";

const SPRITE_WIDTH = 32;
const SPRITE_HEIGHT = 41;
const SPRITE_SCALE = 1.0;
const lillySprite = require("../assets/lilly-spritesheet.png");

export const NPC: React.FC<NPCProps> = ({ position, onInteract }) => {
  const { x, y } = position;

  const spriteWidth = SPRITE_WIDTH * SPRITE_SCALE;
  const spriteHeight = SPRITE_HEIGHT * SPRITE_SCALE;

  const handlePress = () => {
    if (onInteract) {
      const event = onInteract();
      // Get the game engine instance and dispatch the event
      const gameEngine = (window as any).gameEngine;
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
              width: SPRITE_WIDTH * 3,
              height: SPRITE_HEIGHT * 4,
            },
          ]}
          contentFit="cover"
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 2000,
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
