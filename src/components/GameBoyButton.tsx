// components/GameBoyButton.tsx
import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from "react-native";

export interface GameBoyButtonProps {
  onPressIn: () => void;
  onPressOut: () => void;
  label: string;
  style?: ViewStyle;
}

export const GameBoyButton: React.FC<GameBoyButtonProps> = ({
  onPressIn,
  onPressOut,
  label,
  style,
}) => (
  <TouchableOpacity
    activeOpacity={0.6}
    onPressIn={onPressIn}
    onPressOut={onPressOut}
    style={[styles.btn, style]}
  >
    <Text style={styles.lbl}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  btn: {
    width: 50,
    height: 50,
    backgroundColor: "#555",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  lbl: {
    color: "#fff",
    fontSize: 18,
  },
});
