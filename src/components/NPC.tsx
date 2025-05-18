import React, { useEffect } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { NPCProps, Direction } from "../types";

const SPRITE_WIDTH = 32;
const SPRITE_HEIGHT = 41;
const SPRITE_SCALE = 1.0;

// Import sprite using require with explicit path
const lillySprite = require("../assets/lilly-spritesheet.png");

// Debug logging
const debugNPC = (message: string, data?: any) => {
  console.log(`[NPC Debug] ${message}`, data || "");
};

// Sprite row mapping for each direction
const SPRITE_ROWS = {
  [Direction.Down]: 0,
  [Direction.Left]: 1,
  [Direction.Up]: 2,
  [Direction.Right]: 3,
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

  // Add debug logging
  useEffect(() => {
    debugNPC("NPC Mounted", { x, y, direction, isMoving });
    debugNPC("Sprite Config", {
      width: SPRITE_WIDTH,
      height: SPRITE_HEIGHT,
      scale: SPRITE_SCALE,
      source: lillySprite,
    });
  }, []);

  // Get the appropriate sprite row based on direction
  const row = SPRITE_ROWS[direction] ?? SPRITE_ROWS[Direction.Down];

  // Calculate frame position
  const frameX = isMoving ? currentFrame : 1;

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
          left: x - (SPRITE_WIDTH * SPRITE_SCALE) / 2,
          top: y - (SPRITE_HEIGHT * SPRITE_SCALE) / 2,
          width: SPRITE_WIDTH * SPRITE_SCALE,
          height: SPRITE_HEIGHT * SPRITE_SCALE,
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
              left: -(frameX * SPRITE_WIDTH),
              top: -(row * SPRITE_HEIGHT),
              width: SPRITE_WIDTH * 3, // 3 frames
              height: SPRITE_HEIGHT * 4, // 4 directions
            },
          ]}
          contentFit="contain"
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
