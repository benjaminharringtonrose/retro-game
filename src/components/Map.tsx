// components/Map.tsx
import React, { useMemo, useState } from "react";
import { StyleSheet, View, ImageBackground, FlatList, TouchableOpacity, Text } from "react-native";
import { Image } from "expo-image";
import { MapProps, Tile } from "../types";
import { DebugRenderer } from "./DebugRenderer";

const TREE_SCALE = 1.5; // Scale for tree sprites
const TREE_1 = require("../assets/tree.png");
const TREE_2 = require("../assets/tree-2.png");
const FLOWER = require("../assets/flowers.png");

// Separate component for ground tiles
const GroundTile: React.FC<{ tile: number; tileSize: number }> = React.memo(({ tile, tileSize }) => {
  if (tile === 0 || tile === Tile.Tree || tile === Tile.Tree2) return null;

  return (
    <View
      style={[
        styles.tile,
        {
          width: tileSize,
          height: tileSize,
        },
      ]}
    >
      <View
        style={[
          styles.tileOverlay,
          {
            backgroundColor: getTileColor(tile),
          },
        ]}
      />
    </View>
  );
});

// Separate component for trees
const TreeTile: React.FC<{ tile: number; tileSize: number }> = React.memo(({ tile, tileSize }) => {
  if (tile !== Tile.Tree && tile !== Tile.Tree2) return null;

  const treeSource = tile === Tile.Tree2 ? TREE_2 : TREE_1;
  const scaledSize = tileSize * TREE_SCALE;

  return (
    <View
      style={[
        styles.tile,
        {
          width: tileSize,
          height: tileSize,
          position: "absolute",
        },
      ]}
    >
      <Image
        source={treeSource}
        style={[
          styles.tileImage,
          {
            width: scaledSize,
            height: scaledSize,
            position: "absolute",
            left: -((scaledSize - tileSize) / 2),
            top: -(scaledSize - tileSize), // Place tree at bottom of tile
          },
        ]}
        contentFit="contain"
        cachePolicy={"memory-disk"}
      />
    </View>
  );
});

// Separate component for flowers
const FlowerTile: React.FC<{ tile: number; tileSize: number }> = React.memo(({ tile, tileSize }) => {
  if (tile !== Tile.Flower) return null;

  return (
    <View
      style={[
        styles.tile,
        {
          width: tileSize,
          height: tileSize,
          position: "absolute",
        },
      ]}
    >
      <Image
        source={FLOWER}
        style={[
          styles.tileImage,
          {
            width: tileSize,
            height: tileSize,
            position: "absolute",
          },
        ]}
        contentFit="contain"
        cachePolicy={"memory-disk"}
      />
    </View>
  );
});

interface RowData {
  rowIndex: number;
  tiles: number[];
  startCol: number;
  endCol: number;
  tileSize: number;
}

const MapRow: React.FC<{ item: RowData }> = React.memo(({ item }) => {
  const { rowIndex, tiles, startCol, endCol, tileSize } = item;

  return (
    <View style={[styles.row, { height: tileSize }]}>
      {/* Ground layer */}
      <View style={styles.layerContainer}>
        {tiles.map((tile: number, colIndex: number) => (
          <GroundTile key={`ground-${rowIndex}-${colIndex}`} tile={tile} tileSize={tileSize} />
        ))}
      </View>
      {/* Tree layer */}
      <View style={styles.layerContainer}>
        {tiles.map((tile: number, colIndex: number) => (
          <View
            key={`tree-container-${rowIndex}-${colIndex}`}
            style={{
              width: tileSize,
              height: tileSize,
              position: "relative",
            }}
          >
            <TreeTile key={`tree-${rowIndex}-${colIndex}`} tile={tile} tileSize={tileSize} />
            <FlowerTile key={`flower-${rowIndex}-${colIndex}`} tile={tile} tileSize={tileSize} />
          </View>
        ))}
      </View>
    </View>
  );
});

// Grid overlay component
const GridOverlay: React.FC<{ tileSize: number; width: number; height: number }> = React.memo(({ tileSize, width, height }) => {
  const rows = Math.ceil(height / tileSize);
  const cols = Math.ceil(width / tileSize);

  return (
    <View style={[styles.gridOverlay, { width, height }]}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <View key={`row-${rowIndex}`} style={[styles.gridLine, { top: rowIndex * tileSize, width: "100%" }]} />
      ))}
      {Array.from({ length: cols }).map((_, colIndex) => (
        <View key={`col-${colIndex}`} style={[styles.gridLine, { left: colIndex * tileSize, height: "100%" }]} />
      ))}
    </View>
  );
});

export const Map: React.FC<MapProps> = React.memo(({ position, dimensions, tileData, debug }) => {
  const [showGrid, setShowGrid] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const { x, y } = position;
  const { width, height } = dimensions;
  const { tileSize, tiles } = tileData;

  // Get debug boxes if they exist
  const debugBoxes = debug?.boxes || [];

  // Prepare data for FlatList - render all tiles without slicing
  const rowData = useMemo(() => {
    return tiles.map((row, index) => ({
      rowIndex: index,
      tiles: row,
      startCol: 0,
      endCol: row.length,
      tileSize,
    }));
  }, [tiles, tileSize]);

  const keyExtractor = (item: RowData) => `row-${item.rowIndex}`;
  const renderItem = ({ item }: { item: RowData }) => <MapRow item={item} />;

  return (
    <>
      <View
        style={[
          styles.map,
          {
            transform: [{ translateX: x }, { translateY: y }],
            width,
            height,
          },
        ]}
      >
        <ImageBackground source={require("../assets/forest-background.png")} style={styles.background} resizeMode="repeat">
          <FlatList data={rowData} renderItem={renderItem} keyExtractor={keyExtractor} showsVerticalScrollIndicator={false} scrollEnabled={false} style={styles.list} initialNumToRender={tiles.length} />
          {showGrid && <GridOverlay tileSize={tileSize} width={width} height={height} />}
          {showDebug && debugBoxes.length > 0 && (
            <View style={StyleSheet.absoluteFill}>
              <DebugRenderer boxes={debugBoxes} />
            </View>
          )}
        </ImageBackground>
      </View>
      <View style={styles.devControls}>
        <TouchableOpacity style={styles.devToggle} onPress={() => setShowGrid(!showGrid)}>
          <Text style={styles.devToggleText}>{showGrid ? "Hide Grid" : "Show Grid"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.devToggle} onPress={() => setShowDebug(!showDebug)}>
          <Text style={styles.devToggleText}>{showDebug ? `Hide Debug (${debugBoxes.length})` : "Show Debug"}</Text>
        </TouchableOpacity>
      </View>
    </>
  );
});

const getTileColor = (tile: number) => {
  switch (tile) {
    case Tile.Grass:
      return "rgba(144, 238, 144, 0.1)";
    case Tile.Path:
      return "rgba(139, 69, 19, 0.3)";
    case Tile.Water:
      return "rgba(65, 105, 225, 0.4)";
    case Tile.Tree:
    case Tile.Tree2:
      return "transparent";
    case Tile.Rock:
      return "rgba(128, 128, 128, 0.3)";
    case Tile.Flower:
      return "transparent";
    default:
      return "transparent";
  }
};

const styles = StyleSheet.create({
  map: {
    position: "absolute",
    left: 0,
    top: 0,
  },
  background: {
    width: "100%",
    height: "100%",
  },
  list: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    position: "relative",
    width: "100%",
    overflow: "visible",
  },
  layerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    overflow: "visible",
  },
  tile: {
    position: "absolute",
    overflow: "visible",
  },
  tileOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  tileImage: {
    position: "absolute",
  },
  gridOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 100,
    pointerEvents: "none",
  },
  gridLine: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    width: 1,
    height: 1,
  },
  devControls: {
    position: "absolute",
    bottom: 20,
    right: 20,
    flexDirection: "column",
    gap: 10,
    zIndex: 1000,
  },
  devToggle: {
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 10,
    borderRadius: 5,
  },
  devToggleText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
});
