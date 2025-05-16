import { useEffect, useMemo, useState } from "react";
import { SharedValue, useSharedValue } from "react-native-reanimated";
import { Direction, CollidableEntity } from "../types";
import { EntityType } from "../engine/types/EntityTypes";
import { useGameEngine } from "./useGameEngine";
import { NPCMovementSystem } from "../engine/systems/NPCMovementSystem";
import { TILE_SIZE } from "../constants/map";
import { ComponentType, InputComponent, AnimationComponent, CollisionComponent } from "../engine/types/components";

const FRAME_DURATION = 100; // Time each frame is shown
const TOTAL_FRAMES = 3;

// Lilly's configuration
const LILLY_CONFIG: CollidableEntity = {
  type: "npc",
  position: { row: 11, col: 11 }, // Place in the clear area near player start
  spriteScale: 1.2,
  collision: {
    width: 1,
    height: 1,
    scale: 1,
  },
  dialogues: {
    default: "Hi! I'm Lilly. Welcome to the forest!",
  },
  movementPattern: {
    type: "patrol",
    points: [
      { row: 11, col: 11 }, // Start position
      { row: 11, col: 13 }, // Right 2 tiles
      { row: 13, col: 13 }, // Down 2 tiles
      { row: 13, col: 11 }, // Left 2 tiles
    ],
  },
  spritesheet: {
    frameWidth: 32,
    frameHeight: 40,
    frames: 3,
    frameRate: 7,
    animations: {
      idle: [0],
      walk: [0, 1, 2],
    },
    rows: {
      down: 0,
      right: 1,
      up: 2,
      left: 3,
    },
  },
};

export const useLillyNPC = (mapX: SharedValue<number>, mapY: SharedValue<number>, offsetX: SharedValue<number>, offsetY: SharedValue<number>, windowWidth: number, windowHeight: number, isMapLoaded: boolean, spritesheet: any) => {
  const { entityManager, engine } = useGameEngine();

  // Calculate screen center position
  const screenCenterX = windowWidth / 2;
  const screenCenterY = windowHeight / 2;

  // Use state for direction and isMoving
  const [direction, setDirection] = useState<Direction>(Direction.Down);
  const [isMoving, setIsMoving] = useState(false);

  // Keep shared values for animation and position
  const lillyCurrentFrame = useSharedValue(0);
  const lillyCenterX = useSharedValue(screenCenterX);
  const lillyCenterY = useSharedValue(screenCenterY);

  // Create Lilly's entity when the map is loaded
  useEffect(() => {
    if (!isMapLoaded) return;

    // Remove any existing NPC entities first
    const existingNPCs = engine.getEntitiesWithComponents([ComponentType.Movement]).filter((entityId) => {
      const input = engine.getComponent<InputComponent>(entityId, ComponentType.Input);
      return input && !input.isControlled;
    });

    existingNPCs.forEach((entityId) => {
      entityManager.removeEntity(`entity_${entityId}`);
    });

    // Convert tile position to world coordinates
    const worldX = LILLY_CONFIG.position.col * TILE_SIZE;
    const worldY = LILLY_CONFIG.position.row * TILE_SIZE;

    // Create Lilly's entity with all necessary components
    const lillyEntityId = entityManager.createEntity(
      {
        type: EntityType.NPC,
        position: {
          x: worldX,
          y: worldY,
        },
        spritesheet,
        isControlled: false,
      },
      {
        mapX,
        mapY,
        offsetX,
        offsetY,
      }
    );

    // Add collision component
    engine.addComponent(Number(lillyEntityId), {
      type: ComponentType.Collision,
      bounds: {
        width: TILE_SIZE * LILLY_CONFIG.collision.width * LILLY_CONFIG.collision.scale,
        height: TILE_SIZE * LILLY_CONFIG.collision.height * LILLY_CONFIG.collision.scale,
      },
      isStatic: false,
    } as CollisionComponent);

    // Add NPC movement system with Lilly's configuration
    engine.addSystem(new NPCMovementSystem([LILLY_CONFIG]));

    // Set up sync with entity state
    const syncInterval = setInterval(() => {
      const entities = engine.getEntitiesWithComponents([ComponentType.Input, ComponentType.Animation]);
      for (const entityId of entities) {
        const input = engine.getComponent<InputComponent>(entityId, ComponentType.Input);
        const animation = engine.getComponent<AnimationComponent>(entityId, ComponentType.Animation);

        if (!input || !animation || input.isControlled) continue;

        // Update state based on entity state
        setIsMoving(input.isMoving);
        lillyCurrentFrame.value = animation.currentFrame % TOTAL_FRAMES;

        // Update direction based on input direction
        if (Math.abs(input.direction.x) > Math.abs(input.direction.y)) {
          setDirection(input.direction.x > 0 ? Direction.Right : Direction.Left);
        } else {
          setDirection(input.direction.y > 0 ? Direction.Down : Direction.Up);
        }
      }
    }, 1000 / 60); // 60fps update

    return () => {
      clearInterval(syncInterval);
      if (lillyEntityId) {
        entityManager.removeEntity(lillyEntityId);
      }
    };
  }, [isMapLoaded, screenCenterX, screenCenterY, entityManager, spritesheet, engine, mapX, mapY, offsetX, offsetY]);

  // Update Lilly's position when map moves
  useEffect(() => {
    // Calculate Lilly's position relative to the map and screen center
    const worldX = LILLY_CONFIG.position.col * TILE_SIZE;
    const worldY = LILLY_CONFIG.position.row * TILE_SIZE;

    lillyCenterX.value = screenCenterX + worldX + mapX.value;
    lillyCenterY.value = screenCenterY + worldY + mapY.value;
  }, [screenCenterX, screenCenterY, mapX.value, mapY.value]);

  // Return values needed by the component
  return {
    direction,
    isMoving,
    lillyCurrentFrame,
    lillyCenterX,
    lillyCenterY,
  };
};
