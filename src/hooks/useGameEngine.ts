import { useRef, useEffect } from "react";
import { GameEngine } from "../engine/GameEngine";
import { EntityManager } from "../engine/EntityManager";
import { MovementSystem } from "../engine/systems/MovementSystem";
import { AnimationSystem } from "../engine/systems/AnimationSystem";
import { RenderSystem } from "../engine/systems/RenderSystem";
import { DEFAULT_MAPS } from "../constants/map";

const CURRENT_MAP = "FOREST";

export function useGameEngine() {
  const gameEngine = useRef<GameEngine>(new GameEngine());
  const entityManager = useRef<EntityManager>(new EntityManager(gameEngine.current));

  useEffect(() => {
    const engine = gameEngine.current;

    // Add systems in the correct order
    engine.addSystem(new MovementSystem(DEFAULT_MAPS[CURRENT_MAP].mapData));
    engine.addSystem(new AnimationSystem());
    engine.addSystem(new RenderSystem());

    // Start game loop
    engine.start();

    return () => {
      engine.stop();
    };
  }, []);

  return {
    engine: gameEngine.current,
    entityManager: entityManager.current,
  };
}
