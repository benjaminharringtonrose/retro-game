import React from "react";
import { View, Pressable, StyleSheet } from "react-native";

interface DPadProps {
  onMove: (direction: string) => void;
}

const DPad: React.FC<DPadProps> = ({ onMove }) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Pressable style={styles.button} onPress={() => onMove("up")} />
      </View>
      <View style={styles.row}>
        <Pressable style={styles.button} onPress={() => onMove("left")} />
        <Pressable style={styles.button} onPress={() => onMove("right")} />
      </View>
      <View style={styles.row}>
        <Pressable style={styles.button} onPress={() => onMove("down")} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 40,
    left: 40,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    width: 60,
    height: 60,
    margin: 5,
    backgroundColor: "#444",
    borderRadius: 30,
  },
});

export default DPad;
