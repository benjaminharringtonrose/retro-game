import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, Pressable, useWindowDimensions } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming, withDelay, Easing, withSpring, runOnJS, interpolate } from "react-native-reanimated";

const LOADING_FRAMES = ["", ".", "..", "..."];
const FRAME_DURATION = 250; // Faster animation

interface LoadingScreenProps {
  isLoaded?: boolean;
  onStart?: () => void;
}

export const LoadingScreen = ({ isLoaded = false, onStart }: LoadingScreenProps) => {
  const { width: screenWidth } = useWindowDimensions();
  const [loadingFrame, setLoadingFrame] = useState(0);
  const [canStart, setCanStart] = useState(false);
  const [showLoadingBar, setShowLoadingBar] = useState(true);
  const opacity = useSharedValue(1);
  const blinkOpacity = useSharedValue(1);
  const pressScale = useSharedValue(1);
  const barScale = useSharedValue(1);
  const progress = useSharedValue(0);
  const [progressText, setProgressText] = useState("0");

  // Animate loading progress
  useEffect(() => {
    progress.value = 0;
    if (isLoaded) {
      progress.value = withTiming(
        100,
        {
          duration: 500,
          easing: Easing.out(Easing.ease),
        },
        () => {
          barScale.value = withSequence(
            withTiming(1.1, { duration: 200, easing: Easing.out(Easing.ease) }),
            withTiming(1, { duration: 200, easing: Easing.in(Easing.ease) }),
            withDelay(
              200,
              withTiming(
                0,
                {
                  duration: 300,
                  easing: Easing.inOut(Easing.ease),
                },
                () => {
                  runOnJS(setShowLoadingBar)(false);
                }
              )
            )
          );
        }
      );
    } else {
      progress.value = withTiming(
        99,
        {
          duration: 8000,
          easing: Easing.bezier(0.1, 0.1, 0.25, 1),
        },
        (finished) => {
          if (finished) {
            runOnJS(setProgressText)("99");
          }
        }
      );
    }
  }, [isLoaded]);

  // Add delay after loading completes
  useEffect(() => {
    if (isLoaded) {
      const timer = setTimeout(() => {
        setCanStart(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanStart(false);
    }
  }, [isLoaded]);

  // Animate the loading dots
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingFrame((prev) => (prev + 1) % LOADING_FRAMES.length);
    }, FRAME_DURATION);

    return () => clearInterval(interval);
  }, []);

  // Blink animation for "PRESS START"
  useEffect(() => {
    if (!canStart) {
      blinkOpacity.value = 1;
      return;
    }

    blinkOpacity.value = withRepeat(
      withSequence(
        withTiming(0.4, {
          duration: 500,
          easing: Easing.inOut(Easing.ease),
        }),
        withDelay(
          100,
          withTiming(1, {
            duration: 500,
            easing: Easing.inOut(Easing.ease),
          })
        )
      ),
      -1,
      true
    );
  }, [canStart]);

  const handleStart = () => {
    if (!canStart || !onStart) return;

    // Start fade out animation
    opacity.value = withTiming(
      0,
      {
        duration: 500,
        easing: Easing.inOut(Easing.ease),
      },
      () => {
        runOnJS(onStart)();
      }
    );
  };

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const blinkStyle = useAnimatedStyle(() => ({
    opacity: blinkOpacity.value,
    transform: [{ scale: pressScale.value }],
  }));

  const barAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: barScale.value }],
    opacity: barScale.value,
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => {
    runOnJS(setProgressText)(Math.round(progress.value).toString());
    return {
      width: `${progress.value}%`,
    };
  });

  const handlePressIn = () => {
    if (!canStart) return;
    pressScale.value = withSpring(0.95, {
      damping: 15,
      stiffness: 400,
    });
  };

  const handlePressOut = () => {
    if (!canStart) return;
    pressScale.value = withSpring(1, {
      damping: 15,
      stiffness: 400,
    });
  };

  return (
    <Animated.View style={[styles.overlay, overlayStyle]}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.textContainer}>
            <Text style={styles.text}>{canStart ? "READY!" : "NOW LOADING" + LOADING_FRAMES[loadingFrame]}</Text>
            <Pressable onPress={handleStart} onPressIn={handlePressIn} onPressOut={handlePressOut} disabled={!canStart}>
              <Animated.Text style={[styles.pressStart, blinkStyle, !canStart && styles.pressStartDisabled, canStart && styles.pressStartReady]}>PRESS START</Animated.Text>
            </Pressable>
          </View>
        </View>
        {showLoadingBar && (
          <Animated.View style={[styles.loadingBarContainer, barAnimatedStyle]}>
            <View style={styles.loadingBarBackground}>
              <Animated.View style={[styles.loadingBarFill, progressAnimatedStyle]} />
            </View>
            <Text style={styles.loadingPercent}>{progressText}%</Text>
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    zIndex: 9999,
    elevation: 9999,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  textContainer: {
    alignItems: "center",
    backgroundColor: "#000",
    padding: 20,
    borderWidth: 2,
    borderColor: "#ffffff",
    minWidth: 300,
    transform: [{ translateY: -40 }],
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
    padding: 10,
  },
  pressStartDisabled: {
    opacity: 0.5,
  },
  pressStartReady: {
    borderWidth: 2,
    borderColor: "#ffffff",
    borderRadius: 4,
  },
  loadingBarContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingBarBackground: {
    width: "100%",
    height: 20,
    backgroundColor: "#1a1a1a", // Darker gray that complements the retro green
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#333333",
  },
  loadingBarFill: {
    height: "100%",
    backgroundColor: "#00ff00", // Classic retro green
  },
  loadingPercent: {
    fontFamily: "PressStart2P",
    color: "#ffffff",
    fontSize: 10,
    marginTop: 10,
  },
});
