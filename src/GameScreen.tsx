import React, { useState, useEffect, useMemo, useCallback } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { Direction, MapType, MapPosition } from "./types";
import { Map } from "./components/Map";
import { Player } from "./components/Player";
import { DEFAULT_MAPS } from "./constants/map";
import { Pad } from "./components/Pad";
import { EntityType } from "./engine/types/EntityTypes";
import { useGameEngine } from "./hooks/useGameEngine";
import { usePlayerAnimation } from "./hooks/usePlayerAnimation";
import { usePlayerInput } from "./hooks/usePlayerInput";

const CURRENT_MAP = MapType.FOREST;

const DEFAULT_POSITION: MapPosition = {
  x: 0,
  y: 0,
};

export default function GameScreen() {
  const { width: wWidth, height: wHeight } = useWindowDimensions();
  const { engine, entityManager } = useGameEngine();

  // Memoize initial position values
  const initialPosition = useMemo(() => DEFAULT_MAPS[CURRENT_MAP].initialPosition ?? DEFAULT_POSITION, []);
  const initialMapX = useMemo(() => initialPosition.x, [initialPosition]);
  const initialMapY = useMemo(() => initialPosition.y, [initialPosition]);

  // Create shared values with memoized initial values
  const mapX = useSharedValue(initialMapX);
  const mapY = useSharedValue(initialMapY);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const playerCenterX = useSharedValue(wWidth / 2);
  const playerCenterY = useSharedValue(wHeight / 2);
  const currentFrame = useSharedValue(0);
  const directionValue = useSharedValue(Direction.Down);
  const isMovingValue = useSharedValue(false);

  const [direction, setDirection] = useState(Direction.Down);
  const [isMoving, setIsMoving] = useState(false);

  // Memoize the player creation to prevent recreation on every render
  useEffect(() => {
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
  }, [entityManager, wWidth, wHeight]);

  // Use custom hooks for animation and input
  usePlayerAnimation(isMoving, direction, currentFrame, directionValue, isMovingValue);
  usePlayerInput(engine, direction, isMoving);

  // Memoize direction and movement handlers
  const handleDirectionChange = useCallback(
    (newDirection: Direction) => {
      setDirection(newDirection);
      directionValue.value = newDirection;
    },
    [directionValue]
  );

  const handleMovingChange = useCallback(
    (value: boolean) => {
      setIsMoving(value);
      isMovingValue.value = value;
    },
    [isMovingValue]
  );

  // Memoize map data to prevent unnecessary re-renders
  const mapData = useMemo(
    () => ({
      tiles: DEFAULT_MAPS[CURRENT_MAP].mapData,
      tileSize: 48,
    }),
    []
  );

  return (
    <View style={styles.container}>
      <Map mapX={mapX} mapY={mapY} tiles={mapData.tiles} tileSize={mapData.tileSize} mapType={CURRENT_MAP} />
      <Player direction={direction} isMoving={isMoving} centerX={playerCenterX} centerY={playerCenterY} currentFrame={currentFrame} offsetX={offsetX} offsetY={offsetY} />
      <Pad setDirection={handleDirectionChange} setIsMoving={handleMovingChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#222",
  },
});
