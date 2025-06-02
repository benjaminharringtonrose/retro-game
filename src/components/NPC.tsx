import React from "react";
import { StyleSheet, View, Pressable, Image } from "react-native";
import { Direction } from "../types/enums";
import { NPCProps } from "../types/props";
import { NPC_CONFIGS } from "../config/npcs";
import { logger } from "../utils/logger";

// Debug logging
const debugNPC = (message: string, data?: any) => {
  logger.log("NPC", `[NPC Debug] ${message}`, data || "");
};

export const NPC: React.FC<NPCProps> = ({ position, movement, animation, onInteract, id }) => {
  const { x, y } = position;
  const { direction, isMoving } = movement;
  const { currentFrame, frameCount } = animation;

  // Get NPC config
  const config = NPC_CONFIGS[id];
  if (!config) {
    logger.error("NPC", `No configuration found for NPC: ${id}`);
    return null;
  }

  const { sprite } = config;

  // Get the appropriate sprite row based on direction
  const spriteRow = sprite.rows[direction] ?? sprite.rows[Direction.Down];
  const row = spriteRow ?? 0;

  // Calculate frame position
  const frameX = isMoving ? currentFrame : 0;

  const spriteWidth = sprite.width * sprite.scale;
  const spriteHeight = sprite.height * sprite.scale;

  const handlePress = () => {
    debugNPC(`NPC ${id} clicked`);
    if (onInteract) {
      const event = onInteract();
      const gameEngine = window.gameEngine;
      if (gameEngine?.dispatch) {
        gameEngine.dispatch(event);
      }
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.container,
        {
          left: x - spriteWidth / 2,
          top: y - spriteHeight / 2,
          width: spriteWidth,
          height: spriteHeight,
          backgroundColor: "transparent",
        },
      ]}
      testID={`npc-${id}`}
      hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <View style={[styles.spriteContainer]}>
        <Image
          source={sprite.source}
          style={[
            styles.sprite,
            {
              width: spriteWidth * frameCount,
              height: spriteHeight * 4,
              transform: [{ translateX: -frameX * spriteWidth }, { translateY: -row * spriteHeight }],
            },
          ]}
          onError={(error) => {
            console.error(`[NPC] Failed to load sprite for ${id}:`, error);
          }}
          resizeMode="cover"
        />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000, // Ensure NPCs are above everything
  },
  spriteContainer: {
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
