// components/Map.tsx
import React, { useMemo, useState } from "react";
import { StyleSheet, View, FlatList, TouchableOpacity, Text, Image } from "react-native";
import { MapProps, Tile } from "../types";
import { DebugRenderer } from "./DebugRenderer";
import { DevMenu } from "./DevMenu";
import { logger } from "../utils/logger";
import { GroundTile } from "./GroundTile";
import { TreeTile } from "./TreeTile";
import { FlowerTile } from "./FlowerTile";
import { CabinTile } from "./CabinTile";

interface RowData {
  rowIndex: number;
  tiles: number[];
  tileSize: number;
  onImageLoad?: (assetId?: string) => void;
}

const MapRow: React.FC<{ item: RowData }> = React.memo(({ item }) => {
  const { rowIndex, tiles, tileSize, onImageLoad } = item;

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

export const Map: React.FC<MapProps> = ({ position, dimensions, tileData, debug, onImageLoad }) => {
  const [showGrid, setShowGrid] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [showDevMenu, setShowDevMenu] = useState(false);
  const { x, y } = position;
  const { width, height } = dimensions;
  const { tileSize, tiles, background } = tileData;

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

  logger.log("Map", "Rendering with position:", { x, y, width, height });

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
            resizeMode="cover"
            onLoadEnd={() => {
              onImageLoad?.("background");
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
            zIndex: 250, // Base cabin layer z-index
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
            <CabinTile tile={Tile.Cabin} tileSize={tileSize} onImageLoad={onImageLoad} zIndex={250} />
          </View>
        ))}
      </View>

      {/* Dev Menu Button */}
      <View style={[styles.devControls, { zIndex: 4000 }]}>
        <TouchableOpacity style={styles.devButton} onPress={() => setShowDevMenu(true)}>
          <Text style={styles.devButtonText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Dev Menu Modal */}
      <DevMenu isVisible={showDevMenu} onClose={() => setShowDevMenu(false)} showGrid={showGrid} onToggleGrid={() => setShowGrid(!showGrid)} showDebug={showDebug} onToggleDebug={() => setShowDebug(!showDebug)} debugBoxCount={debugBoxes.length} />
    </>
  );
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
  },
  devButton: {
    backgroundColor: "rgba(0,0,0,0.7)",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  devButtonText: {
    fontSize: 24,
  },
});
