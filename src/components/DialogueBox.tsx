import React from "react";
import { StyleSheet, View, Text, Animated } from "react-native";

interface DialogueBoxProps {
  message: string;
  isVisible: boolean;
}

export const DialogueBox: React.FC<DialogueBoxProps> = ({ message, isVisible }) => {
  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.text}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: "center",
    zIndex: 1000,
  },
  box: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: 15,
    borderRadius: 10,
    maxWidth: "100%",
  },
  text: {
    color: "white",
    fontSize: 16,
    fontFamily: "PressStart2P",
  },
});
