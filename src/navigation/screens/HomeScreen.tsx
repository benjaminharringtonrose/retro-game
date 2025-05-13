import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from "react-native";

export interface HomeScreenProps {
  onStart: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onStart }) => {
  const { width, height } = useWindowDimensions();
  return (
    <View style={[styles.container, { width, height }]}>
      <Text style={styles.title}>THE LEGEND OF MY GAME</Text>
      <TouchableOpacity style={styles.button} onPress={onStart}>
        <Text style={styles.buttonText}>CONTINUE</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={onStart}>
        <Text style={styles.buttonText}>START NEW</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: "PressStart2P",
    color: "#fff",
    fontSize: 32,
    marginBottom: 40,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#444",
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginVertical: 8,
    borderRadius: 4,
  },
  buttonText: {
    fontFamily: "PressStart2P",
    color: "#fff",
    fontSize: 18,
    textTransform: "uppercase",
  },
});
