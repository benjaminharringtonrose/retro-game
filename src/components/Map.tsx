// components/Map.tsx
import React from "react";
import { StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import { Tile } from "../types";

export interface MapProps {
  mapX: Animated.SharedValue<number>;
  mapY: Animated.SharedValue<number>;
  tiles: Tile[][];
  tileSize: number;
  mapAnimatedStyle: any;
}

const tileStyles: Record<Tile, any> = {
  grass: { backgroundColor: "#6C9A0A" },
  path: { backgroundColor: "#C2B280" },
  water: { backgroundColor: "#4A90E2" },
  tree: { backgroundColor: "#2E7D32" },
  rock: { backgroundColor: "#757575" },
};

export const Map: React.FC<MapProps> = ({
  tiles,
  tileSize,
  mapAnimatedStyle,
}) => (
  <Animated.View style={[styles.container, mapAnimatedStyle]}>
    {tiles.map((row, r) =>
      row.map((tile, c) => (
        <Animated.View
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
  </Animated.View>
);

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  tile: { position: "absolute" },
});
