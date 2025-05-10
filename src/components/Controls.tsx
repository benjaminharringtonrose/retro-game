import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

const Controls = () => {
  return (
    <View style={styles.controls}>
      <View style={styles.dpad}>
        <TouchableOpacity
          style={styles.button}
          onPressIn={(e) => ({ type: "press", event: e.nativeEvent })}
        >
          <Text>↑</Text>
        </TouchableOpacity>
        <View style={styles.horizontal}>
          <TouchableOpacity
            style={styles.button}
            onPressIn={(e) => ({ type: "press", event: e.nativeEvent })}
          >
            <Text>←</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPressIn={(e) => ({ type: "press", event: e.nativeEvent })}
          >
            <Text>→</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.button}
          onPressIn={(e) => ({ type: "press", event: e.nativeEvent })}
        >
          <Text>↓</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.interact}
        onPressIn={(e) => ({ type: "press", event: e.nativeEvent })}
      >
        <Text>A</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  controls: {
    position: "absolute",
    bottom: 20,
    right: 20,
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
    padding: 10,
    margin: 5,
    borderWidth: 2,
    borderColor: "#0f380f",
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  interact: {
    backgroundColor: "#8bac0f",
    padding: 15,
    margin: 5,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#0f380f",
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Controls;
