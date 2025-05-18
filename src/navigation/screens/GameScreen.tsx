import React, { useRef, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { GameEngine as RNGameEngine } from "react-native-game-engine";
import { setupGameEntities } from "../../engine/entities";
import { Systems } from "../../engine/systems";
import { Pad } from "../../components/Pad";
import { Direction, Entity, GameEngine, GameEvent } from "../../types";

interface GameEngineType extends RNGameEngine {
  dispatch: (event: any) => void;
  entities: { [key: string]: Entity };
}

const initialEntities = setupGameEntities();

declare global {
  interface Window {
    gameEngine: GameEngine | null;
  }
}

const GameScreen: React.FC = () => {
  const engineRef = useRef<GameEngineType>(null);

  useEffect(() => {
    if (engineRef.current) {
      // Store the game engine reference globally
      window.gameEngine = engineRef.current;
    }
    return () => {
      window.gameEngine = null;
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
      <RNGameEngine ref={engineRef} style={StyleSheet.absoluteFill} systems={Systems} entities={initialEntities} running={true} onEvent={handleEvent} />
      <Pad onDirectionChange={handleDirectionChange} />
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
