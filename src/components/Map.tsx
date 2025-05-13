// components/Map.tsx
import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { Image } from "expo-image";

import { Tile, MapType } from "../types";

export interface MapProps {
  mapX: SharedValue<number>;
  mapY: SharedValue<number>;
  tiles: Tile[][];
  tileSize: number;
  mapType: MapType;
}

const tileStyles: Record<Tile, any> = {
  [Tile.Grass]: { backgroundColor: "#6C9A0A" },
  [Tile.Path]: { backgroundColor: "#C2B280" },
  [Tile.Water]: { backgroundColor: "#4A90E2" },
  [Tile.Tree]: { backgroundColor: "#2E7D32" },
  [Tile.Rock]: { backgroundColor: "#757575" },
};

const TREE_SCALE = 2.0;

export const Map = React.memo(({ mapX, mapY, tiles, tileSize, mapType }: MapProps) => {
  const mapAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: mapX.value }, { translateY: mapY.value }],
  }));

  // Calculate padding needed for the container
  const padding = useMemo(() => Math.ceil((TREE_SCALE - 1) * tileSize), [tileSize]);

  // Calculate map dimensions
  const mapWidth = useMemo(() => tiles[0].length * tileSize, [tiles, tileSize]);
  const mapHeight = useMemo(() => tiles.length * tileSize, [tiles, tileSize]);

  // Render base tiles and trees together
  const renderTiles = useMemo(() => {
    return tiles.map((row, r) =>
      row.map((tile, c) => {
        const key = `tile-${r}-${c}`;
        const position = { top: r * tileSize, left: c * tileSize };

        // For grass tiles, render an empty wrapper to maintain structure
        if (tile === Tile.Grass) {
          return <View key={key} style={[styles.tileWrapper, position]} />;
        }

        if (tile === Tile.Tree) {
          const scaledSize = tileSize * TREE_SCALE;
          const offset = (scaledSize - tileSize) / 2;
          return (
            <View key={key} style={[styles.tileWrapper, position]}>
              <Image
                source={require("../assets/tree.png")}
                style={[
                  styles.tree,
                  {
                    width: scaledSize,
                    height: scaledSize,
                    left: -offset,
                    top: -offset,
                    zIndex: 2, // Ensure trees render above tiles
                  },
                ]}
                contentFit="contain"
                cachePolicy="memory"
                transition={200}
              />
            </View>
          );
        }

        return (
          <View key={key} style={[styles.tileWrapper, position]}>
            <View
              style={[
                styles.tile,
                tileStyles[tile],
                {
                  width: tileSize,
                  height: tileSize,
                },
              ]}
            />
          </View>
        );
      })
    );
  }, [tiles, tileSize]);

  return (
    <Animated.View
      style={[
        styles.container,
        mapAnimatedStyle,
        {
          width: mapWidth + padding * 2,
          height: mapHeight + padding * 2,
          padding,
          backgroundColor: "#1a472a", // Fallback background color
        },
      ]}
    >
      {mapType === MapType.FOREST && (
        <View style={[styles.background, { width: mapWidth, height: mapHeight }]}>
          <Image source={require("../assets/forest-background.png")} style={[{ width: mapWidth, height: mapHeight }]} contentFit="cover" cachePolicy="memory-disk" />
        </View>
      )}
      <View style={styles.tilesContainer}>{renderTiles}</View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    overflow: "visible",
  },
  background: {
    position: "absolute",
    left: 0,
    top: 0,
    overflow: "hidden",
    backgroundColor: "transparent", // Remove debug tint
  },
  tilesContainer: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
  tileWrapper: {
    position: "absolute",
    width: 48,
    height: 48,
  },
  tile: {
    position: "absolute",
  },
  tree: {
    position: "absolute",
    backgroundColor: "transparent", // Remove debug color
  },
});
