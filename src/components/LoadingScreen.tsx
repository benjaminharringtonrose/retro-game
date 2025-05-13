import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, Animated } from "react-native";

const LOADING_FRAMES = ["", ".", "..", "..."];
const FRAME_DURATION = 400; // ms per frame

export const LoadingScreen = () => {
  const [loadingFrame, setLoadingFrame] = useState(0);
  const [spriteFrame, setSpriteFrame] = useState(0);
  const blinkAnim = new Animated.Value(1);

  // Animate the "PRESS START" text
  useEffect(() => {
    const blink = Animated.sequence([
      Animated.timing(blinkAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(blinkAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]);

    Animated.loop(blink).start();
  }, []);

  // Animate the loading dots
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingFrame((prev) => (prev + 1) % LOADING_FRAMES.length);
    }, FRAME_DURATION);

    return () => clearInterval(interval);
  }, []);

  // Animate the character sprite
  useEffect(() => {
    const interval = setInterval(() => {
      setSpriteFrame((prev) => (prev + 1) % 3);
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.spriteContainer}>
          <View style={styles.pixelArtCharacter} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.text}>{"NOW LOADING" + LOADING_FRAMES[loadingFrame]}</Text>
          <Animated.Text style={[styles.pressStart, { opacity: blinkAnim }]}>PRESS START</Animated.Text>
        </View>
      </View>
      <Text style={styles.pixelBorder}>████████████████████████████████</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  spriteContainer: {
    width: 32,
    height: 40,
    overflow: "hidden",
    marginBottom: 40,
    transform: [{ scale: 3 }],
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  pixelArtCharacter: {
    width: 16,
    height: 24,
    backgroundColor: "#ffffff",
    borderStyle: "solid",
    borderWidth: 2,
    borderColor: "#000000",
    borderRadius: 2,
  },
  textContainer: {
    alignItems: "center",
    backgroundColor: "#000",
    padding: 20,
    borderWidth: 2,
    borderColor: "#ffffff",
    minWidth: 280,
  },
  text: {
    fontFamily: "PressStart2P",
    color: "#ffffff",
    fontSize: 16,
    letterSpacing: 1,
    marginBottom: 20,
    textAlign: "center",
  },
  pressStart: {
    fontFamily: "PressStart2P",
    color: "#ffffff",
    fontSize: 12,
    letterSpacing: 1,
    textAlign: "center",
  },
  pixelBorder: {
    color: "#ffffff",
    fontSize: 8,
    letterSpacing: -1,
    position: "absolute",
    bottom: 40,
  },
});
