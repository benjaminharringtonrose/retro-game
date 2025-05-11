import React from "react";
import { View, StyleSheet } from "react-native";

interface PlayerProps {
  size?: number;
  x?: number;
  y?: number;
}

const Player: React.FC<PlayerProps> = ({ size = 30 }) => {
  return (
    <View style={[styles.player, { width: size, height: size }]}>
      <View style={styles.playerBody} />
      <View style={styles.playerHead} />
    </View>
  );
};

const styles = StyleSheet.create({
  player: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  playerBody: {
    width: "70%",
    height: "70%",
    backgroundColor: "#59bf40", // Green for Link-like character
    borderRadius: 4,
    zIndex: 1,
  },
  playerHead: {
    position: "absolute",
    top: 0,
    width: "50%",
    height: "50%",
    backgroundColor: "#ffdbac", // Skin tone
    borderRadius: 5,
    zIndex: 2,
  },
});

export default Player;
