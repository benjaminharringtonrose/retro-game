// components/Map.tsx
import React, { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { StyleSheet, View, FlatList, ListRenderItem, FlatListProps } from "react-native";
import Animated, { SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { Image } from "expo-image";

import { Tile, MapType, CollidableEntity } from "../types";

const ASSETS = {
  tree: require("../assets/tree.png"),
  tree2: require("../assets/tree-2.png"),
  forestBackground: require("../assets/forest-background.png"),
};

export interface MapProps {
  mapX: SharedValue<number>;
  mapY: SharedValue<number>;
  tiles: Tile[][];
  tileSize: number;
  mapType: MapType;
  collidableEntities?: CollidableEntity[];
  background?: any; // Optional background image
  onLoadComplete?: () => void;
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

export const Map = React.memo(({ mapX, mapY, tiles, tileSize, mapType, collidableEntities, background, onLoadComplete }: MapProps) => {
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const [treeLoadCount, setTreeLoadCount] = useState(0);
  const loadedTrees = useRef(new Set<string>());

  const totalTrees = useMemo(() => {
    const count = tiles.flat().filter((tile) => tile === Tile.Tree || tile === Tile.Tree2).length;
    return count;
  }, [tiles]);

  // Check if everything is loaded
  useEffect(() => {
    const isComplete = (!background || backgroundLoaded) && treeLoadCount === totalTrees;

    if (isComplete) {
      onLoadComplete?.();
    } else {
      console.log("Map loading status:", {
        backgroundLoaded,
        treeLoadCount,
        totalTrees,
        complete: isComplete,
      });
    }
  }, [background, backgroundLoaded, treeLoadCount, totalTrees, onLoadComplete]);

  const handleTreeLoad = useCallback(
    (treeKey: string) => {
      if (!loadedTrees.current.has(treeKey)) {
        loadedTrees.current.add(treeKey);
        setTreeLoadCount((prev) => prev + 1);
      }
    },
    [treeLoadCount]
  );

  const handleTreeError = useCallback((error: any) => {
    console.error("Failed to load tree:", error);
  }, []);

  const handleBackgroundLoad = useCallback(() => {
    setBackgroundLoaded(true);
  }, []);

  const handleBackgroundError = useCallback((error: any) => {
    console.error("Failed to load background:", error);
  }, []);

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
          backgroundColor: "#6C9A0A", // Default grass color
        },
      ]}
    >
      {background && <Image source={background} style={[styles.background, { width: mapWidth, height: mapHeight }]} contentFit="cover" onLoad={() => setBackgroundLoaded(true)} />}
      <Animated.FlatList
        data={flattenedTiles}
        renderItem={({ item }) => {
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
            const treeImageStyle = {
              ...styles.tree,
              width: scaledSize,
              height: scaledSize,
              left: -offset,
              top: -offset,
              zIndex: 2,
            };
            return (
              <View style={[styles.tileWrapper, position]}>
                <Image source={item.tile === Tile.Tree ? ASSETS.tree : ASSETS.tree2} style={treeImageStyle} contentFit="contain" cachePolicy="memory" transition={200} onLoadEnd={() => handleTreeLoad(item.key)} onError={handleTreeError} />
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
        }}
        numColumns={tiles[0].length}
        removeClippedSubviews={true}
        maxToRenderPerBatch={20}
        windowSize={5}
        initialNumToRender={30}
        style={styles.tilesContainer}
        scrollEnabled={false}
        getItemLayout={getItemLayout}
      />

      {/* Render collidable entities */}
      {collidableEntities?.map((entity, index) => {
        const position = {
          top: entity.position.row * tileSize,
          left: entity.position.col * tileSize,
        };

        const size = {
          width: entity.collision.width * tileSize,
          height: entity.collision.height * tileSize,
        };

        const scaledSize = {
          width: size.width * entity.scale,
          height: size.height * entity.scale,
        };

        const offset = {
          left: (scaledSize.width - size.width) / 2,
          top: (scaledSize.height - size.height) / 2,
        };

        return (
          <View key={`entity-${index}`} style={[styles.entityWrapper, position, size]}>
            <Image
              source={entity.sprite}
              style={[
                styles.entityImage,
                {
                  width: scaledSize.width,
                  height: scaledSize.height,
                  left: -offset.left,
                  top: -offset.top,
                },
              ]}
              contentFit="contain"
              cachePolicy="memory"
            />
          </View>
        );
      })}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    overflow: "visible",
    backgroundColor: "transparent",
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
    backgroundColor: "transparent",
  },
  tileWrapper: {
    position: "absolute",
    width: 48,
    height: 48,
    backgroundColor: "transparent",
  },
  tile: {
    position: "absolute",
    backgroundColor: "transparent",
  },
  tree: {
    position: "absolute",
    backgroundColor: "transparent",
  },
  entityWrapper: {
    position: "absolute",
    overflow: "visible",
  },
  entityImage: {
    position: "absolute",
  },
});
