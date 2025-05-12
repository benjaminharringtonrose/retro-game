// MovePlayer.ts
import { WIDTH, HEIGHT } from "../constants/window";
import { Direction, Entities } from "../types";

export function MovePlayer(entities: Entities) {
  const { player, map, gameState } = entities;
  const speed = player.speed;
  let dx = 0,
    dy = 0;

  if (gameState.controls.right) {
    dx = speed;
    player.direction = Direction.Right;
    player.isMoving = true;
  } else if (gameState.controls.left) {
    dx = -speed;
    player.direction = Direction.Left;
    player.isMoving = true;
  } else if (gameState.controls.down) {
    dy = speed;
    player.direction = Direction.Down;
    player.isMoving = true;
  } else if (gameState.controls.up) {
    dy = -speed;
    player.direction = Direction.Up;
    player.isMoving = true;
  } else {
    player.isMoving = false;
  }

  // horizontal
  const desiredMapX = map.x - dx;
  const minMapX = WIDTH - map.width;
  const maxMapX = 0;

  if (desiredMapX >= minMapX && desiredMapX <= maxMapX) {
    // still room to scroll the map
    map.x = desiredMapX;
    // keep player centered
    player.x = WIDTH / 2 - player.width / 2;
  } else {
    // map at edge — move the player sprite toward that edge
    // clamp between 0 and (screenWidth – playerWidth)
    const newPlayerX = player.x + dx;
    player.x = Math.max(0, Math.min(WIDTH - player.width, newPlayerX));
  }

  // vertical
  const desiredMapY = map.y - dy;
  const minMapY = HEIGHT - map.height;
  const maxMapY = 0;

  if (desiredMapY >= minMapY && desiredMapY <= maxMapY) {
    map.y = desiredMapY;
    player.y = HEIGHT / 2 - player.height / 2;
  } else {
    const newPlayerY = player.y + dy;
    player.y = Math.max(0, Math.min(HEIGHT - player.height, newPlayerY));
  }

  return entities;
}
