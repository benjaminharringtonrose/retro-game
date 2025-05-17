import React, { useRef } from "react";
import { StyleSheet, View } from "react-native";
import { GameEngine as RNGameEngine } from "react-native-game-engine";
import { setupGameEntities } from "../../engine/entities";
import { Systems } from "../../engine/systems";
import { Pad } from "../../components/Pad";
import { Direction, Entity, GameEvent } from "../../types";

interface GameEngineType extends RNGameEngine {
  dispatch: (event: any) => void;
  entities: { [key: string]: Entity };
}

const initialEntities = setupGameEntities();

const GameScreen: React.FC = () => {
  const engineRef = useRef<GameEngineType>(null);

  const handleDirectionChange = (direction: Direction | null) => {
    if (!engineRef.current) return;

    engineRef.current.dispatch({
      type: "move",
      payload: { direction },
    });
  };

  return (
    <View style={styles.container}>
      <RNGameEngine
        ref={engineRef}
        style={StyleSheet.absoluteFill}
        systems={Systems}
        entities={initialEntities}
        running={true}
        onEvent={(event: GameEvent) => {
          console.log("Game Event:", event);
        }}
      />
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
