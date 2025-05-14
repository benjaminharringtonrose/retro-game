import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface CollisionToggleButtonProps {
  isVisible: boolean;
  onToggle: () => void;
}

export const CollisionToggleButton: React.FC<CollisionToggleButtonProps> = ({ isVisible, onToggle }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onToggle} activeOpacity={0.7} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      <Text style={styles.text}>{isVisible ? "Hide" : "Show"} Collisions</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    bottom: 80,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 12,
    borderRadius: 8,
    zIndex: 3000,
    elevation: 3000,
  },
  text: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
});
