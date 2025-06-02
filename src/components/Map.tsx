// components/Map.tsx
import React, { useMemo, useState } from "react";
import { StyleSheet, View, FlatList, TouchableOpacity, Text, Image as RNImage } from "react-native";
import { MapProps, Tile, DebugBox } from "../types";
import { DebugRenderer } from "./DebugRenderer";
import { DevMenu } from "./DevMenu";
import { GroundTile } from "./GroundTile";
import { TreeTile } from "./TreeTile";
import { FlowerTile } from "./FlowerTile";
import { CabinTile } from "./CabinTile";
import { logger } from "../utils/logger";
import { Z_INDEX } from "../constants/zIndex";

interface RowData {
  rowIndex: number;
  tiles: number[];
  startCol: number;
  endCol: number;
  tileSize: number;
  onImageLoad?: (assetId?: string) => void;
  zIndex?: number;
}

const MapRow: React.FC<{ item: RowData }> = React.memo(({ item }) => {
  const { rowIndex, tiles, startCol, endCol, tileSize, onImageLoad, zIndex } = item;

  return (
    <View style={[styles.row, { height: tileSize }]}>
      {/* Ground layer */}
      <View style={styles.layerContainer}>
        {tiles.map((tile: number, colIndex: number) => (
          <GroundTile key={`ground-${rowIndex}-${colIndex}`} tile={tile} tileSize={tileSize} />
        ))}
      </View>

      {/* Tree and Object layer */}
      <View style={[styles.layerContainer]}>
        {tiles.map((tile: number, colIndex: number) => {
          // Skip cabin tiles as they're rendered in a separate layer
          if (tile === Tile.Cabin) {
            return null;
          }

          if (tile === Tile.Tree || tile === Tile.Tree2) {
            return (
              <View
                key={`tree-container-${rowIndex}-${colIndex}`}
                style={{
                  position: "absolute",
                  left: colIndex * tileSize,
                  top: 0,
                  width: tileSize,
                  height: tileSize,
                  zIndex,
                }}
              >
                <TreeTile tile={tile} tileSize={tileSize} onImageLoad={onImageLoad} zIndex={zIndex} />
              </View>
            );
          }

          if (tile === Tile.Flower) {
            return (
              <View
                key={`flower-container-${rowIndex}-${colIndex}`}
                style={{
                  position: "absolute",
                  left: colIndex * tileSize,
                  top: 0,
                  width: tileSize,
                  height: tileSize,
                }}
              >
                <FlowerTile tile={tile} tileSize={tileSize} onImageLoad={onImageLoad} />
              </View>
            );
          }

          return null;
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

export const Map: React.FC<MapProps> = ({ position, dimensions, tileData, debug, onImageLoad, objectZIndex }) => {
  const [showGrid, setShowGrid] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [showDevMenu, setShowDevMenu] = useState(false);
  const { x, y } = position;
  const { width, height } = dimensions;
  const { tiles, tileSize, background } = tileData;

  // Prepare data for FlatList
  const rowData = useMemo(() => {
    return tiles.map((row, index) => ({
      rowIndex: index,
      tiles: row,
      startCol: 0,
      endCol: row.length,
      tileSize,
      onImageLoad,
      zIndex: objectZIndex,
    }));
  }, [tiles, tileSize, onImageLoad, objectZIndex]);

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

  return (
    <>
      {/* Main game container */}
      <View
        style={[
          styles.container,
          {
            width,
            height,
            left: x,
            top: y,
          },
        ]}
        testID="map-container"
      >
        <RNImage source={background} style={[styles.background, { width, height }]} onLoadEnd={() => onImageLoad?.("background")} testID="map-background" />

        {/* Game content container */}
        <View style={[styles.contentContainer, { width, height }]}>
          {/* Ground and tree tiles */}
          <View style={[styles.list, { zIndex: objectZIndex ?? Z_INDEX.OBJECT }]}>
            <FlatList data={rowData} renderItem={renderItem} keyExtractor={keyExtractor} showsVerticalScrollIndicator={false} scrollEnabled={false} initialNumToRender={tiles.length} />
          </View>

          {/* Objects layer (includes cabins) */}
          <View style={[styles.objectsLayer, { zIndex: objectZIndex }]}>
            {cabinTiles.map(({ row, col }) => (
              <View
                key={`cabin-${row}-${col}`}
                style={{
                  position: "absolute",
                  left: col * tileSize,
                  top: row * tileSize,
                  width: tileSize,
                  height: tileSize,
                  zIndex: objectZIndex,
                }}
              >
                <CabinTile tile={Tile.Cabin} tileSize={tileSize} onImageLoad={onImageLoad} zIndex={objectZIndex} />
              </View>
            ))}
          </View>

          {/* Debug overlays */}
          {showGrid && <GridOverlay tileSize={tileSize} width={width} height={height} />}
          {showDebug && debug?.showDebug && (
            <View style={StyleSheet.absoluteFill}>
              <DebugRenderer boxes={debug.boxes} />
            </View>
          )}
        </View>
      </View>

      {/* Dev controls - kept outside game container */}
      <View style={[styles.devControls, { zIndex: 4000 }]}>
        <TouchableOpacity style={styles.devButton} onPress={() => setShowDevMenu(true)}>
          <Text style={styles.devButtonText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <DevMenu
        isVisible={showDevMenu}
        onClose={() => setShowDevMenu(false)}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(!showGrid)}
        showDebug={showDebug}
        onToggleDebug={() => setShowDebug(!showDebug)}
        debugBoxCount={(debug?.boxes || []).length}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
  },
  background: {
    position: "absolute",
  },
  contentContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    overflow: "visible",
  },
  list: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  objectsLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "visible",
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
    width: "100%",
    height: "100%",
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
  gridOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  gridLine: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    height: 1,
    width: 1,
  },
});
