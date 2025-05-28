import { View, StyleSheet } from "react-native";
import { getTileColor } from "../utils/map";
import { memo } from "react";

export const GroundTile: React.FC<{ tile: number; tileSize: number }> = ({ tile, tileSize }) => {
  return (
    <View
      style={[
        styles.tile,
        {
          width: tileSize,
          height: tileSize,
        },
      ]}
    >
      <View style={styles.tileOverlay} />
    </View>
  );
};

const styles = StyleSheet.create({
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
  },
});
