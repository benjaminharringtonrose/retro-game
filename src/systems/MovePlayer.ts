import { HEIGHT, WIDTH } from "../constants/window";
import { Direction, Entities, Tile } from "../types";

export function MovePlayer(entities: Entities) {
  "worklet";
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

  const impassableTiles = [Tile.Water, Tile.Tree, Tile.Rock];
  const desiredPlayerX = player.x + dx;
  const desiredPlayerY = player.y + dy;
  const desiredMapX = map.x - dx;
  const desiredMapY = map.y - dy;

  const canMoveX = dx !== 0 ? checkCollision(dx, 0) : true;
  const canMoveY = dy !== 0 ? checkCollision(0, dy) : true;

  console.log("MovePlayer collision:", { canMoveX, canMoveY, dx, dy });

  const minMapX = WIDTH - map.width;
  const maxMapX = 0;
  const centerX = WIDTH / 2 - player.width / 2;
  const edgeThreshold = map.tileSize / 2;

  if (canMoveX && dx !== 0) {
    const isNearLeftScreenEdge = player.x < edgeThreshold;
    const isNearRightScreenEdge =
      player.x > WIDTH - player.width - edgeThreshold;

    if (
      desiredMapX >= minMapX &&
      desiredMapX <= maxMapX &&
      !((isNearLeftScreenEdge && dx > 0) || (isNearRightScreenEdge && dx < 0))
    ) {
      map.x = desiredMapX;
      player.x = centerX;
    } else {
      player.x = Math.max(0, Math.min(WIDTH - player.width, desiredPlayerX));
      map.x = Math.max(minMapX, Math.min(maxMapX, map.x));
    }
  }

  const minMapY = HEIGHT - map.height;
  const maxMapY = 0;
  const centerY = HEIGHT / 2 - player.height / 2;

  if (canMoveY && dy !== 0) {
    const isNearTopScreenEdge = player.y < edgeThreshold;
    const isNearBottomScreenEdge =
      player.y > HEIGHT - player.height - edgeThreshold;

    if (
      desiredMapY >= minMapY &&
      desiredMapY <= maxMapY &&
      !((isNearTopScreenEdge && dy > 0) || (isNearBottomScreenEdge && dy < 0))
    ) {
      map.y = desiredMapY;
      player.y = centerY;
    } else {
      player.y = Math.max(0, Math.min(HEIGHT - player.height, desiredPlayerY));
      map.y = Math.max(minMapY, Math.min(maxMapY, map.y));
    }
  }

  console.log("MovePlayer result:", {
    playerX: player.x,
    playerY: player.y,
    mapX: map.x,
    mapY: map.y,
  });

  return entities;

  function checkCollision(dx: number, dy: number): boolean {
    "worklet";
    const nextPlayerX = player.x + dx;
    const nextPlayerY = player.y + dy;

    const tileSize = map.tileSize;
    const left = nextPlayerX - map.x;
    const right = nextPlayerX + player.width - map.x;
    const top = nextPlayerY - map.y;
    const bottom = nextPlayerY + player.height - map.y;

    const tileLeft = Math.floor(left / tileSize);
    const tileRight = Math.floor(right / tileSize);
    const tileTop = Math.floor(top / tileSize);
    const tileBottom = Math.floor(bottom / tileSize);

    for (let tileY = tileTop; tileY <= tileBottom; tileY++) {
      for (let tileX = tileLeft; tileX <= tileRight; tileX++) {
        if (
          tileX < 0 ||
          tileX >= map.tiles[0].length ||
          tileY < 0 ||
          tileY >= map.tiles.length
        ) {
          return false;
        }
        if (impassableTiles.includes(map.tiles[tileY][tileX])) {
          return false;
        }
      }
    }

    return true;
  }
}
