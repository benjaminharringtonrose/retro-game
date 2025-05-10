import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Game from "./components/Game";

const { width, height } = Dimensions.get("window");

const App = () => {
  return (
    <View style={styles.container}>
      <Game screenWidth={width} screenHeight={height} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#9bbc0f", // Game Boy greenscale background
  },
});

export default App;
