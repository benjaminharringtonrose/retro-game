import React from "react";
import { View, Text, StyleSheet, useWindowDimensions, Pressable } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming, withDelay, Easing, withSpring } from "react-native-reanimated";

export interface HomeScreenProps {
  onStart: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onStart }) => {
  const { width, height } = useWindowDimensions();
  const blinkOpacity = useSharedValue(1);
  const pressScale = useSharedValue(1);
  const titleScale = useSharedValue(0.95);

  // Initial title animation
  React.useEffect(() => {
    titleScale.value = withSpring(1, {
      damping: 15,
      stiffness: 90,
    });
  }, []);

  // Blink animation for buttons
  React.useEffect(() => {
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
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: titleScale.value }],
  }));

  const blinkStyle = useAnimatedStyle(() => ({
    opacity: blinkOpacity.value,
  }));

  const handlePressIn = () => {
    pressScale.value = withSpring(0.95, {
      damping: 15,
      stiffness: 400,
    });
  };

  const handlePressOut = () => {
    pressScale.value = withSpring(1, {
      damping: 15,
      stiffness: 400,
    });
  };

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  return (
    <View style={[styles.container, { width, height }]}>
      <View style={styles.content}>
        <Animated.View style={[styles.titleContainer, titleStyle]}>
          <Text style={styles.title}>THE LEGEND OF{"\n"}MY GAME</Text>
        </Animated.View>
        <View style={styles.buttonContainer}>
          <Animated.View style={[styles.buttonWrapper, buttonStyle]}>
            <Pressable style={styles.button} onPress={onStart} onPressIn={handlePressIn} onPressOut={handlePressOut}>
              <Animated.Text style={[styles.buttonText, blinkStyle]}>CONTINUE</Animated.Text>
            </Pressable>
          </Animated.View>
          <Animated.View style={[styles.buttonWrapper, buttonStyle]}>
            <Pressable style={styles.button} onPress={onStart} onPressIn={handlePressIn} onPressOut={handlePressOut}>
              <Animated.Text style={[styles.buttonText, blinkStyle]}>START NEW</Animated.Text>
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  titleContainer: {
    backgroundColor: "#000",
    padding: 30,
    borderWidth: 2,
    borderColor: "#ffffff",
    marginBottom: 40,
  },
  title: {
    fontFamily: "PressStart2P",
    color: "#ffffff",
    fontSize: 32,
    textAlign: "center",
    lineHeight: 48,
  },
  buttonContainer: {
    alignItems: "center",
    gap: 20,
  },
  buttonWrapper: {
    width: "100%",
  },
  button: {
    backgroundColor: "transparent",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: "#ffffff",
    borderRadius: 4,
    minWidth: 200,
  },
  buttonText: {
    fontFamily: "PressStart2P",
    color: "#ffffff",
    fontSize: 16,
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
