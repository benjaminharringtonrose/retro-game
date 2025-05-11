// src/utils/gameEngineUtils.ts
import { GameEngine } from "react-native-game-engine";
import { Entities } from "../types";

/**
 * Type-safe wrapper for GameEngine swap method
 * @param gameEngine Reference to the GameEngine
 * @param entities New entities to swap in
 */
export const safeSwapEntities = (
  gameEngine: React.RefObject<GameEngine>,
  entities: Entities
): void => {
  if (gameEngine.current) {
    (gameEngine.current as any).swap(entities);
    console.log("Swapped entities:", entities); // Debug log
  }
};

/**
 * Type-safe wrapper to access GameEngine entities
 * @param gameEngine Reference to the GameEngine
 * @returns The current entities or undefined if not available
 */
export const getEntities = (
  gameEngine: React.RefObject<GameEngine>
): Entities | undefined => {
  if (gameEngine.current) {
    return (gameEngine.current as any).entities as Entities;
  }
  return undefined;
};

/**
 * Type-safe wrapper to set a player direction
 * @param gameEngine Reference to the GameEngine
 * @param x X direction (-1, 0, 1)
 * @param y Y direction (-1, 0, 1)
 */
export const setPlayerDirection = (
  gameEngine: React.RefObject<GameEngine>,
  x: number,
  y: number
): void => {
  const entities = getEntities(gameEngine);
  if (entities && entities.player) {
    entities.player.direction = { x, y };
  }
};
