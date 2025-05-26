import { useState } from "react";
import { Tile } from "../types/enums";
import { logger } from "../utils/logger";
import { View, Image, StyleSheet } from "react-native";

const CABIN_SCALE = 3.5;
const CABIN = require("../assets/cabin.png");

export const CabinTile: React.FC<{ tile: number; tileSize: number; onImageLoad?: (assetId?: string) => void }> = ({ tile, tileSize, onImageLoad }) => {
  const [hasLoaded, setHasLoaded] = useState(false);
  if (tile !== Tile.Cabin) return null;

  const scaledSize = tileSize * CABIN_SCALE;
  const offset = (scaledSize - tileSize) / 2;

  const handleLoadEnd = () => {
    if (!hasLoaded) {
      logger.log("Map", "Cabin loaded");
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
