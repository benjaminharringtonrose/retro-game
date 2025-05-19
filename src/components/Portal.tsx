import React, { useEffect } from "react";
import { StyleSheet, View, Image, Text } from "react-native";
import { PortalEntity } from "../types";
import { PORTAL_CONFIGS } from "../config/portals";

interface PortalProps {
  id: string;
  position: {
    x: number;
    y: number;
  };
  dimensions: {
    width: number;
    height: number;
  };
  portal: {
    isActive: boolean;
    triggerDistance: number;
  };
}

export const Portal: React.FC<PortalProps> = ({ id, position, dimensions, portal }) => {
  const { x, y } = position;
  const { width, height } = dimensions;
  const { isActive } = portal;

  // Log position when the component mounts or position changes
  useEffect(() => {
    console.log(`[Portal] Rendering portal ${id} at (${x}, ${y}) with active=${isActive}`);
  }, [id, x, y, isActive]);

  // Get portal config
  const config = PORTAL_CONFIGS[id];
  if (!config) {
    console.error(`No configuration found for Portal: ${id}`);
    return null;
  }

  // Skip rendering inactive portals
  if (!isActive) {
    return null;
  }

  // If there's no sprite defined, just render a placeholder
  if (!config.sprite) {
    return (
      <View
        style={[
          styles.container,
          {
            position: "absolute",
            left: x,
            top: y,
            width,
            height,
            backgroundColor: "rgba(100, 100, 255, 0.7)", // Semi-transparent blue
          },
        ]}
        testID={`portal-${id}`}
      >
        <Text style={styles.debugText}>{id}</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          position: "absolute",
          left: x,
          top: y,
          width,
          height,
        },
      ]}
      testID={`portal-${id}`}
    >
      <Image
        source={config.sprite}
        style={[
          styles.sprite,
          {
            width,
            height,
          },
        ]}
        onError={(error) => {
          console.error(`[Portal] Failed to load sprite for ${id}:`, error);
        }}
      />
      <Text style={styles.debugText}>{id}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50, // Below NPCs (1000) but above regular terrain
    borderWidth: 3,
    borderColor: "#ff00ff",
    backgroundColor: "rgba(0, 0, 255, 0.3)",
  },
  sprite: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  debugText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 2,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});
