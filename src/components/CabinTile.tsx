import { useState } from "react";
import { Tile } from "../types/enums";
import { logger } from "../utils/logger";
import { View, Image, StyleSheet } from "react-native";

export const CABIN_SCALE = 3.5;
const CABIN = require("../assets/cabin.png");

export const CabinTile: React.FC<{
  tile: number;
  tileSize: number;
  onImageLoad?: (assetId?: string) => void;
  zIndex?: number;
}> = ({ tile, tileSize, onImageLoad, zIndex = 250 }) => {
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
        styles.container,
        {
          width: tileSize,
          height: tileSize,
          position: "absolute",
          zIndex,
        },
      ]}
    >
      <Image
        source={CABIN}
        style={[
          styles.image,
          {
            width: scaledSize,
            height: scaledSize,
            position: "absolute",
            left: -offset,
            bottom: 0,
            zIndex,
          },
        ]}
        resizeMode="contain"
        onLoadEnd={handleLoadEnd}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    overflow: "visible",
  },
  image: {
    position: "absolute",
  },
});
