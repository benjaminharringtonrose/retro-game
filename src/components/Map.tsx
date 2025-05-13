// components/Map.tsx
import React, { useMemo } from "react";
import { StyleSheet, View, FlatList, ListRenderItem, FlatListProps } from "react-native";
import Animated, { SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { Image } from "expo-image";

import { Tile, MapType } from "../types";

const ASSETS = {
  tree: require("../assets/tree.png"),
  tree2: require("../assets/tree-2.png"),
  forestBackground: require("../assets/forest-background.png"),
};

interface MapProps {
  mapX: SharedValue<number>;
  mapY: SharedValue<number>;
  tiles: Tile[][];
  tileSize: number;
  mapType: MapType;
}

interface TileItem {
  key: string;
  tile: Tile;
  row: number;
  col: number;
}

const tileStyles: Record<Tile, any> = {
  [Tile.Grass]: { backgroundColor: "#6C9A0A" },
  [Tile.Path]: { backgroundColor: "#C2B280" },
  [Tile.Water]: { backgroundColor: "#4A90E2" },
  [Tile.Tree]: { backgroundColor: "#2E7D32" },
  [Tile.Tree2]: { backgroundColor: "#2E7D32" },
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

  // Flatten the 2D array into 1D for FlatList
  const flattenedTiles = useMemo(
    () =>
      tiles.flatMap((row, r) =>
        row.map((tile, c) => ({
          key: `tile-${r}-${c}`,
          tile,
          row: r,
          col: c,
        }))
      ),
    [tiles]
  );

  const renderItem: ListRenderItem<TileItem> = ({ item }) => {
    const position = {
      top: item.row * tileSize,
      left: item.col * tileSize,
    };

    // For grass tiles, render an empty wrapper to maintain structure
    if (item.tile === Tile.Grass) {
      return <View style={[styles.tileWrapper, position]} />;
    }

    if (item.tile === Tile.Tree || item.tile === Tile.Tree2) {
      const scaledSize = tileSize * TREE_SCALE;
      const offset = (scaledSize - tileSize) / 2;
      return (
        <View style={[styles.tileWrapper, position]}>
          <Image
            source={item.tile === Tile.Tree ? ASSETS.tree : ASSETS.tree2}
            style={[
              styles.tree,
              {
                width: scaledSize,
                height: scaledSize,
                left: -offset,
                top: -offset,
                zIndex: 2,
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
      <View style={[styles.tileWrapper, position]}>
        <View
          style={[
            styles.tile,
            tileStyles[item.tile],
            {
              width: tileSize,
              height: tileSize,
            },
          ]}
        />
      </View>
    );
  };

  const getItemLayout = (data: ArrayLike<TileItem> | null | undefined, index: number) => ({
    length: tileSize,
    offset: tileSize * Math.floor(index / tiles[0].length),
    index,
  });

  return (
    <Animated.View
      style={[
        styles.container,
        mapAnimatedStyle,
        {
          width: mapWidth + padding * 2,
          height: mapHeight + padding * 2,
          padding,
          backgroundColor: "#1a472a",
        },
      ]}
    >
      {mapType === MapType.FOREST && (
        <View style={[styles.background, { width: mapWidth, height: mapHeight }]}>
          <Image source={ASSETS.forestBackground} style={[{ width: mapWidth, height: mapHeight }]} contentFit="cover" cachePolicy="memory-disk" />
        </View>
      )}
      <Animated.FlatList
        data={flattenedTiles}
        renderItem={renderItem}
        numColumns={tiles[0].length}
        removeClippedSubviews={true}
        maxToRenderPerBatch={20}
        windowSize={5}
        initialNumToRender={30}
        style={styles.tilesContainer}
        scrollEnabled={false}
        getItemLayout={getItemLayout}
      />
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
    backgroundColor: "transparent",
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
    backgroundColor: "transparent",
  },
});
