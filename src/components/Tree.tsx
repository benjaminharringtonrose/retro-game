import React from "react";
import { View, StyleSheet } from "react-native";

interface TreeProps {
  size?: number;
  x?: number;
  y?: number;
}

const Tree: React.FC<TreeProps> = ({ size = 40 }) => {
  return (
    <View style={[styles.tree, { width: size, height: size }]}>
      <View style={styles.trunk} />
      <View style={styles.leaves} />
    </View>
  );
};

const styles = StyleSheet.create({
  tree: {
    position: "absolute",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  trunk: {
    width: "30%",
    height: "40%",
    backgroundColor: "#8B4513", // Brown trunk
    zIndex: 1,
  },
  leaves: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: "70%",
    backgroundColor: "#2e7d32", // Dark green leaves
    borderRadius: 12,
    zIndex: 2,
  },
});

export default Tree;
