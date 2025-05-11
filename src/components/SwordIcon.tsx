import React from "react";
import { View, StyleSheet } from "react-native";

interface SwordIconProps {
  size?: number;
  color?: string;
}

const SwordIcon: React.FC<SwordIconProps> = ({
  size = 24,
  color = "white",
}) => {
  const bladeWidth = size * 0.2;
  const bladeHeight = size * 0.7;
  const handleWidth = size * 0.4;
  const handleHeight = size * 0.3;

  return (
    <View style={[styles.swordContainer, { width: size, height: size }]}>
      {/* Blade */}
      <View
        style={[
          styles.blade,
          {
            backgroundColor: color,
            width: bladeWidth,
            height: bladeHeight,
          },
        ]}
      />

      {/* Guard */}
      <View
        style={[
          styles.guard,
          {
            backgroundColor: "#ffd700",
            width: handleWidth,
            height: bladeWidth,
            top: bladeHeight - bladeWidth / 2,
          },
        ]}
      />

      {/* Handle */}
      <View
        style={[
          styles.handle,
          {
            backgroundColor: "#8B4513",
            width: bladeWidth,
            height: handleHeight,
            top: bladeHeight,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  swordContainer: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  blade: {
    position: "absolute",
    top: 0,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  guard: {
    position: "absolute",
    borderRadius: 2,
  },
  handle: {
    position: "absolute",
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
});

export default SwordIcon;
