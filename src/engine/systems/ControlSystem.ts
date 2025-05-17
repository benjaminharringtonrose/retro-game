import { Entity, SystemProps, GameEvent, Direction } from "../../types";

export const ControlSystem = (entities: { [key: string]: Entity }, { events = [] }: SystemProps) => {
  events.forEach((event: GameEvent) => {
    if (event.type === "move") {
      const player = entities["player-1"];
      if (!player?.controls) {
        return entities;
      }

      // Reset all controls first
      player.controls.up = false;
      player.controls.down = false;
      player.controls.left = false;
      player.controls.right = false;

      // If direction is null, we're stopping movement
      if (!event.payload?.direction) {
        player.movement.isMoving = false;
        return entities;
      }

      // Set the new direction
      switch (event.payload.direction) {
        case Direction.Up:
          player.controls.up = true;
          break;
        case Direction.Down:
          player.controls.down = true;
          break;
        case Direction.Left:
          player.controls.left = true;
          break;
        case Direction.Right:
          player.controls.right = true;
          break;
      }
    }
  });

  return entities;
};
