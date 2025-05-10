import React from "react";
import { Image } from "react-native";

interface NPCProps {
  x: number;
  y: number;
  tileSize: number;
  camera: any;
}

const NPC: React.FC<NPCProps> = ({ x, y, tileSize, camera }) => {
  return (
    <Image
      source={require("../assets/sprites/newspaper.png")}
      style={{
        position: "absolute",
        left: x * tileSize + camera.x,
        top: y * tileSize + camera.y,
        width: tileSize,
        height: tileSize,
      }}
    />
  );
};

export default NPC;
