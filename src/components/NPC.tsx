import React from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { NPCProps } from "../types";

const SPRITE_WIDTH = 32;
const SPRITE_HEIGHT = 40;
const lillySprite = require("../assets/lilly-spritesheet.png");

export const NPC: React.FC<NPCProps> = ({ position }) => {
  const { x, y } = position;

  return (
    <View
      style={[
        styles.container,
        {
          position: "absolute",
          left: x,
          top: y,
          width: SPRITE_WIDTH,
          height: SPRITE_HEIGHT,
        },
      ]}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
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
