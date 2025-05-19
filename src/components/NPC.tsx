import React from "react";
import { StyleSheet, View, Pressable, Image } from "react-native";
import { NPCProps, Direction } from "../types";
import { NPC_CONFIGS } from "../config/npcs";

// Debug logging
const debugNPC = (message: string, data?: any) => {
  console.log(`[NPC Debug] ${message}`, data || "");
};

export const NPC: React.FC<NPCProps> = ({ position, movement, animation, onInteract, id }) => {
  const { x, y } = position;
  const { direction, isMoving } = movement;
  const { currentFrame } = animation;

  // Get NPC config
  const config = NPC_CONFIGS[id];
  if (!config) {
    console.error(`No configuration found for NPC: ${id}`);
    return null;
  }

  const { sprite } = config;

  // Get the appropriate sprite row based on direction
  const spriteRow = sprite.rows[direction] ?? sprite.rows[Direction.Down];
  const row = spriteRow ?? 0;

  // Calculate frame position
  const frameX = isMoving ? currentFrame : 1;

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
          transform: [{ translateX: x - (sprite.width * sprite.scale) / 2 }, { translateY: y - (sprite.height * sprite.scale) / 2 }],
        },
      ]}
      testID={`npc-${id}`}
      hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <View
        style={[
          styles.spriteContainer,
          {
            width: sprite.width * sprite.scale,
            height: sprite.height * sprite.scale,
          },
        ]}
      >
        <Image
          source={sprite.source}
          style={[
            styles.sprite,
            {
              position: "absolute",
              left: -(frameX * sprite.width),
              top: -(row * sprite.height || 0),
              width: sprite.width * sprite.frameCount,
              height: sprite.height * 4,
              transform: [{ scale: sprite.scale }],
            },
          ]}
          onError={(error) => {
            console.error(`[NPC] Failed to load sprite for ${id}:`, error);
          }}
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
    overflow: "hidden",
  },
  sprite: {
    position: "absolute",
  },
});
