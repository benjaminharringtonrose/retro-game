import { Entity, SystemProps, Direction } from "../../types";
import { Dimensions } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export const MovementSystem = (entities: { [key: string]: Entity }, { time, delta = 16.666 }: SystemProps) => {
  const player = entities["player-1"];
  const map = entities["map-1"];

  if (!player?.controls || !map?.position) {
    return entities;
  }

  // Ensure delta is a valid number and convert to seconds
  const deltaSeconds = (typeof delta === "number" && delta > 0 ? delta : 16.666) / 1000;

  let deltaX = 0;
  let deltaY = 0;
  const speed = player.movement.speed * deltaSeconds;

  if (player.controls.up) {
    deltaY = speed;
    player.movement.direction = Direction.Up;
    player.movement.isMoving = true;
  } else if (player.controls.down) {
    deltaY = -speed;
    player.movement.direction = Direction.Down;
    player.movement.isMoving = true;
  }

  if (player.controls.left) {
    deltaX = speed;
    player.movement.direction = Direction.Left;
    player.movement.isMoving = true;
  } else if (player.controls.right) {
    deltaX = -speed;
    player.movement.direction = Direction.Right;
    player.movement.isMoving = true;
  }

  if (!deltaX && !deltaY) {
    player.movement.isMoving = false;
    return entities;
  }

  // Apply bounds checking
  if (map.bounds) {
    const newX = map.position.x + deltaX;
    const newY = map.position.y + deltaY;

    // Only move if within bounds
    if (newX <= map.bounds.maxX && newX >= map.bounds.minX) {
      map.position.x = newX;
    }
    if (newY <= map.bounds.maxY && newY >= map.bounds.minY) {
      map.position.y = newY;
    }
  }

  return entities;
};
