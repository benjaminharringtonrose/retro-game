// components/Map.tsx
import React from "react";
import { StyleSheet, View, ImageBackground } from "react-native";
import { Image } from "expo-image";
import { MapProps, Tile } from "../types";

const TREE_SCALE = 1.5; // Scale for tree sprites

export const Map: React.FC<MapProps> = ({ x, y, width, height, tileSize, tiles }) => {
  return (
    <View
      style={[
        styles.map,
        {
          transform: [{ translateX: x }, { translateY: y }],
          width,
          height,
          zIndex: 1, // Ensure map is below player
        },
      ]}
    >
      <ImageBackground source={require("../assets/forest-background.png")} style={styles.background} resizeMode="repeat">
        {tiles.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((tile, colIndex) => (
              <View
                key={`${rowIndex}-${colIndex}`}
                style={[
                  styles.tile,
                  {
                    width: tileSize,
                    height: tileSize,
                  },
                ]}
              >
                {tile === Tile.Tree && (
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
                )}
                <View
                  style={[
                    styles.tileOverlay,
                    {
                      backgroundColor: getTileColor(tile),
                    },
                  ]}
                />
              </View>
            ))}
          </View>
        ))}
      </ImageBackground>
    </View>
  );
};

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
  },
  background: {
    width: "100%",
    height: "100%",
  },
  row: {
    flexDirection: "row",
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
    zIndex: 1,
  },
});
