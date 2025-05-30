import { memo, useState } from "react";
import { Tile } from "../types/enums";
import { logger } from "../utils/logger";
import { View, Image, StyleSheet } from "react-native";

const TREE_SCALE = 1.5;
const TREE_1 = require("../assets/tree.png");
const TREE_2 = require("../assets/tree-2.png");

export const TreeTile: React.FC<{
  tile: number;
  tileSize: number;
  onImageLoad?: (assetId?: string) => void;
  zIndex?: number;
}> = ({ tile, tileSize, onImageLoad, zIndex }) => {
  const [hasLoaded, setHasLoaded] = useState(false);
  if (tile !== Tile.Tree && tile !== Tile.Tree2) return null;

  const treeSource = tile === Tile.Tree2 ? TREE_2 : TREE_1;
  const scaledSize = tileSize * TREE_SCALE;
  const assetId = tile === Tile.Tree2 ? "tree-2" : "tree-1";

  const handleLoadEnd = () => {
    if (!hasLoaded) {
      logger.log("Map", `Tree loaded: ${assetId}`);
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
          zIndex,
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
  tile: {
    position: "absolute",
    overflow: "visible",
  },
  tileImage: {
    position: "absolute",
  },
});
