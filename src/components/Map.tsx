// components/Map.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { Tile } from "../types";

export interface MapProps {
  x: number;
  y: number;
  tiles: Tile[][];
  tileSize: number;
}

const tileStyles: Record<Tile, any> = {
  grass: { backgroundColor: "#6C9A0A" },
  path: { backgroundColor: "#C2B280" },
  water: { backgroundColor: "#4A90E2" },
  tree: { backgroundColor: "#2E7D32" },
  rock: { backgroundColor: "#757575" },
};

export const Map: React.FC<MapProps> = ({ x, y, tiles, tileSize }) => (
  <View style={[styles.container, { left: x, top: y }]}>
    {tiles.map((row, r) =>
      row.map((tile, c) => (
        <View
          key={`${r}-${c}`}
          style={[
            styles.tile,
            tileStyles[tile],
            {
              width: tileSize,
              height: tileSize,
              left: c * tileSize,
              top: r * tileSize,
            },
          ]}
        />
      ))
    )}
  </View>
);

const styles = StyleSheet.create({
  container: { position: "absolute", width: "100%", height: "100%" },
  tile: { position: "absolute" },
});
