import { GameEntities, GameEvent } from "../types";

const InputSystem = (
  entities: GameEntities,
  { events }: { events: GameEvent[] }
) => {
  const player = entities.player;
  const map = entities.map;

  player.moving = false;

  if (events) {
    events.forEach((event) => {
      if (event.type === "move") {
        let dx = 0;
        let dy = 0;
        let newDirection = player.direction;

        if (event.direction === "up") {
          dy = -1;
          newDirection = "up";
        }
        if (event.direction === "down") {
          dy = 1;
          newDirection = "down";
        }
        if (event.direction === "left") {
          dx = -1;
          newDirection = "left";
        }
        if (event.direction === "right") {
          dx = 1;
          newDirection = "right";
        }

        const newX = player.x + dx;
        const newY = player.y + dy;

        if (
          newX >= 0 &&
          newX < map.width &&
          newY >= 0 &&
          newY < map.height &&
          map.tiles[newY][newX] !== 1
        ) {
          player.x = newX;
          player.y = newY;
          player.moving = true;
          player.direction = newDirection;
        }
      }
    });
  }

  return entities;
};

export default InputSystem;
