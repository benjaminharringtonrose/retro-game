// components/Map.tsx
import React, { useMemo, useState } from "react";
import { StyleSheet, View, ImageBackground, Dimensions, FlatList, TouchableOpacity, Text } from "react-native";
import { Image } from "expo-image";
import { MapProps, Tile } from "../types";

const TREE_SCALE = 1.5; // Scale for tree sprites
const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get("window");
const RENDER_AHEAD = 2; // Number of rows/columns to render ahead

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

  return (
    <View
      style={[
        styles.tile,
        {
          width: tileSize,
          height: tileSize,
          position: "absolute",
          top: 0,
          left: 0,
        },
      ]}
    >
      <Image
        source={require("../assets/tree.png")}
        style={[
          styles.tileImage,
          {
            width: tileSize * TREE_SCALE,
            height: tileSize * TREE_SCALE,
            transform: [{ translateX: (-tileSize * (TREE_SCALE - 1)) / 2 }, { translateY: (-tileSize * (TREE_SCALE - 1)) / 2 }],
          },
        ]}
        contentFit="contain"
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
    <View style={styles.row}>
      {/* Ground layer */}
      {tiles.slice(startCol, endCol).map((tile: number, colIndex: number) => (
        <GroundTile key={`ground-${rowIndex}-${colIndex + startCol}`} tile={tile} tileSize={tileSize} />
      ))}
      {/* Tree layer */}
      {tiles.slice(startCol, endCol).map((tile: number, colIndex: number) => (
        <TreeTile key={`tree-${rowIndex}-${colIndex + startCol}`} tile={tile} tileSize={tileSize} />
      ))}
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

export const Map: React.FC<MapProps> = React.memo(({ position, dimensions, tileData }) => {
  const [showGrid, setShowGrid] = useState(false);
  const { x, y } = position;
  const { width, height } = dimensions;
  const { tileSize, tiles } = tileData;

  // Calculate visible tile range
  const startCol = Math.max(0, Math.floor(-x / tileSize) - RENDER_AHEAD);
  const endCol = Math.min(tiles[0].length, Math.ceil((-x + WINDOW_WIDTH) / tileSize) + RENDER_AHEAD);
  const startRow = Math.max(0, Math.floor(-y / tileSize) - RENDER_AHEAD);
  const endRow = Math.min(tiles.length, Math.ceil((-y + WINDOW_HEIGHT) / tileSize) + RENDER_AHEAD);

  // Prepare data for FlatList
  const rowData = useMemo(() => {
    return tiles.slice(startRow, endRow).map((row, index) => ({
      rowIndex: index + startRow,
      tiles: row,
      startCol,
      endCol,
      tileSize,
    }));
  }, [startRow, endRow, startCol, endCol, tileSize, tiles]);

  const keyExtractor = (item: RowData) => `row-${item.rowIndex}`;
  const renderItem = ({ item }: { item: RowData }) => <MapRow item={item} />;

  return (
    <View style={{ flex: 1 }}>
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
          <FlatList data={rowData} renderItem={renderItem} keyExtractor={keyExtractor} showsVerticalScrollIndicator={false} scrollEnabled={false} style={styles.list} />
          {showGrid && <GridOverlay tileSize={tileSize} width={width} height={height} />}
        </ImageBackground>
      </View>
      <TouchableOpacity style={styles.devToggle} onPress={() => setShowGrid(!showGrid)}>
        <Text style={styles.devToggleText}>{showGrid ? "Hide Grid" : "Show Grid"}</Text>
      </TouchableOpacity>
    </View>
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
  },
  tile: {
    position: "relative",
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
  devToggle: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 10,
    borderRadius: 5,
    zIndex: 1000,
  },
  devToggleText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
});
