import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, Image as RNImage, Text } from "react-native";
import { PortalEntity } from "../types";
import { PORTAL_CONFIGS } from "../config/portals";

// Set to true to show debug info about the portal
const SHOW_PORTAL_DEBUG = true;

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

  // Get portal config
  const config = PORTAL_CONFIGS[id];
  if (!config) {
    console.error(`No configuration found for Portal: ${id}`);
    return null;
  }

  // Animation state
  const [currentFrame, setCurrentFrame] = useState(0);
  const animationTimer = useRef<NodeJS.Timeout | null>(null);
  const FRAME_COUNT = config.animation?.frameCount || 3; // Number of frames in the sprite sheet
  const FRAME_RATE = config.animation?.frameRate || 200; // Time in ms between frame changes

  // Set up animation
  useEffect(() => {
    // Start animation timer
    if (isActive) {
      animationTimer.current = setInterval(() => {
        setCurrentFrame((prev) => (prev + 1) % FRAME_COUNT);
      }, FRAME_RATE);
    }

    // Clean up timer when component unmounts or becomes inactive
    return () => {
      if (animationTimer.current) {
        clearInterval(animationTimer.current);
        animationTimer.current = null;
      }
    };
  }, [isActive, FRAME_COUNT, FRAME_RATE]);

  // Log position when the component mounts or position changes
  useEffect(() => {
    console.log(`[Portal] Rendering portal ${id} at (${x}, ${y}) with active=${isActive}, frame=${currentFrame}`);
  }, [id, x, y, isActive, currentFrame]);

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
      {SHOW_PORTAL_DEBUG && (
        <View
          style={{
            position: "absolute",
            width: portal.triggerDistance * 2,
            height: portal.triggerDistance * 2,
            borderRadius: portal.triggerDistance,
            backgroundColor: "rgba(255, 0, 255, 0.2)",
            borderWidth: 1,
            borderColor: "rgba(255, 0, 255, 0.5)",
            left: -portal.triggerDistance + width / 2,
            top: -portal.triggerDistance + height / 2,
            zIndex: 5,
          }}
        />
      )}
      <View style={styles.spriteContainer}>
        <RNImage
          source={config.sprite}
          style={[
            styles.sprite,
            {
              width: width * FRAME_COUNT, // Full width of sprite sheet
              height: height,
              transform: [
                { translateX: -currentFrame * width }, // Shift to show current frame
              ],
            },
          ]}
          onError={(error) => {
            console.error(`[Portal] Failed to load sprite for ${id}:`, error);
          }}
        />
      </View>
      {SHOW_PORTAL_DEBUG && <Text style={styles.debugText}>{id}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50, // Below NPCs (1000) but above regular terrain
  },
  spriteContainer: {
    width: "100%",
    height: "100%",
    overflow: "hidden",
    position: "absolute",
  },
  sprite: {
    position: "absolute",
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
