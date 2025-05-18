import React, { useRef, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { GameEngine as RNGameEngine } from "react-native-game-engine";
import { setupGameEntities } from "../../engine/entities";
import { Systems } from "../../engine/systems";
import { Pad } from "../../components/Pad";
import { Direction, Entity, GameEngine, GameEvent } from "../../types";
import { LoadingOverlay, createLoadingHandler } from "../../components/LoadingOverlay";

interface GameEngineType extends RNGameEngine {
  dispatch: (event: any) => void;
  entities: { [key: string]: Entity };
}

// Calculate total assets:
// 1 background image
// 2 tree types
// 1 flower type
// 1 NPC sprite sheet
const TOTAL_GAME_ASSETS = 5;

// Create a loading handler for the game's assets
const loadingHandler = createLoadingHandler(TOTAL_GAME_ASSETS);

const initialEntities = setupGameEntities((assetId?: string) => {
  loadingHandler.handleImageLoad(assetId);
});

declare global {
  interface Window {
    gameEngine: GameEngine | null;
  }
}

const GameScreen: React.FC = () => {
  const engineRef = useRef<GameEngineType>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedAssets, setLoadedAssets] = useState(0);

  useEffect(() => {
    if (engineRef.current) {
      // Store the game engine reference globally
      window.gameEngine = engineRef.current;
    }

    // Subscribe to loading updates
    const unsubscribe = loadingHandler.subscribe(() => {
      const progress = loadingHandler.getProgress();
      setLoadedAssets(progress);

      if (progress === loadingHandler.getTotalAssets()) {
        console.log("[GameScreen] All assets loaded, hiding overlay");
        setIsLoading(false);
      }
    });

    return () => {
      window.gameEngine = null;
      unsubscribe();
    };
  }, []);

  const handleDirectionChange = (direction: Direction | null) => {
    if (!engineRef.current) return;

    engineRef.current.dispatch({
      type: "move",
      payload: { direction },
    });
  };

  const handleEvent = (event: GameEvent) => {
    console.log("Game Event:", event);

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

  return (
    <View style={styles.container}>
      <RNGameEngine ref={engineRef} style={StyleSheet.absoluteFill} systems={Systems} entities={initialEntities} running={!isLoading} onEvent={handleEvent} />
      <Pad onDirectionChange={handleDirectionChange} />
      <LoadingOverlay
        totalAssets={TOTAL_GAME_ASSETS}
        loadedAssets={loadedAssets}
        onAllLoaded={() => {
          console.log("[GameScreen] LoadingOverlay completed");
          setIsLoading(false);
        }}
      />
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
