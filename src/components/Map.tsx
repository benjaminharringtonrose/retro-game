// Map.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { Tile } from "../types";

export interface MapProps {
  x: number;
  y: number;
  width: number;
  height: number;
  tiles: Tile[][];
  tileSize: number;
}

const tileStyles: Record<Tile, any> = {
  grass: { backgroundColor: "#7cad6c" },
  water: { backgroundColor: "#3498db" },
  tree: { backgroundColor: "#2e5e1b", borderRadius: 24 },
  rock: { backgroundColor: "#7f8c8d", borderRadius: 5 },
  path: { backgroundColor: "#d2b48c" },
};

export const Map: React.FC<MapProps> = ({
  x,
  y,
  tiles,
  tileSize,
  width,
  height,
}) => (
  <View style={[styles.container, { left: x, top: y, width, height }]}>
    {tiles.map((row, ry) =>
      row.map((tile, cx) => (
        <View
          key={`${ry}-${cx}`}
          style={[
            styles.tile,
            tileStyles[tile],
            {
              width: tileSize,
              height: tileSize,
              left: cx * tileSize,
              top: ry * tileSize,
            },
          ]}
        />
      ))
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    position: "absolute",
  },
  tile: {
    position: "absolute",
  },
});
