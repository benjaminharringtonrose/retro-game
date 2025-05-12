import { GameEngineSystem } from "react-native-game-engine";
import { MOVE_SPEED } from "../constants/sprites";
import { WIDTH, HEIGHT } from "../constants/window";
import { Entities } from "../types";

export const MovePlayer: GameEngineSystem = (entities: Entities) => {
  const { player, map, gameState } = entities;
  let movedX = 0;
  let movedY = 0;

  if (gameState.controls.up) {
    movedY = -MOVE_SPEED;
    player.direction = "up";
    player.isMoving = true;
  } else if (gameState.controls.down) {
    movedY = MOVE_SPEED;
    player.direction = "down";
    player.isMoving = true;
  } else if (gameState.controls.left) {
    movedX = -MOVE_SPEED;
    player.direction = "left";
    player.isMoving = true;
  } else if (gameState.controls.right) {
    movedX = MOVE_SPEED;
    player.direction = "right";
    player.isMoving = true;
  } else {
    player.isMoving = false;
  }

  // Shift map inversely
  const newMapX = map.x - movedX;
  const newMapY = map.y - movedY;

  // Clamp map within its boundaries
  const minMapX = WIDTH - map.width;
  const maxMapX = 0;
  const minMapY = HEIGHT - map.height;
  const maxMapY = 0;

  map.x = Math.max(minMapX, Math.min(maxMapX, newMapX));
  map.y = Math.max(minMapY, Math.min(maxMapY, newMapY));

  return entities;
};
