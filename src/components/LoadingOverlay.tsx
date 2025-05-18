import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, Animated } from "react-native";
import { Text } from "./Text";

interface LoadingOverlayProps {
  totalAssets: number;
  loadedAssets: number;
  onAllLoaded?: () => void;
}

export const createLoadingHandler = (totalAssets: number) => {
  let loadedCount = 0;
  const subscribers = new Set<() => void>();
  const loadedAssets = new Set<string>();

  console.log(`[LoadingHandler] Created with ${totalAssets} total assets`);

  const notifySubscribers = () => {
    const progress = (loadedCount / totalAssets) * 100;
    console.log(`[LoadingHandler] Notifying subscribers: ${loadedCount}/${totalAssets} (${progress.toFixed(1)}%)`);
    subscribers.forEach((subscriber) => subscriber());
  };

  return {
    handleImageLoad: (assetId?: string) => {
      // If no assetId provided, generate one based on the stack trace
      const id = assetId || new Error().stack?.split("\n")[2] || String(Math.random());

      // Only count each asset once
      if (!loadedAssets.has(id)) {
        loadedAssets.add(id);
        loadedCount = Math.min(loadedCount + 1, totalAssets);
        console.log(`[LoadingHandler] Image loaded (${loadedCount}/${totalAssets}) - ${id}`);
        notifySubscribers();
      }
    },
    subscribe: (callback: () => void) => {
      subscribers.add(callback);
      callback(); // Notify immediately of current state
      return () => subscribers.delete(callback);
    },
    getProgress: () => loadedCount,
    getTotalAssets: () => totalAssets,
  };
};

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ totalAssets, loadedAssets, onAllLoaded }) => {
  const [fadeAnim] = useState(new Animated.Value(1));
  const [dots, setDots] = useState("");
  const progressAnim = useRef(new Animated.Value(0)).current;
  const percentage = Math.min((loadedAssets / totalAssets) * 100, 100);

  // Update progress animation whenever loadedAssets changes
  useEffect(() => {
    console.log(`[LoadingOverlay] Progress: ${loadedAssets}/${totalAssets} (${percentage.toFixed(1)}%)`);

    Animated.spring(progressAnim, {
      toValue: percentage / 100,
      useNativeDriver: false,
      tension: 20,
      friction: 7,
    }).start();

    if (loadedAssets === totalAssets) {
      console.log("[LoadingOverlay] All assets loaded!");
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        onAllLoaded?.();
      });
    }
  }, [loadedAssets, totalAssets, onAllLoaded, fadeAnim, progressAnim, percentage]);

  // Animate loading dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  if (loadedAssets === totalAssets) {
    return null;
  }

  const progressBarWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <Text style={styles.text}>Loading{dots}</Text>
      <View style={styles.progressBarContainer}>
        <Animated.View style={[styles.progressBar, { width: progressBarWidth }]} />
      </View>
      <Text style={styles.progress}>{percentage.toFixed(1)}%</Text>
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
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  text: {
    color: "white",
    fontSize: 24,
    marginBottom: 16,
  },
  progress: {
    color: "white",
    fontSize: 18,
    marginTop: 8,
  },
  progressBarContainer: {
    width: "60%",
    height: 8,
    backgroundColor: "#333",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 4,
  },
});
