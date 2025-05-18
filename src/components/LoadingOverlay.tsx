import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
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

  return {
    handleImageLoad: (assetId?: string) => {
      // If no assetId provided, generate one based on the stack trace
      const id = assetId || new Error().stack?.split("\n")[2] || String(Math.random());

      // Only count each asset once
      if (!loadedAssets.has(id)) {
        loadedAssets.add(id);
        loadedCount = Math.min(loadedCount + 1, totalAssets);
        console.log(`[LoadingHandler] Image loaded (${loadedCount}/${totalAssets}) - ${id}`);
        subscribers.forEach((callback) => callback());
      }
    },
    subscribe: (callback: () => void) => {
      subscribers.add(callback);
      return () => subscribers.delete(callback);
    },
    getProgress: () => loadedCount,
    getTotalAssets: () => totalAssets,
  };
};

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ totalAssets, loadedAssets, onAllLoaded }) => {
  useEffect(() => {
    console.log(`[LoadingOverlay] Progress: ${loadedAssets}/${totalAssets}`);

    if (loadedAssets === totalAssets) {
      console.log("[LoadingOverlay] All assets loaded!");
      onAllLoaded?.();
    }
  }, [loadedAssets, totalAssets, onAllLoaded]);

  if (loadedAssets === totalAssets) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <Text style={styles.text}>Loading...</Text>
      <Text style={styles.progress}>{Math.round((loadedAssets / totalAssets) * 100)}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
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
  },
});
