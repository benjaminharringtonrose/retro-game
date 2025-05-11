import React, { memo } from "react";
import { Image, StyleSheet } from "react-native";
import { MAP } from "../constants/map";

interface NPCProps {
  x: number;
  y: number;
  tileSize: number;
  camera: { x: number; y: number };
}

const NPC: React.FC<NPCProps> = ({ x, y, tileSize, camera }) => {
  // Validate position
  if (
    x < 0 ||
    y < 0 ||
    y >= MAP.length ||
    x >= MAP[0].length ||
    MAP[y][x] === 0 // Assuming 0 is an invalid tile
  ) {
    console.warn("NPC: Invalid position", { x, y });
    return null;
  }

  return (
    <Image
      source={require("../assets/sprites/newspaper.png")}
      style={[
        styles.image,
        {
          left: x * tileSize + camera.x,
          top: y * tileSize + camera.y,
          width: tileSize,
          height: tileSize,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  image: {
    position: "absolute",
  },
});

export default memo(NPC);
