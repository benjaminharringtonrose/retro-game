// components/Map.tsx
import React from "react";
import { StyleSheet } from "react-native";
import Animated, { SharedValue } from "react-native-reanimated";
import { Image } from "expo-image";

import { Tile } from "../types";

export interface MapProps {
  mapX: SharedValue<number>;
  mapY: SharedValue<number>;
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
      row.map((tile, c) => {
        if (tile === Tile.Tree) {
          return (
            <Image
              key={`${r}-${c}`}
              source={require("../assets/tree.png")}
              cachePolicy="memory-disk"
              style={[
                styles.tile,
                {
                  width: tileSize,
                  height: tileSize,
                  left: c * tileSize,
                  top: r * tileSize,
                  backgroundColor: "#6C9A0A",
                },
              ]}
            />
          );
        }

        return (
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
        );
      })
    )}
  </Animated.View>
);

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  tile: {
    position: "absolute",
  },
});
