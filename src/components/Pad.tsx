import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Direction } from "../types";

interface PadProps {
  onDirectionChange: (direction: Direction | null) => void;
}

export const Pad: React.FC<PadProps> = ({ onDirectionChange }) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity style={[styles.button, styles.up]} onPressIn={() => onDirectionChange(Direction.Up)} onPressOut={() => onDirectionChange(null)} />
      </View>
      <View style={styles.row}>
        <TouchableOpacity style={[styles.button, styles.left]} onPressIn={() => onDirectionChange(Direction.Left)} onPressOut={() => onDirectionChange(null)} />
        <View style={styles.center} />
        <TouchableOpacity style={[styles.button, styles.right]} onPressIn={() => onDirectionChange(Direction.Right)} onPressOut={() => onDirectionChange(null)} />
      </View>
      <View style={styles.row}>
        <TouchableOpacity style={[styles.button, styles.down]} onPressIn={() => onDirectionChange(Direction.Down)} onPressOut={() => onDirectionChange(null)} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 40,
    left: 40,
    width: 150,
    height: 150,
  },
  row: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
  },
  button: {
    width: 50,
    height: 50,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 25,
    margin: 5,
  },
  center: {
    width: 50,
    height: 50,
    margin: 5,
  },
  up: {
    borderTopWidth: 4,
    borderTopColor: "white",
  },
  down: {
    borderBottomWidth: 4,
    borderBottomColor: "white",
  },
  left: {
    borderLeftWidth: 4,
    borderLeftColor: "white",
  },
  right: {
    borderRightWidth: 4,
    borderRightColor: "white",
  },
});
