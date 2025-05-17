import { Entity, SystemProps, Tile } from "../../types";
import { TILE_SIZE } from "../../constants/map";
import { DebugRenderer } from "../../components/DebugRenderer";

const isTreeTile = (tile: number): boolean => {
  return tile === Tile.Tree || tile === Tile.Tree2;
};

const getTileCoordinates = (x: number, y: number, tileSize: number) => {
  const tileX = Math.floor(x / tileSize);
  const tileY = Math.floor(y / tileSize);
  return { tileX, tileY };
};

const checkCollision = (playerLeft: number, playerRight: number, playerTop: number, playerBottom: number, tileLeft: number, tileRight: number, tileTop: number, tileBottom: number): boolean => {
  return playerRight > tileLeft && playerLeft < tileRight && playerBottom > tileTop && playerTop < tileBottom;
};

export const CollisionSystem = (entities: { [key: string]: Entity }, { delta = 16.666 }: SystemProps) => {
  const player = entities["player-1"];
  const map = entities["map-1"];

  if (!player?.position || !map?.position || !map.tileData) {
    return entities;
  }

  // Initialize collision state if it doesn't exist
  if (!player.collision) {
    player.collision = {
      id: `${player.id}-collision`,
      blocked: {
        up: false,
        down: false,
        left: false,
        right: false,
      },
    };
  }

  const { tileSize, tiles } = map.tileData;

  // Calculate player's current position relative to the map
  const playerMapX = player.position.x - map.position.x;
  const playerMapY = player.position.y - map.position.y;

  // Player collision box (smaller than tile)
  const playerSize = tileSize * 0.3; // Player takes up 30% of tile
  const playerHalfSize = playerSize / 2;

  // Calculate the player's collision box
  const playerLeft = playerMapX - playerHalfSize;
  const playerRight = playerMapX + playerHalfSize;
  const playerTop = playerMapY - playerHalfSize;
  const playerBottom = playerMapY + playerHalfSize;

  // Reset collision state
  player.collision.blocked = {
    up: false,
    down: false,
    left: false,
    right: false,
  };

  // Initialize debug boxes array
  const debugBoxes = [];

  // Add player collision box
  debugBoxes.push({
    x: playerLeft,
    y: playerTop,
    width: playerSize,
    height: playerSize,
    color: "#00ff00",
  });

  // Calculate next position based on current controls
  const speed = player.movement.speed * (delta / 1000);
  let nextX = playerMapX;
  let nextY = playerMapY;

  if (player.controls.up) nextY -= speed;
  if (player.controls.down) nextY += speed;
  if (player.controls.left) nextX -= speed;
  if (player.controls.right) nextX += speed;

  // Calculate next position's collision box
  const nextPlayerLeft = nextX - playerHalfSize;
  const nextPlayerRight = nextX + playerHalfSize;
  const nextPlayerTop = nextY - playerHalfSize;
  const nextPlayerBottom = nextY + playerHalfSize;

  // Get the tiles to check based on next position
  const { tileX: nextTileX, tileY: nextTileY } = getTileCoordinates(nextX, nextY, tileSize);

  // Check surrounding tiles for collisions (3x3 grid around player's next position)
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const checkY = nextTileY + dy;
      const checkX = nextTileX + dx;

      // Skip if outside map bounds
      if (checkY < 0 || checkY >= tiles.length || checkX < 0 || checkX >= tiles[0].length) {
        continue;
      }

      const tile = tiles[checkY][checkX];
      if (isTreeTile(tile)) {
        // Calculate tile boundaries
        const tileLeft = checkX * tileSize;
        const tileRight = tileLeft + tileSize;
        const tileTop = checkY * tileSize;
        const tileBottom = tileTop + tileSize;

        // Add tree collision box
        debugBoxes.push({
          x: tileLeft,
          y: tileTop,
          width: tileSize,
          height: tileSize,
          color: "#ff0000",
        });

        // Check if the next position would result in a collision
        if (checkCollision(nextPlayerLeft, nextPlayerRight, nextPlayerTop, nextPlayerBottom, tileLeft, tileRight, tileTop, tileBottom)) {
          // Determine which direction to block based on current position
          if (nextPlayerRight > tileLeft && playerRight <= tileLeft) {
            player.collision.blocked.right = true;
          }
          if (nextPlayerLeft < tileRight && playerLeft >= tileRight) {
            player.collision.blocked.left = true;
          }
          if (nextPlayerBottom > tileTop && playerBottom <= tileTop) {
            player.collision.blocked.down = true;
          }
          if (nextPlayerTop < tileBottom && playerTop >= tileBottom) {
            player.collision.blocked.up = true;
          }
        }
      }
    }
  }

  // Update map's debug boxes
  if (!map.debug) {
    map.debug = { boxes: [] };
  }
  map.debug.boxes = debugBoxes;

  return entities;
};
