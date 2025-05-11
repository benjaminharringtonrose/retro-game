import React from "react";
import { View, StyleSheet } from "react-native";

interface EnemyProps {
  size?: number;
  x?: number;
  y?: number;
}

const Enemy: React.FC<EnemyProps> = ({ size = 30 }) => {
  return <View style={[styles.enemy, { width: size, height: size }]} />;
};

const styles = StyleSheet.create({
  enemy: {
    position: "absolute",
    backgroundColor: "#e74c3c",
    borderRadius: 6,
  },
});

export default Enemy;
