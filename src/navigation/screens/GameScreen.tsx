import React, { useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { GameEngine as RNGameEngine } from "react-native-game-engine";
import { setupGameEntities } from "../../engine/entities";
import { GameLoop } from "../../engine/systems";
import { Pad } from "../../components/Pad";
import { Direction, Entities } from "../../types";

interface GameEngineType extends RNGameEngine {
  dispatch: (event: any) => void;
  entities: Entities;
}

const GameScreen: React.FC = () => {
  const engineRef = useRef<GameEngineType>(null);
  const [entities] = useState(setupGameEntities);

  const handleDirectionChange = (direction: Direction | null) => {
    // Access entities directly from our state
    const { controls } = entities.gameState;

    // Reset all directional controls
    controls.up = false;
    controls.down = false;
    controls.left = false;
    controls.right = false;

    // Set the new direction
    if (direction) {
      switch (direction) {
        case Direction.Up:
          controls.up = true;
          break;
        case Direction.Down:
          controls.down = true;
          break;
        case Direction.Left:
          controls.left = true;
          break;
        case Direction.Right:
          controls.right = true;
          break;
      }
    }
  };

  return (
    <View style={styles.container}>
      <RNGameEngine ref={engineRef} style={StyleSheet.absoluteFill} systems={[GameLoop]} entities={entities} running={true} />
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
