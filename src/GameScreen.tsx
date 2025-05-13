import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { useSharedValue, withTiming, withRepeat, withSequence, cancelAnimation } from "react-native-reanimated";
import { Direction } from "./types";
import { Map } from "./components/Map";
import { Player } from "./components/Player";
import { DEFAULT_MAPS } from "./maps/home";
import { Pad } from "./components/Pad";
import { GameEngine } from "./engine/GameEngine";
import { EntityManager } from "./engine/EntityManager";
import { MovementSystem } from "./engine/systems/MovementSystem";
import { AnimationSystem } from "./engine/systems/AnimationSystem";
import { RenderSystem } from "./engine/systems/RenderSystem";
import { EntityType } from "./engine/types/EntityTypes";
import { ComponentType, InputComponent } from "./engine/types/components";

const CURRENT_MAP = "TOWN";
const ANIMATION_FRAME_DURATION = 150;

export default function GameScreen() {
  const { width: wWidth, height: wHeight } = useWindowDimensions();
  const gameEngine = useRef<GameEngine>(new GameEngine());
  const entityManager = useRef<EntityManager>(new EntityManager(gameEngine.current));

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

  // Initialize game engine and entities
  useEffect(() => {
    const engine = gameEngine.current;
    const manager = entityManager.current;

    // Add systems in the correct order
    engine.addSystem(new MovementSystem(DEFAULT_MAPS[CURRENT_MAP].mapData));
    engine.addSystem(new AnimationSystem());
    engine.addSystem(new RenderSystem());

    // Create player entity
    const playerId = manager.createPlayer(
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

    /* Example: Create some NPCs - Uncomment when NPC sprites are available
    const npcConfigs = [
      {
        position: { x: wWidth / 2 + 100, y: wHeight / 2 + 100 },
        spritesheet: require("./assets/npc-spritesheet.png"),
        movementPattern: { type: 'patrol' as const, points: [
          { x: wWidth / 2 + 100, y: wHeight / 2 + 100 },
          { x: wWidth / 2 + 200, y: wHeight / 2 + 100 },
        ]},
      },
    ];

    npcConfigs.forEach(config => {
      manager.createNPC(config);
    });
    */

    // Start game loop
    engine.start();

    return () => {
      engine.stop();
    };
  }, []);

  // Handle animation frames
  useEffect(() => {
    directionValue.value = direction;
    isMovingValue.value = isMoving;

    if (isMoving) {
      cancelAnimation(currentFrame);
      currentFrame.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 0 }),
          withTiming(1, { duration: ANIMATION_FRAME_DURATION }),
          withTiming(2, { duration: 0 }),
          withTiming(2, { duration: ANIMATION_FRAME_DURATION }),
          withTiming(0, { duration: 0 }),
          withTiming(0, { duration: ANIMATION_FRAME_DURATION })
        ),
        -1
      );
    } else {
      cancelAnimation(currentFrame);
      currentFrame.value = 0;
    }
  }, [isMoving, direction]);

  // Update player input
  useEffect(() => {
    const engine = gameEngine.current;
    const entities = engine.getEntitiesWithComponents([ComponentType.Input]);

    for (const entity of entities) {
      const input = engine.getComponent<InputComponent>(entity, ComponentType.Input);
      if (!input) continue;

      let dx = 0,
        dy = 0;
      switch (direction) {
        case Direction.Left:
          dx = -1;
          break;
        case Direction.Right:
          dx = 1;
          break;
        case Direction.Up:
          dy = -1;
          break;
        case Direction.Down:
          dy = 1;
          break;
      }

      input.direction = { x: dx, y: dy };
      input.isMoving = isMoving;
    }
  }, [direction, isMoving]);

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
