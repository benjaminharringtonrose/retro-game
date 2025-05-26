// components/Map.tsx
import React, { useMemo, useState, useEffect } from "react";
import { StyleSheet, View, FlatList, TouchableOpacity, Text } from "react-native";
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
            zIndex: 2400, // Lower than portal (2750)
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
        {tiles.map((tile: number, colIndex: number) => {
          // Skip cabin tiles as they're rendered in a separate layer
          if (tile === Tile.Cabin) {
            return (
              <View
                key={`tree-container-${rowIndex}-${colIndex}`}
                style={{
                  width: tileSize,
                  height: tileSize,
                  position: "relative",
                }}
              />
            );
          }

          return (
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
            </View>
          );
        })}
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

export const Map: React.FC<MapProps> = React.memo(({ position, dimensions, tileData, debug, onImageLoad }) => {
  const [showGrid, setShowGrid] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const { x, y } = position;
  const { width, height } = dimensions;
  const { tileSize, tiles, background } = tileData;

  useEffect(() => {
    if (backgroundLoaded) {
      console.log("[Map] Background loaded");
      onImageLoad?.("background");
    }
  }, [backgroundLoaded, onImageLoad]);

  // Get debug boxes if they exist
  const debugBoxes = debug?.boxes || [];

  // Update debug prop with showDebug state
  if (debug) {
    debug.showDebug = showDebug;
  }

  // Prepare data for FlatList - render all tiles without slicing
  const rowData = useMemo(() => {
    return tiles.map((row, index) => ({
      rowIndex: index,
      tiles: row,
      startCol: 0,
      endCol: row.length,
      tileSize,
      onImageLoad: onImageLoad as (assetId?: string) => void,
    }));
  }, [tiles, tileSize, onImageLoad]);

  const keyExtractor = (item: RowData) => `row-${item.rowIndex}`;
  const renderItem = ({ item }: { item: RowData }) => <MapRow item={item} />;

  // Find cabin tiles
  const cabinTiles = useMemo(() => {
    const cabins: { row: number; col: number }[] = [];
    tiles.forEach((row, rowIndex) => {
      row.forEach((tile, colIndex) => {
        if (tile === Tile.Cabin) {
          cabins.push({ row: rowIndex, col: colIndex });
        }
      });
    });
    return cabins;
  }, [tiles]);

  console.log("[Map] Rendering with position:", { x, y, width, height });

  return (
    <>
      {/* Base map layer */}
      <View
        style={[
          styles.map,
          {
            position: "absolute",
            left: x,
            top: y,
            width,
            height,
            zIndex: 1,
            overflow: "visible",
          },
        ]}
      >
        <View style={[styles.mapContainer, { width, height }]}>
          <Image
            source={background}
            style={[
              styles.background,
              {
                width: width,
                height: height,
                opacity: 1,
                position: "absolute",
                top: 0,
                left: 0,
              },
            ]}
            contentFit="cover"
            onLoadEnd={() => {
              if (!backgroundLoaded) {
                console.log("[Map] Background loaded");
                setBackgroundLoaded(true);
              }
            }}
          />
          <FlatList data={rowData} renderItem={renderItem} keyExtractor={keyExtractor} showsVerticalScrollIndicator={false} scrollEnabled={false} style={[styles.list]} initialNumToRender={tiles.length} />
          {showGrid && <GridOverlay tileSize={tileSize} width={width} height={height} />}
          {showDebug && debugBoxes.length > 0 && (
            <View style={StyleSheet.absoluteFill}>
              <DebugRenderer boxes={debugBoxes} />
            </View>
          )}
        </View>
      </View>

      {/* Cabin layer */}
      <View
        style={[
          styles.map,
          {
            position: "absolute",
            left: x,
            top: y,
            width,
            height,
            pointerEvents: "none",
            zIndex: 2400, // Lower than portal (2750)
          },
        ]}
      >
        {cabinTiles.map(({ row, col }) => (
          <View
            key={`cabin-${row}-${col}`}
            style={{
              position: "absolute",
              left: col * tileSize,
              top: row * tileSize,
              width: tileSize,
              height: tileSize,
            }}
          >
            <CabinTile tile={Tile.Cabin} tileSize={tileSize} onImageLoad={onImageLoad} />
          </View>
        ))}
      </View>

      {/* Controls layer */}
      <View style={[styles.devControls, { zIndex: 4000 }]}>
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
    overflow: "visible",
  },
  mapContainer: {
    position: "relative",
    overflow: "visible",
  },
  background: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    zIndex: 1,
  },
  list: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 2,
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
    zIndex: 2000,
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
