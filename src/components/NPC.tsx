import React, { useEffect, useState } from "react";
import { StyleSheet, View, TouchableOpacity, Pressable } from "react-native";
import { Image } from "expo-image";
import { NPCProps, Direction } from "../types";
import { NPC_CONFIGS } from "../config/npcs";

// Debug logging
const debugNPC = (message: string, data?: any) => {
  console.log(`[NPC Debug] ${message}`, data || "");
};

export const NPC: React.FC<NPCProps> = ({ position, movement, animation, onInteract, id }) => {
  const [hasLoaded, setHasLoaded] = useState(false);
  const { x, y } = position;
  const { direction, isMoving } = movement;
  const { currentFrame, onImageLoad } = animation;

  // Get NPC config
  const config = NPC_CONFIGS[id];
  if (!config) {
    console.error(`No configuration found for NPC: ${id}`);
    return null;
  }

  const { sprite } = config;

  // Add debug logging
  useEffect(() => {
    debugNPC("NPC Mounted", { id, x, y, direction, isMoving });
    debugNPC("Sprite Config", {
      width: sprite.width,
      height: sprite.height,
      scale: sprite.scale,
      source: sprite.source,
    });
  }, []);

  // Get the appropriate sprite row based on direction
  const spriteRow = sprite.rows[direction] ?? sprite.rows[Direction.Down];
  const row = spriteRow ?? 0; // Ensure we always have a number

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

  const handleLoadEnd = () => {
    if (!hasLoaded) {
      debugNPC("Sprite image loaded", { id });
      onImageLoad?.("npc-" + id);
      setHasLoaded(true);
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
          contentFit="contain"
          cachePolicy="memory-disk"
          recyclingKey={id}
          onLoadEnd={handleLoadEnd}
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
  },
  spriteContainer: {
    overflow: "hidden",
  },
  sprite: {
    position: "absolute",
  },
});
