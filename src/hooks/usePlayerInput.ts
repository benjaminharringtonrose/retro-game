import { useEffect } from "react";
import { GameEngine } from "../engine/GameEngine";
import { Direction } from "../types";
import { ComponentType, InputComponent } from "../engine/types/components";

export function usePlayerInput(engine: GameEngine, direction: Direction, isMoving: boolean) {
  useEffect(() => {
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
  }, [direction, isMoving, engine]);
}
