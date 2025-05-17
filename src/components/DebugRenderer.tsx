import React from "react";
import { View } from "react-native";
import { DebugCollision } from "./DebugCollision";

interface DebugRendererProps {
  boxes: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
  }>;
}

export const DebugRenderer: React.FC<DebugRendererProps> = (props) => {
  console.log("Debug Renderer Props:", {
    boxCount: props.boxes.length,
    boxes: props.boxes,
  });

  return (
    <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none" }}>
      {props.boxes?.map((box, index) => (
        <DebugCollision key={`debug-box-${index}`} x={box.x} y={box.y} width={box.width} height={box.height} color={box.color} />
      ))}
    </View>
  );
};
