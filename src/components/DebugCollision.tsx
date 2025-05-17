import React from "react";
import { View } from "react-native";

interface DebugCollisionProps {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export const DebugCollision: React.FC<DebugCollisionProps> = ({ x, y, width, height, color }) => {
  return (
    <View
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: width,
        height: height,
        borderWidth: 2,
        borderColor: color,
        backgroundColor: `${color}33`, // 20% opacity
        zIndex: 1000,
      }}
    />
  );
};
