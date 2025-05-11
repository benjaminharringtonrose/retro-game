import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { MapRendererProps } from "../types";

const TILE_SIZE = 32;
const grass = require("../assets/grass.png");
const tree = require("../assets/tree.png");

const MapRenderer: React.FC<MapRendererProps> = ({ width, height, tiles }) => {
  return (
    <View style={styles.map}>
      {tiles.map((row, y) =>
        row.map((tile, x) => (
          <Image
            key={`${x}-${y}`}
            source={tile === 1 ? tree : grass}
            style={{
              position: "absolute",
              left: x * TILE_SIZE,
              top: y * TILE_SIZE,
              width: TILE_SIZE,
              height: TILE_SIZE,
            }}
          />
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    position: "absolute",
  },
});

export default MapRenderer;
