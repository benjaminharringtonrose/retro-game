import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { scale } from "react-native-size-matters"; // Optional: for responsive sizing

interface ControlsProps {
  dispatch: (event: { type: string; control: string }) => void;
}

const Controls: React.FC<ControlsProps> = ({ dispatch }) => {
  const handlePress = (control: string) => {
    dispatch({ type: "press", control });
  };

  return (
    <View style={styles.controls}>
      <View style={styles.dpad}>
        <TouchableOpacity
          style={styles.button}
          onPressIn={() => handlePress("up")}
        >
          <Text>↑</Text>
        </TouchableOpacity>
        <View style={styles.horizontal}>
          <TouchableOpacity
            style={styles.button}
            onPressIn={() => handlePress("left")}
          >
            <Text>←</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPressIn={() => handlePress("right")}
          >
            <Text>→</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.button}
          onPressIn={() => handlePress("down")}
        >
          <Text>↓</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.interact}
        onPressIn={() => handlePress("interact")}
      >
        <Text>A</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  controls: {
    position: "absolute",
    bottom: scale(20),
    right: scale(20),
    flexDirection: "row",
  },
  dpad: {
    alignItems: "center",
  },
  horizontal: {
    flexDirection: "row",
  },
  button: {
    backgroundColor: "#8bac0f",
    padding: scale(10),
    margin: scale(5),
    borderWidth: 2,
    borderColor: "#0f380f",
    width: scale(40),
    height: scale(40),
    justifyContent: "center",
    alignItems: "center",
  },
  interact: {
    backgroundColor: "#8bac0f",
    padding: scale(15),
    margin: scale(5),
    borderRadius: scale(20),
    borderWidth: 2,
    borderColor: "#0f380f",
    width: scale(50),
    height: scale(50),
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Controls;
