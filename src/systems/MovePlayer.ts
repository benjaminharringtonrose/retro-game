import { GameEngineSystem } from "react-native-game-engine";
import { MOVE_SPEED, SPRITE_HEIGHT, SPRITE_WIDTH } from "../constants/sprites";
import { Entities } from "../types";

export const MovePlayer: GameEngineSystem = (entities: Entities) => {
  const { player, map, gameState } = entities;
  let movedX = 0;
  let movedY = 0;

  // Update player position based on controls
  if (gameState.controls.up) {
    movedY = -MOVE_SPEED;
    player.direction = "up";
  } else if (gameState.controls.down) {
    movedY = MOVE_SPEED;
    player.direction = "down";
  } else if (gameState.controls.left) {
    movedX = -MOVE_SPEED;
    player.direction = "left";
  } else if (gameState.controls.right) {
    movedX = MOVE_SPEED;
    player.direction = "right";
  }

  // Calculate new position
  const newX = player.x + movedX;
  const newY = player.y + movedY;

  // Boundary checking
  const minX = SPRITE_WIDTH / 2;
  const maxX = map.width - SPRITE_WIDTH / 2;
  const minY = SPRITE_HEIGHT / 2;
  const maxY = map.height - SPRITE_HEIGHT / 2;

  // Update position only if within bounds
  player.x = Math.max(minX, Math.min(maxX, newX));
  player.y = Math.max(minY, Math.min(maxY, newY));

  // Update sprite animation
  if (movedX !== 0 || movedY !== 0) {
    player.spriteSheet.current?.play({
      type: player.direction,
      fps: 8,
      loop: true,
      resetAfterFinish: false,
      onFinish: () => {},
    });
  } else {
    player.spriteSheet.current?.stop();
  }

  return entities;
};
