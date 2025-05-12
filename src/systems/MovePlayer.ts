import { WIDTH, HEIGHT } from "../constants/window";
import { Direction, Entities, Tile } from "../types";

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

  // Define impassable tiles
  const impassableTiles = [Tile.Water, Tile.Tree, Tile.Rock];

  // Calculate desired positions
  const desiredPlayerX = player.x + dx;
  const desiredPlayerY = player.y + dy;
  const desiredMapX = map.x - dx;
  const desiredMapY = map.y - dy;

  // Check collisions for player's bounding box
  const canMoveX = dx !== 0 ? checkCollision(dx, 0) : true;
  const canMoveY = dy !== 0 ? checkCollision(0, dy) : true;

  // Horizontal movement
  const minMapX = WIDTH - map.width;
  const maxMapX = 0;
  const centerX = WIDTH / 2 - player.width / 2;
  const edgeThreshold = map.tileSize / 2; // Smaller threshold for smoother transition

  if (canMoveX && dx !== 0) {
    const isNearLeftScreenEdge = player.x < edgeThreshold;
    const isNearRightScreenEdge =
      player.x > WIDTH - player.width - edgeThreshold;

    if (
      desiredMapX >= minMapX &&
      desiredMapX <= maxMapX &&
      // Prevent map scroll and centering if near screen edge
      !(
        (
          (isNearLeftScreenEdge && dx > 0) || // Moving right from left
          (isNearRightScreenEdge && dx < 0)
        ) // Moving left from right
      )
    ) {
      // Scroll map and center player
      map.x = desiredMapX;
      player.x = centerX;
    } else {
      // Move player sprite only, clamp to screen bounds
      player.x = Math.max(0, Math.min(WIDTH - player.width, desiredPlayerX));
      // Clamp map to edges
      map.x = Math.max(minMapX, Math.min(maxMapX, map.x));
    }
  }

  // Vertical movement
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
      // Prevent map scroll and centering if near screen edge
      !(
        (
          (isNearTopScreenEdge && dy > 0) || // Moving down from top
          (isNearBottomScreenEdge && dy < 0)
        ) // Moving up from bottom
      )
    ) {
      // Scroll map and center player
      map.y = desiredMapY;
      player.y = centerY;
    } else {
      // Move player sprite only, clamp to screen bounds
      player.y = Math.max(0, Math.min(HEIGHT - player.height, desiredPlayerY));
      // Clamp map to edges
      map.y = Math.max(minMapY, Math.min(maxMapY, map.y));
    }
  }

  return entities;

  // Helper function to check collisions for the player's bounding box
  function checkCollision(dx: number, dy: number): boolean {
    // Calculate the player's bounding box at the desired position
    const nextPlayerX = player.x + dx;
    const nextPlayerY = player.y + dy;

    // Convert bounding box corners to tile coordinates
    const tileSize = map.tileSize;
    const left = nextPlayerX - map.x;
    const right = nextPlayerX + player.width - map.x;
    const top = nextPlayerY - map.y;
    const bottom = nextPlayerY + player.height - map.y;

    // Get tile coordinates for all four corners
    const tileLeft = Math.floor(left / tileSize);
    const tileRight = Math.floor(right / tileSize);
    const tileTop = Math.floor(top / tileSize);
    const tileBottom = Math.floor(bottom / tileSize);

    // Check if any corner is outside map bounds or on an impassable tile
    for (let tileY = tileTop; tileY <= tileBottom; tileY++) {
      for (let tileX = tileLeft; tileX <= tileRight; tileX++) {
        if (
          tileX < 0 ||
          tileX >= map.tiles[0].length ||
          tileY < 0 ||
          tileY >= map.tiles.length
        ) {
          return false; // Outside map bounds
        }
        if (impassableTiles.includes(map.tiles[tileY][tileX])) {
          return false; // Impassable tile
        }
      }
    }

    return true; // No collisions
  }
}
