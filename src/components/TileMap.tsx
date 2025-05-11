import React, { memo } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Svg, { Image } from "react-native-svg";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface TileMapProps {
  map: number[][];
  tileSize: number;
  camera: { x: number; y: number };
}

const TileMap: React.FC<TileMapProps> = ({ map, tileSize, camera }) => {
  const mapWidth = map[0].length * tileSize;
  const mapHeight = map.length * tileSize;

  // Calculate visible tile range (basic frustum culling)
  const startX = Math.max(0, Math.floor(-camera.x / tileSize));
  const endX = Math.min(
    map[0].length,
    Math.ceil((-camera.x + SCREEN_WIDTH) / tileSize)
  );
  const startY = Math.max(0, Math.floor(-camera.y / tileSize));
  const endY = Math.min(
    map.length,
    Math.ceil((-camera.y + SCREEN_HEIGHT) / tileSize)
  );

  return (
    <View style={[styles.container, { left: camera.x, top: camera.y }]}>
      <Svg width={mapWidth} height={mapHeight}>
        {map
          .slice(startY, endY)
          .map((row, y) =>
            row
              .slice(startX, endX)
              .map((tile, x) => (
                <Image
                  key={`${startX + x}-${startY + y}`}
                  x={(startX + x) * tileSize}
                  y={(startY + y) * tileSize}
                  width={tileSize}
                  height={tileSize}
                  href={
                    tile === 0
                      ? require("../assets/sprites/newspaper.png")
                      : require("../assets/sprites/newspaper.png")
                  }
                  preserveAspectRatio="xMidYMid slice"
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

export default memo(TileMap);
