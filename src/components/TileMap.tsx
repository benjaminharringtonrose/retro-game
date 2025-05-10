import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Rect } from "react-native-svg";

interface TileMapProps {
  map: number[][];
  tileSize: number;
  camera: { x: number; y: number };
}

const TileMap: React.FC<TileMapProps> = ({ map, tileSize, camera }) => {
  const mapWidth = map[0].length * tileSize;
  const mapHeight = map.length * tileSize;

  return (
    <View style={[styles.container, { left: camera.x, top: camera.y }]}>
      <Svg width={mapWidth} height={mapHeight}>
        {map.map((row, y) =>
          row.map((tile, x) => (
            <Rect
              key={`${x}-${y}`}
              x={x * tileSize}
              y={y * tileSize}
              width={tileSize}
              height={tileSize}
              fill={tile === 0 ? "#306230" : "#8bac0f"} // Grass or path color
            />
          ))
        )}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
  },
});

export default TileMap;
