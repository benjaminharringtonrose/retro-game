import React, { useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { GameEngine as RNGameEngine } from "react-native-game-engine";
import { setupGameEntities } from "../../engine/entities";
import { Systems } from "../../engine/systems";
import { Pad } from "../../components/Pad";
import { Direction, Entity, GameEvent } from "../../types";
import { DialogBox } from "../../components/DialogBox";

interface GameEngineType extends RNGameEngine {
  dispatch: (event: any) => void;
  entities: { [key: string]: Entity };
}

const initialEntities = setupGameEntities();

const GameScreen: React.FC = () => {
  const engineRef = useRef<GameEngineType>(null);
  const [entities, setEntities] = useState(initialEntities);
  const [dialogState, setDialogState] = useState({
    isVisible: false,
    message: "",
  });

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
          if (event.type === "entities-updated" && event.payload) {
            const updatedEntities = event.payload as { [key: string]: Entity };
            setEntities(updatedEntities);

            const dialog = updatedEntities.dialog;
            if (dialog) {
              const newDialogState = {
                isVisible: dialog.isVisible,
                message: dialog.message,
              };

              // Only update state if it changed
              if (newDialogState.isVisible !== dialogState.isVisible || newDialogState.message !== dialogState.message) {
                console.log("[GameScreen] Updating dialog state:", newDialogState);
                setDialogState(newDialogState);
              }
            }
          }
        }}
      />
      <Pad onDirectionChange={handleDirectionChange} />
      <DialogBox isVisible={dialogState.isVisible} message={dialogState.message} />
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
