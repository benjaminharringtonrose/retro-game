import React from "react";
import { View, StyleSheet } from "react-native";

interface HeartIconProps {
  size?: number;
  color?: string;
}

const HeartIcon: React.FC<HeartIconProps> = ({ size = 24, color = "red" }) => {
  return (
    <View style={[styles.heartContainer, { width: size, height: size }]}>
      <View style={[styles.heartShape, { backgroundColor: color }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  heartContainer: {
    justifyContent: "center",
    alignItems: "center",
    margin: 2,
  },
  heartShape: {
    width: "80%",
    height: "80%",
    backgroundColor: "red",
    borderRadius: 5,
    transform: [{ rotate: "45deg" }],
  },
});

export default HeartIcon;
