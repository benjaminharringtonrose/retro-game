// components/Map.tsx
import React, { useMemo, useState, useCallback, useEffect } from "react";
import { StyleSheet, View, ImageBackground, FlatList, TouchableOpacity, Text, Image as RNImage } from "react-native";
import { Image } from "expo-image";
import { MapProps, Tile } from "../types";
import { DebugRenderer } from "./DebugRenderer";

const TREE_SCALE = 1.5; // Scale for tree sprites
const CABIN_SCALE = 3.5; // Scale for cabin sprite
const TREE_1 = require("../assets/tree.png");
const TREE_2 = require("../assets/tree-2.png");
const FLOWER = require("../assets/flowers.png");
const CABIN = require("../assets/cabin.png");

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
const TreeTile: React.FC<{ tile: number; tileSize: number; onImageLoad?: (assetId?: string) => void }> = React.memo(({ tile, tileSize, onImageLoad }) => {
  const [hasLoaded, setHasLoaded] = useState(false);
  if (tile !== Tile.Tree && tile !== Tile.Tree2) return null;

  const treeSource = tile === Tile.Tree2 ? TREE_2 : TREE_1;
  const scaledSize = tileSize * TREE_SCALE;
  const assetId = tile === Tile.Tree2 ? "tree-2" : "tree-1";

  const handleLoadEnd = () => {
    if (!hasLoaded) {
      console.log(`[Map] Tree loaded: ${assetId}`);
      onImageLoad?.(assetId);
      setHasLoaded(true);
    }
  };

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
            top: -(scaledSize - tileSize),
          },
        ]}
        contentFit="contain"
        cachePolicy={"memory-disk"}
        onLoadEnd={handleLoadEnd}
      />
    </View>
  );
});

// Separate component for flowers
const FlowerTile: React.FC<{ tile: number; tileSize: number; onImageLoad?: (assetId?: string) => void }> = React.memo(({ tile, tileSize, onImageLoad }) => {
  const [hasLoaded, setHasLoaded] = useState(false);
  if (tile !== Tile.Flower) return null;

  const handleLoadEnd = () => {
    if (!hasLoaded) {
      console.log("[Map] Flower loaded");
      onImageLoad?.("flower");
      setHasLoaded(true);
    }
  };

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
        onLoadEnd={handleLoadEnd}
      />
    </View>
  );
});

// Separate component for cabin
const CabinTile: React.FC<{ tile: number; tileSize: number; onImageLoad?: (assetId?: string) => void }> = React.memo(({ tile, tileSize, onImageLoad }) => {
  const [hasLoaded, setHasLoaded] = useState(false);
  if (tile !== Tile.Cabin) return null;

  const scaledSize = tileSize * CABIN_SCALE;
  const offset = (scaledSize - tileSize) / 2;

  const handleLoadEnd = () => {
    if (!hasLoaded) {
      console.log("[Map] Cabin loaded");
      onImageLoad?.("cabin");
      setHasLoaded(true);
    }
  };

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
        source={CABIN}
        style={[
          styles.tileImage,
          {
            width: scaledSize,
            height: scaledSize,
            position: "absolute",
            left: -offset,
            bottom: 0, // Align to bottom of tile
          },
        ]}
        contentFit="contain"
        cachePolicy={"memory-disk"}
        onLoadEnd={handleLoadEnd}
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
  onImageLoad?: (assetId?: string) => void;
}

const MapRow: React.FC<{ item: RowData }> = React.memo(({ item }) => {
  const { rowIndex, tiles, startCol, endCol, tileSize, onImageLoad } = item;

  return (
    <View style={[styles.row, { height: tileSize }]}>
      {/* Ground layer */}
      <View style={styles.layerContainer}>
        {tiles.map((tile: number, colIndex: number) => (
          <GroundTile key={`ground-${rowIndex}-${colIndex}`} tile={tile} tileSize={tileSize} />
        ))}
      </View>
      {/* Tree and Object layer */}
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
            <TreeTile key={`tree-${rowIndex}-${colIndex}`} tile={tile} tileSize={tileSize} onImageLoad={onImageLoad} />
            <FlowerTile key={`flower-${rowIndex}-${colIndex}`} tile={tile} tileSize={tileSize} onImageLoad={onImageLoad} />
            <CabinTile key={`cabin-${rowIndex}-${colIndex}`} tile={tile} tileSize={tileSize} onImageLoad={onImageLoad} />
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
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const { x, y } = position;
  const { width, height } = dimensions;
  const { tileSize, tiles, onImageLoad, background } = tileData;

  // Check if this is the cabin interior map
  const isCabin = background?.toString().includes("cabin");

  useEffect(() => {
    if (backgroundLoaded) {
      console.log("[Map] Background loaded");
      onImageLoad?.("background");
    }
  }, [backgroundLoaded, onImageLoad]);

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
      onImageLoad,
    }));
  }, [tiles, tileSize, onImageLoad]);

  const keyExtractor = (item: RowData) => `row-${item.rowIndex}`;
  const renderItem = ({ item }: { item: RowData }) => <MapRow item={item} />;

  return (
    <>
      <View
        style={[
          styles.map,
          {
            left: isCabin ? x : 0,
            top: isCabin ? y : 0,
            transform: isCabin ? [] : [{ translateX: x }, { translateY: y }],
            width,
            height,
          },
        ]}
      >
        {isCabin ? (
          <View style={[styles.cabinContainer, { width, height }]}>
            <RNImage
              source={background}
              style={styles.cabinBackground}
              resizeMode="contain"
              onLoadEnd={() => {
                if (!backgroundLoaded) {
                  console.log("[Map] Cabin background loaded");
                  setBackgroundLoaded(true);
                }
              }}
            />
            <FlatList data={rowData} renderItem={renderItem} keyExtractor={keyExtractor} showsVerticalScrollIndicator={false} scrollEnabled={false} style={styles.list} initialNumToRender={tiles.length} />
          </View>
        ) : (
          <ImageBackground
            source={background || require("../assets/forest-background.png")}
            style={styles.background}
            resizeMode="contain"
            onLoadEnd={() => {
              if (!backgroundLoaded) {
                console.log("[Map] Background load ended");
                setBackgroundLoaded(true);
              }
            }}
          >
            <FlatList data={rowData} renderItem={renderItem} keyExtractor={keyExtractor} showsVerticalScrollIndicator={false} scrollEnabled={false} style={styles.list} initialNumToRender={tiles.length} />
            {showGrid && <GridOverlay tileSize={tileSize} width={width} height={height} />}
            {showDebug && debugBoxes.length > 0 && (
              <View style={StyleSheet.absoluteFill}>
                <DebugRenderer boxes={debugBoxes} />
              </View>
            )}
          </ImageBackground>
        )}
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
      return "transparent";
    case Tile.Flower:
      return "transparent";
    case Tile.Cabin:
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
    backgroundColor: "#000",
  },
  background: {
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
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
  cabinContainer: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000",
  },
  cabinBackground: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
});
