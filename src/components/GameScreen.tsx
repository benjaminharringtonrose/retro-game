import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

const GameScreen: React.FC = () => {
  // Initialize state for the player's position
  const [playerPos, setPlayerPos] = useState({ x: width / 2, y: height / 2 });

  // Use shared values to animate player position
  const playerX = useSharedValue(playerPos.x);
  const playerY = useSharedValue(playerPos.y);

  useEffect(() => {
    // Sync the shared values with the player's position state
    playerX.value = withTiming(playerPos.x);
    playerY.value = withTiming(playerPos.y);
  }, [playerPos]);

  const playerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withTiming(playerX.value, {
          duration: 200,
        }),
      },
      {
        translateY: withTiming(playerY.value, {
          duration: 200,
        }),
      },
    ],
  }));

  const movePlayer = (dx: number, dy: number) => {
    // Update player position, ensuring the player stays within bounds
    setPlayerPos((prevPos) => ({
      x: Math.max(0, Math.min(width, prevPos.x + dx)),
      y: Math.max(0, Math.min(height, prevPos.y + dy)),
    }));
  };

  return (
    <View style={styles.container}>
      {/* Placeholder Background */}
      <View style={[styles.background, { backgroundColor: "#7ACF7D" }]}></View>

      {/* Animated Player Placeholder */}
      <Animated.View
        style={[styles.player, playerStyle, { backgroundColor: "red" }]}
      ></Animated.View>

      {/* Movement Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          onPress={() => movePlayer(0, -50)}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Up</Text>
        </TouchableOpacity>
        <View style={styles.horizontalControls}>
          <TouchableOpacity
            onPress={() => movePlayer(-50, 0)}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Left</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => movePlayer(50, 0)}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Right</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => movePlayer(0, 50)}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Down</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  player: {
    position: "absolute",
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  controls: {
    position: "absolute",
    bottom: 50,
    alignItems: "center",
  },
  horizontalControls: {
    flexDirection: "row",
  },
  button: {
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 10,
    margin: 5,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
});

export default GameScreen;
