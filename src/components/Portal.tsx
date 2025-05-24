import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, Image as RNImage, Text } from "react-native";
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
  debug?: {
    showDebug?: boolean;
    boxes: Array<{
      x: number;
      y: number;
      width: number;
      height: number;
      color: string;
    }>;
  };
}

export const Portal: React.FC<PortalProps> = ({ id, position, dimensions, portal, debug }) => {
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
      {debug?.showDebug && (
        <>
          {/* Trigger area visualization */}
          <View
            style={{
              position: "absolute",
              width: portal.triggerDistance * 2,
              height: portal.triggerDistance * 2,
              borderRadius: portal.triggerDistance,
              left: -portal.triggerDistance + width / 2,
              top: -portal.triggerDistance + height / 2,
              zIndex: 5,
            }}
          />
          {/* Portal hitbox visualization */}
          <View
            style={{
              position: "absolute",
              width: width,
              height: height,
              backgroundColor: "rgba(255, 255, 0, 0.2)",
              borderWidth: 1,
              borderColor: "rgba(255, 255, 0, 0.5)",
              zIndex: 6,
            }}
          />
          {/* Distance indicator */}
          <Text style={[styles.debugText, { top: -20 }]}>Trigger: {portal.triggerDistance}px</Text>
        </>
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
      {debug?.showDebug && <Text style={styles.debugText}>{id}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2750, // Above cabin (2500), below UI (3000+)
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
