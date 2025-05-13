// components/Map.tsx
import React from "react";
import { StyleSheet } from "react-native";
import Animated, { SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { Image } from "expo-image";

import { Tile } from "../types";

export interface MapProps {
  mapX: SharedValue<number>;
  mapY: SharedValue<number>;
  tiles: Tile[][];
  tileSize: number;
}

const tileStyles: Record<Tile, any> = {
  [Tile.Grass]: { backgroundColor: "#6C9A0A" },
  [Tile.Path]: { backgroundColor: "#C2B280" },
  [Tile.Water]: { backgroundColor: "#4A90E2" },
  [Tile.Tree]: { backgroundColor: "#2E7D32" },
  [Tile.Rock]: { backgroundColor: "#757575" },
};

const TREE_SCALE = 1.5;

export const Map: React.FC<MapProps> = ({ mapX, mapY, tiles, tileSize }) => {
  const mapAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: mapX.value }, { translateY: mapY.value }],
  }));

  // Calculate padding needed for the container to prevent tree cutoff
  const padding = Math.ceil((TREE_SCALE - 1) * tileSize);

  // First render the base tiles
  const renderBaseTiles = () => {
    return tiles.map((row, r) =>
      row.map((tile, c) => {
        if (tile !== Tile.Tree) {
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
                  zIndex: 0,
                },
              ]}
            />
          );
        }
        // For tree tiles, render the grass background
        return (
          <Animated.View
            key={`${r}-${c}`}
            style={[
              styles.tile,
              {
                width: tileSize,
                height: tileSize,
                left: c * tileSize,
                top: r * tileSize,
                backgroundColor: "#6C9A0A", // Grass background
                zIndex: 0,
              },
            ]}
          />
        );
      })
    );
  };

  // Then render trees separately to ensure proper layering
  const renderTrees = () => {
    return tiles.map((row, r) =>
      row.map((tile, c) => {
        if (tile === Tile.Tree) {
          const scaledSize = tileSize * TREE_SCALE;
          const offset = (scaledSize - tileSize) / 2;
          return (
            <Image
              key={`tree-${r}-${c}`}
              source={require("../assets/tree.png")}
              cachePolicy="memory-disk"
              contentFit="cover"
              style={[
                styles.tile,
                {
                  width: scaledSize,
                  height: scaledSize,
                  left: c * tileSize - offset,
                  top: r * tileSize - offset,
                  zIndex: r * tiles[0].length + c,
                },
              ]}
            />
          );
        }
        return null;
      })
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        mapAnimatedStyle,
        {
          padding: padding,
          margin: -padding,
        },
      ]}
    >
      {renderBaseTiles()}
      {renderTrees()}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: "100%",
    height: "100%",
    overflow: "visible",
  },
  tile: {
    position: "absolute",
  },
});
