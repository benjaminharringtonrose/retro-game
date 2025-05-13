import React, { useState, useEffect, useMemo, useCallback } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { Direction, MapType, MapPosition } from "./types";
import { Map } from "./components/Map";
import { Player } from "./components/Player";
import { DEFAULT_MAPS, TILE_SIZE } from "./constants/map";
import { Pad } from "./components/Pad";
import { EntityType } from "./engine/types/EntityTypes";
import { useGameEngine } from "./hooks/useGameEngine";
import { usePlayerAnimation } from "./hooks/usePlayerAnimation";
import { usePlayerInput } from "./hooks/usePlayerInput";
import { LoadingScreen } from "./components/LoadingScreen";
import { Asset } from "expo-asset";
import { useFonts } from "expo-font";

const CURRENT_MAP = MapType.FOREST;

const DEFAULT_POSITION: MapPosition = {
  x: 0,
  y: 0,
};

// Define assets with their module IDs
const GAME_ASSETS = {
  characterSpritesheet: require("./assets/character-spritesheet.png"),
  tree: require("./assets/tree.png"),
  tree2: require("./assets/tree-2.png"),
  forestBackground: require("./assets/forest-background.png"),
};

export default function GameScreen() {
  const { width: wWidth, height: wHeight } = useWindowDimensions();
  const { engine, entityManager } = useGameEngine();
  const [isLoading, setIsLoading] = useState(true);
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  const [fontsLoaded] = useFonts({
    PressStart2P: require("./assets/fonts/PressStart2P-Regular.ttf"),
  });

  // Preload assets
  useEffect(() => {
    async function loadAssets() {
      try {
        const imageAssets = Object.values(GAME_ASSETS);
        await Asset.loadAsync(imageAssets);
        setAssetsLoaded(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load assets:", error);
        setIsLoading(false);
      }
    }

    loadAssets();
  }, []);

  // Get initial position from map config
  const initialPosition = useMemo(() => DEFAULT_MAPS[CURRENT_MAP].initialPosition ?? DEFAULT_POSITION, []);

  // Create shared values with memoized initial values
  const mapX = useSharedValue(initialPosition.x);
  const mapY = useSharedValue(initialPosition.y);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const playerCenterX = useSharedValue(wWidth / 2);
  const playerCenterY = useSharedValue(wHeight / 2);
  const currentFrame = useSharedValue(0);
  const directionValue = useSharedValue(Direction.Down);
  const isMovingValue = useSharedValue(false);

  const [direction, setDirection] = useState(Direction.Down);
  const [isMoving, setIsMoving] = useState(false);

  // Initialize player position
  useEffect(() => {
    playerCenterX.value = wWidth / 2;
    playerCenterY.value = wHeight / 2;
  }, [wWidth, wHeight]);

  // Memoize the player creation to prevent recreation on every render
  useEffect(() => {
    if (!isLoading) {
      entityManager.createPlayer(
        {
          position: { x: wWidth / 2, y: wHeight / 2 },
          spritesheet: GAME_ASSETS.characterSpritesheet,
          type: EntityType.PLAYER,
        },
        {
          mapX,
          mapY,
          offsetX,
          offsetY,
        }
      );
    }
  }, [entityManager, wWidth, wHeight, isLoading]);

  // Use custom hooks for animation and input
  usePlayerAnimation(isMoving, direction, currentFrame, directionValue, isMovingValue);
  usePlayerInput(engine, direction, isMoving);

  // Memoize direction and movement handlers
  const handleDirectionChange = useCallback((newDirection: Direction) => {
    setDirection(newDirection);
    directionValue.value = newDirection;
  }, []);

  const handleMovingChange = useCallback((value: boolean) => {
    setIsMoving(value);
    isMovingValue.value = value;
  }, []);

  // Memoize map data to prevent unnecessary re-renders
  const mapData = useMemo(
    () => ({
      tiles: DEFAULT_MAPS[CURRENT_MAP].mapData,
      tileSize: TILE_SIZE,
    }),
    []
  );

  // Don't render anything until assets are loaded
  if (isLoading || !assetsLoaded || !fontsLoaded) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.gameContainer}>
        <View style={[StyleSheet.absoluteFill, { zIndex: 1 }]}>
          <Map mapX={mapX} mapY={mapY} tiles={mapData.tiles} tileSize={mapData.tileSize} mapType={CURRENT_MAP} />
        </View>
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              zIndex: 2000,
              elevation: 2000,
              backgroundColor: "transparent",
              position: "absolute",
              left: 0,
              top: 0,
              right: 0,
              bottom: 0,
            },
          ]}
        >
          <Player direction={direction} isMoving={isMoving} centerX={playerCenterX} centerY={playerCenterY} currentFrame={currentFrame} offsetX={offsetX} offsetY={offsetY} />
        </View>
      </View>
      <View style={[styles.controls, { zIndex: 3000, elevation: 3000 }]}>
        <Pad setDirection={handleDirectionChange} setIsMoving={handleMovingChange} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#222",
  },
  gameContainer: {
    flex: 1,
    position: "relative",
    overflow: "visible",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  controls: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 200,
  },
});
