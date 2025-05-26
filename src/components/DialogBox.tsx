import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Dimensions, Animated } from "react-native";
import { logger } from "../utils/logger";

interface DialogBoxProps {
  message: string;
  isVisible: boolean;
}

const { width: screenWidth } = Dimensions.get("window");

export const DialogBox: React.FC<DialogBoxProps> = ({ message, isVisible }) => {
  logger.log("Dialog", "[DialogBox] Props received:", { message, isVisible });

  if (!isVisible) {
    logger.log("Dialog", "[DialogBox] Not rendering - isVisible is false");
    return null;
  }

  logger.log("Dialog", "[DialogBox] Rendering dialog box");
  const arrowOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(arrowOpacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(arrowOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => animate());
    };

    animate();
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.debugOutline}>
        <View style={styles.box}>
          <Text style={styles.text}>{message}</Text>
          <Animated.View style={[styles.arrow, { opacity: arrowOpacity }]}>
            <Text style={styles.arrowText}>▼</Text>
          </Animated.View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 3000,
  },
  debugOutline: {
    borderWidth: 1,
    borderColor: "#ff0000",
    padding: 1,
  },
  box: {
    width: screenWidth * 0.6,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    borderWidth: 3,
    borderColor: "#ffffff",
    padding: 20,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  text: {
    color: "#ffffff",
    fontSize: 18,
    lineHeight: 28,
    fontFamily: "PressStart2P",
    textAlign: "center",
  },
  arrow: {
    position: "absolute",
    bottom: 5,
    right: 10,
  },
  arrowText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
