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

// Define expected asset types
const EXPECTED_ASSETS = ["tree-1", "tree-2", "flower", "cabin", "background"];

const GameScreen: React.FC = () => {
  const engineRef = useRef<GameEngineType>(null);
  const [gameRunning, setGameRunning] = useState(false);
  const [renderedAssets, setRenderedAssets] = useState(new Set<string>());
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);
  const [entities, setEntities] = useState<Record<string, Entity>>({});
  const expectedAssetsRef = useRef(new Set<string>());
  const [renderStartTime, setRenderStartTime] = useState(0);
  const [hasStartedRendering, setHasStartedRendering] = useState(false);
  const lastRenderedAssetTimeRef = useRef(Date.now());
  const uniqueAssetsRef = useRef(new Set<string>());

  // Use our renamed game assets hook
  const { isLoaded: assetsLoaded, progress: loadingProgress, error: assetError } = useGameAssets();

  const onImageLoad = useCallback((assetId?: string) => {
    if (assetId) {
      // Add to unique assets set
      uniqueAssetsRef.current.add(assetId);

      logger.log("Game", `Image rendered: ${assetId} (${uniqueAssetsRef.current.size} unique assets so far)`);
      lastRenderedAssetTimeRef.current = Date.now();
      setRenderedAssets((prev) => {
        const newSet = new Set(prev);
        newSet.add(assetId);
        return newSet;
      });
    }
  }, []);

  // Initialize entities and track expected assets
  useEffect(() => {
    if (!assetsLoaded) return;

    const gameEntities = setupGameEntities(onImageLoad);
    setEntities(gameEntities);

    // Collect expected assets
    const newExpectedAssets = new Set<string>(EXPECTED_ASSETS);

    // Also add any entity-specific assets
    Object.values(gameEntities).forEach((entity) => {
      if ("assetId" in entity && entity.assetId && typeof entity.assetId === "string") {
        newExpectedAssets.add(entity.assetId);
      }
      // Check for background assets in map entities
      if (entity.tileData?.background) {
        newExpectedAssets.add(entity.tileData.background);
      }
    });

    expectedAssetsRef.current = newExpectedAssets;
    logger.log("Game", `Initialized with ${newExpectedAssets.size} expected assets:`, Array.from(newExpectedAssets));

    // Start tracking render time
    if (!hasStartedRendering) {
      setRenderStartTime(Date.now());
      setHasStartedRendering(true);
    }
  }, [assetsLoaded, onImageLoad, hasStartedRendering]);

  // Check if all required assets are loaded
  const checkAllAssetsLoaded = useCallback(() => {
    const hasAllRequiredAssets = EXPECTED_ASSETS.every((asset) => uniqueAssetsRef.current.has(asset));
    const minimumRenderTime = 1000; // 1 second minimum render time
    const hasMetMinimumTime = Date.now() - renderStartTime >= minimumRenderTime;

    return hasAllRequiredAssets && hasMetMinimumTime;
  }, [renderStartTime]);

  // Track asset rendering completion
  useEffect(() => {
    if (!assetsLoaded || Object.keys(entities).length === 0) return;

    // Check if all required assets are loaded
    if (checkAllAssetsLoaded()) {
      logger.log("Game", "All required assets loaded:", {
        expected: EXPECTED_ASSETS,
        loaded: Array.from(uniqueAssetsRef.current),
        renderTime: Date.now() - renderStartTime,
      });
      setIsFullyLoaded(true);
    }
  }, [assetsLoaded, renderedAssets, entities, renderStartTime, checkAllAssetsLoaded]);

  // Handle game engine initialization
  useEffect(() => {
    if (engineRef.current) {
      window.gameEngine = engineRef.current;
    }

    // Start game when everything is fully loaded
    if (isFullyLoaded && !gameRunning) {
      logger.log("Game", "Assets loaded and rendered, starting game");
      setGameRunning(true);
    }

    return () => {
      window.gameEngine = null;
    };
  }, [isFullyLoaded, gameRunning]);

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

  // Calculate loading progress based on loaded unique assets
  const totalProgress = isFullyLoaded
    ? 100
    : Math.min(
        95, // Cap at 95% until fully rendered
        Math.floor((uniqueAssetsRef.current.size / EXPECTED_ASSETS.length) * 95)
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
