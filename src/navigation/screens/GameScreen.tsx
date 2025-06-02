import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { GameEngine as RNGameEngine } from "react-native-game-engine";
import { setupGameEntities } from "../../engine/entities";
import { Systems } from "../../engine/systems";
import { Entity } from "../../types/entities";
import { useGameAssets } from "../../hooks/useAssets";
import { LoadingOverlay } from "../../components/LoadingOverlay";
import { useAssetLoading } from "../../hooks/useAssetLoading";
import { useGameEngine } from "../../hooks/useGameEngine";
import { useMapTransition } from "../../hooks/useMapTransition";

const GameScreen: React.FC = () => {
  const [entities, setEntities] = useState<Record<string, Entity>>({});
  const { isLoaded: assetsLoaded } = useGameAssets();

  const { selectedMap, mapTransitionLoading, handleMapTransition, clearMapTransition } = useMapTransition();

  const { isFullyLoaded, totalProgress, onImageLoad, resetAssetLoading } = useAssetLoading({
    assetsLoaded,
    selectedMap,
    entities,
  });

  const { engineRef, gameRunning, handleEvent } = useGameEngine({
    isFullyLoaded,
    onMapTransition: (mapType) => {
      handleMapTransition(mapType);
      resetAssetLoading();
      const gameEntities = setupGameEntities(onImageLoad);
      setEntities(gameEntities);
    },
  });

  useEffect(() => {
    if (!assetsLoaded) return;
    const gameEntities = setupGameEntities(onImageLoad);
    setEntities(gameEntities);
  }, [assetsLoaded, onImageLoad]);

  useEffect(() => {
    if (isFullyLoaded) {
      clearMapTransition();
    }
  }, [isFullyLoaded, clearMapTransition]);

  const shouldRenderGame = assetsLoaded && Object.keys(entities).length > 0;

  return (
    <View style={styles.container}>
      {shouldRenderGame && <RNGameEngine ref={engineRef} style={StyleSheet.absoluteFill} systems={Systems} entities={entities} running={gameRunning && isFullyLoaded} onEvent={handleEvent} />}
      {(!isFullyLoaded || mapTransitionLoading) && <LoadingOverlay totalAssets={100} loadedAssets={totalProgress} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
});

export default GameScreen;
