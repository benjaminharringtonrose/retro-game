// components/Map.tsx
import React, { useMemo } from "react";
import { StyleSheet } from "react-native";
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

const TREE_SCALE = 1.5;

export const Map = React.memo(
  ({ mapX, mapY, tiles, tileSize, mapType }: MapProps) => {
    const mapAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: mapX.value }, { translateY: mapY.value }],
    }));

    // Calculate padding needed for the container to prevent tree cutoff
    const padding = useMemo(() => Math.ceil((TREE_SCALE - 1) * tileSize), [tileSize]);

    // Memoize the images
    const treeImage = useMemo(() => require("../assets/tree.png"), []);
    const backgroundImage = useMemo(() => (mapType === MapType.FOREST ? require("../assets/forest-background.png") : null), [mapType]);

    // Calculate map dimensions
    const mapWidth = useMemo(() => tiles[0].length * tileSize, [tiles, tileSize]);
    const mapHeight = useMemo(() => tiles.length * tileSize, [tiles, tileSize]);

    // First render the background if it's a forest map
    const background = useMemo(() => {
      if (backgroundImage) {
        return (
          <Image
            source={backgroundImage}
            style={[
              styles.background,
              {
                width: mapWidth,
                height: mapHeight,
              },
            ]}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        );
      }
      return null;
    }, [backgroundImage, mapWidth, mapHeight]);

    // Then render the base tiles
    const baseTiles = useMemo(() => {
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
                    // Make grass tiles transparent when we have a background
                    ...(tile === Tile.Grass && backgroundImage ? { backgroundColor: "transparent" } : {}),
                  },
                ]}
              />
            );
          }
          // For tree tiles, render transparent background when we have forest background
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
                  backgroundColor: backgroundImage ? "transparent" : "#6C9A0A",
                  zIndex: 0,
                },
              ]}
            />
          );
        })
      );
    }, [tiles, tileSize, backgroundImage]);

    // Then render trees separately to ensure proper layering
    const treeTiles = useMemo(() => {
      return tiles.map((row, r) =>
        row.map((tile, c) => {
          if (tile === Tile.Tree) {
            const scaledSize = tileSize * TREE_SCALE;
            const offset = (scaledSize - tileSize) / 2;
            return (
              <Image
                key={`tree-${r}-${c}`}
                source={treeImage}
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
    }, [tiles, tileSize, treeImage]);

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
        {background}
        {baseTiles}
        {treeTiles}
      </Animated.View>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function for memo
    return prevProps.mapX === nextProps.mapX && prevProps.mapY === nextProps.mapY && prevProps.tileSize === nextProps.tileSize && prevProps.tiles === nextProps.tiles && prevProps.mapType === nextProps.mapType;
  }
);

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
  background: {
    position: "absolute",
    left: 0,
    top: 0,
  },
});
