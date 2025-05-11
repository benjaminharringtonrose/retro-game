import React from "react";
import { View, StyleSheet } from "react-native";

interface TreasureProps {
  size?: number;
  x?: number;
  y?: number;
  collected?: boolean;
}

const Treasure: React.FC<TreasureProps> = ({
  size = 20,
  collected = false,
}) => {
  if (collected) return null;

  return (
    <View style={[styles.treasure, { width: size, height: size }]}>
      <View style={styles.treasureInner} />
    </View>
  );
};

const styles = StyleSheet.create({
  treasure: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffd700", // Gold
    borderRadius: 10,
  },
  treasureInner: {
    width: "50%",
    height: "50%",
    backgroundColor: "#ffaa00",
    borderRadius: 5,
  },
});

export default Treasure;
