import { useState } from "react";
import { Tile } from "../types/enums";
import { logger } from "../utils/logger";
import { View, Image, StyleSheet } from "react-native";

const FLOWER = require("../assets/flowers.png");

export const FlowerTile: React.FC<{ tile: number; tileSize: number; onImageLoad?: (assetId?: string) => void }> = ({ tile, tileSize, onImageLoad }) => {
  const [hasLoaded, setHasLoaded] = useState(false);
  if (tile !== Tile.Flower) return null;

  const handleLoadEnd = () => {
    if (!hasLoaded) {
      logger.log("Map", "Flower loaded");
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
        resizeMode="contain"
        onLoadEnd={handleLoadEnd}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  tile: {
    position: "absolute",
    overflow: "visible",
  },
  tileImage: {
    position: "absolute",
  },
});
