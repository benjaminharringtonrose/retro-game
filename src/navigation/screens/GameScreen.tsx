import React, { useRef, useEffect, useState } from "react";
import { StyleSheet, View, ActivityIndicator, Text } from "react-native";
import { GameEngine as RNGameEngine } from "react-native-game-engine";
import { setupGameEntities } from "../../engine/entities";
import { Systems } from "../../engine/systems";
import { Pad } from "../../components/Pad";
import { Direction } from "../../types/enums";
import { Entity } from "../../types/entities";
import { GameEngine, GameEvent } from "../../types/system";
import { useGameAssets } from "../../hooks/useAssets";

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

  // Use our renamed game assets hook
  const { isLoaded: assetsLoaded, progress: loadingProgress, error: assetError } = useGameAssets();

  // Initialize entities once assets are loaded
  const entities = assetsLoaded ? setupGameEntities() : {};

  useEffect(() => {
    if (engineRef.current) {
      window.gameEngine = engineRef.current;
    }

    // Start game when assets are loaded
    if (assetsLoaded && !gameRunning) {
      console.log("[GameScreen] Assets loaded, starting game");
      setGameRunning(true);
    }

    return () => {
      window.gameEngine = null;
    };
  }, [assetsLoaded, gameRunning]);

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

  if (!assetsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading game assets... {Math.round(loadingProgress * 100)}%</Text>
        {assetError && <Text style={styles.errorText}>{assetError}</Text>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RNGameEngine ref={engineRef} style={StyleSheet.absoluteFill} systems={Systems} entities={entities} running={gameRunning} onEvent={handleEvent} />
      <Pad onDirectionChange={handleDirectionChange} />
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
