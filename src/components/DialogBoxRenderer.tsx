import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Dimensions, Animated, TouchableOpacity } from "react-native";
import { DialogProps } from "../types";

const { width: screenWidth } = Dimensions.get("window");

export const DialogBoxRenderer: React.FC<DialogProps> = ({ isVisible, message, onClose }) => {
  const arrowOpacity = useRef(new Animated.Value(1)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    const animate = () => {
      animationRef.current = Animated.sequence([
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
      ]);

      animationRef.current.start(() => {
        if (animationRef.current) {
          animate();
        }
      });
    };

    if (isVisible) {
      animate();
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
    };
  }, [isVisible]);

  const handleClose = () => {
    console.log("Dialog close button pressed");
    if (onClose) {
      onClose();
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.box}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>
        <Text style={styles.text}>{message}</Text>
        <Animated.View style={[styles.arrow, { opacity: arrowOpacity }]}>
          <Text style={styles.arrowText}>▼</Text>
        </Animated.View>
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
  closeButton: {
    position: "absolute",
    top: 0,
    right: 5,
    zIndex: 3001,
  },
  closeButtonText: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
  },
});
