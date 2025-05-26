import React, { useRef, useEffect, useState, useCallback } from "react";
import { StyleSheet, View, ActivityIndicator, Text } from "react-native";
import { GameEngine as RNGameEngine } from "react-native-game-engine";
import { setupGameEntities } from "../../engine/entities";
import { Systems } from "../../engine/systems";
import { Pad } from "../../components/Pad";
import { Direction } from "../../types/enums";
import { Entity } from "../../types/entities";
import { GameEngine, GameEvent } from "../../types/system";
import { useGameAssets } from "../../hooks/useAssets";
import { LoadingOverlay } from "../../components/LoadingOverlay";
import { logger } from "../../utils/logger";

interface GameEngineType extends RNGameEngine {
  dispatch: (event: any) => void;
  entities: { [key: string]: Entity };
}

declare global {
  interface Window {
    gameEngine: GameEngine | null;
  }
}

const GameScreen: React.FC = () => {
  const engineRef = useRef<GameEngineType>(null);
  const [gameRunning, setGameRunning] = useState(false);
  const [renderedAssets, setRenderedAssets] = useState(new Set<string>());
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);
  const [entities, setEntities] = useState<Record<string, Entity>>({});

  // Use our renamed game assets hook
  const { isLoaded: assetsLoaded, progress: loadingProgress, error: assetError } = useGameAssets();

  const onImageLoad = useCallback((assetId?: string) => {
    if (assetId) {
      logger.log("Game", `Image loaded: ${assetId}`);
      setRenderedAssets((prev) => {
        const newSet = new Set(prev);
        newSet.add(assetId);
        return newSet;
      });
    }
  }, []);

  // Initialize entities once assets are loaded
  useEffect(() => {
    if (assetsLoaded) {
      const gameEntities = setupGameEntities(onImageLoad);
      setEntities(gameEntities);
      logger.log("Game", "Entities initialized:", Object.keys(gameEntities));
    }
  }, [assetsLoaded, onImageLoad]);

  // Track when all assets are both loaded and rendered
  useEffect(() => {
    if (!assetsLoaded || Object.keys(entities).length === 0) return;

    // Get the total number of expected assets from the entities
    const expectedAssets = new Set<string>();
    Object.values(entities).forEach((entity) => {
      if ("assetId" in entity) {
        expectedAssets.add(entity.assetId as string);
      }
    });

    // Check if all expected assets are rendered
    const allAssetsRendered = Array.from(expectedAssets).every((assetId) => renderedAssets.has(assetId));

    if (allAssetsRendered) {
      logger.log("Game", "All assets rendered successfully");
      setIsFullyLoaded(true);
    }
  }, [assetsLoaded, renderedAssets, entities]);

  useEffect(() => {
    if (engineRef.current) {
      window.gameEngine = engineRef.current;
    }

    // Start game when everything is fully loaded
    if (isFullyLoaded && !gameRunning && Object.keys(entities).length > 0) {
      logger.log("Game", "Assets loaded and rendered, starting game");
      setGameRunning(true);
    }

    return () => {
      window.gameEngine = null;
    };
  }, [isFullyLoaded, gameRunning, entities]);

  const handleDirectionChange = useCallback(
    (direction: Direction | null) => {
      if (!engineRef.current) return;

      engineRef.current.dispatch({
        type: "move",
        payload: { direction },
      });
    },
    [engineRef]
  );

  const handleEvent = (event: GameEvent) => {
    logger.log("Game", "Game Event:", event);

    // Make sure we have access to entities
    if (!engineRef.current?.entities) return;

    const dialog = engineRef.current.entities["dialog-1"];

    if (event.type === "dialog-close") {
      if (dialog) {
        dialog.isVisible = false;
        dialog.message = "";
        dialog.inRange = false;
      }
    }
  };

  // Calculate loading progress
  const totalProgress = isFullyLoaded
    ? 100
    : Math.min(
        90, // Cap at 90% until fully rendered
        Math.floor((renderedAssets.size / (Object.keys(entities).length || 1)) * 90)
      );

  const shouldRenderGame = assetsLoaded && Object.keys(entities).length > 0;

  return (
    <View style={styles.container}>
      {shouldRenderGame && <RNGameEngine ref={engineRef} style={StyleSheet.absoluteFill} systems={Systems} entities={entities} running={gameRunning && isFullyLoaded} onEvent={handleEvent} />}
      {!isFullyLoaded && <LoadingOverlay totalAssets={100} loadedAssets={totalProgress} />}
      {isFullyLoaded && <Pad onDirectionChange={handleDirectionChange} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginTop: 20,
    fontSize: 18,
  },
  errorText: {
    color: "red",
    marginTop: 10,
    fontSize: 16,
    maxWidth: "80%",
    textAlign: "center",
  },
});

export default GameScreen;
