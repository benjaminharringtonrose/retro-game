import React, { useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { Direction } from "./types";
import { Map } from "./components/Map";
import { Player } from "./components/Player";
import { DEFAULT_MAPS } from "./maps/home";
import { Pad } from "./components/Pad";
import { EntityType } from "./engine/types/EntityTypes";
import { useGameEngine } from "./hooks/useGameEngine";
import { usePlayerAnimation } from "./hooks/usePlayerAnimation";
import { usePlayerInput } from "./hooks/usePlayerInput";

const CURRENT_MAP = "TOWN";

export default function GameScreen() {
  const { width: wWidth, height: wHeight } = useWindowDimensions();
  const { engine, entityManager } = useGameEngine();

  // animated values
  const mapX = useSharedValue(DEFAULT_MAPS[CURRENT_MAP].initialPosition.x);
  const mapY = useSharedValue(DEFAULT_MAPS[CURRENT_MAP].initialPosition.y);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const playerCenterX = useSharedValue(wWidth / 2);
  const playerCenterY = useSharedValue(wHeight / 2);
  const currentFrame = useSharedValue(0);
  const directionValue = useSharedValue(Direction.Down);
  const isMovingValue = useSharedValue(false);

  const [direction, setDirection] = useState(Direction.Down);
  const [isMoving, setIsMoving] = useState(false);

  // Create player entity
  entityManager.createPlayer(
    {
      position: { x: wWidth / 2, y: wHeight / 2 },
      spritesheet: require("./assets/character-spritesheet.png"),
      type: EntityType.PLAYER,
    },
    {
      mapX,
      mapY,
      offsetX,
      offsetY,
    }
  );

  // Use custom hooks for animation and input
  usePlayerAnimation(isMoving, direction, currentFrame, directionValue, isMovingValue);
  usePlayerInput(engine, direction, isMoving);

  return (
    <View style={styles.container}>
      <Map mapX={mapX} mapY={mapY} tiles={DEFAULT_MAPS[CURRENT_MAP].mapData} tileSize={48} />
      <Player direction={direction} isMoving={isMoving} centerX={playerCenterX} centerY={playerCenterY} currentFrame={currentFrame} offsetX={offsetX} offsetY={offsetY} />
      <Pad
        setDirection={(newDirection) => {
          setDirection(newDirection);
          directionValue.value = newDirection;
        }}
        setIsMoving={(value) => {
          setIsMoving(value);
          isMovingValue.value = value;
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#222" },
});
