import { useEffect, useCallback, useRef } from "react";
import { GameEngine } from "../engine/GameEngine";
import { Direction } from "../types";
import { ComponentType, InputComponent } from "../engine/types/components";

export function usePlayerInput(engine: GameEngine, direction: Direction, isMoving: boolean) {
  const lastUpdateRef = useRef({ direction, isMoving });

  const updateInput = useCallback(() => {
    const entities = engine.getEntitiesWithComponents([ComponentType.Input]);

    // Only update if there's an actual change
    if (lastUpdateRef.current.direction === direction && lastUpdateRef.current.isMoving === isMoving) {
      return;
    }

    lastUpdateRef.current = { direction, isMoving };

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
          dy = 1;
          break;
        case Direction.Down:
          dy = -1;
          break;
      }

      // Normalize diagonal movement
      if (dx !== 0 && dy !== 0) {
        const length = Math.sqrt(dx * dx + dy * dy);
        dx /= length;
        dy /= length;
      }

      input.direction = { x: dx, y: dy };
      input.isMoving = isMoving;
      input.lastUpdate = performance.now();
    }
  }, [direction, isMoving, engine]);

  useEffect(() => {
    updateInput();
  }, [updateInput]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      const entities = engine.getEntitiesWithComponents([ComponentType.Input]);
      for (const entity of entities) {
        const input = engine.getComponent<InputComponent>(entity, ComponentType.Input);
        if (input) {
          input.isMoving = false;
          input.direction = { x: 0, y: 0 };
        }
      }
    };
  }, [engine]);
}
