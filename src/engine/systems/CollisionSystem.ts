import { Entity, SystemProps, Tile } from "../../types";

const isTreeTile = (tile: number): boolean => {
  return tile === Tile.Tree || tile === Tile.Tree2;
};

const isCabinTile = (tile: number): boolean => {
  return tile === Tile.Cabin;
};

const isWallTile = (tile: number): boolean => {
  return tile === Tile.Wall;
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
  const npcs = Object.values(entities).filter((entity) => entity.id.startsWith("npc"));

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

  // Check NPC collisions
  npcs.forEach((npc) => {
    if (!npc.position) return;

    // Calculate NPC position relative to map (already centered due to sprite rendering)
    const npcMapX = npc.position.x - map.position.x;
    const npcMapY = npc.position.y - map.position.y;

    // NPC collision box (same size as player)
    const npcSize = tileSize * 0.3; // Same size as player
    const npcHalfSize = npcSize / 2;

    // Since the sprite is already centered, we can use the position directly
    const npcLeft = npcMapX - npcHalfSize;
    const npcRight = npcMapX + npcHalfSize;
    const npcTop = npcMapY - npcHalfSize;
    const npcBottom = npcMapY + npcHalfSize;

    // Add NPC collision box to debug
    debugBoxes.push({
      x: npcLeft,
      y: npcTop,
      width: npcSize,
      height: npcSize,
      color: "#ff00ff",
    });

    // Check if the next position would result in a collision
    if (checkCollision(nextPlayerLeft, nextPlayerRight, nextPlayerTop, nextPlayerBottom, npcLeft, npcRight, npcTop, npcBottom)) {
      // Determine which direction to block based on current position
      if (nextPlayerRight > npcLeft && playerRight <= npcLeft) {
        player.collision.blocked.right = true;
      }
      if (nextPlayerLeft < npcRight && playerLeft >= npcRight) {
        player.collision.blocked.left = true;
      }
      if (nextPlayerBottom > npcTop && playerBottom <= npcTop) {
        player.collision.blocked.down = true;
      }
      if (nextPlayerTop < npcBottom && playerTop >= npcBottom) {
        player.collision.blocked.up = true;
      }
    }
  });

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

      if (isTreeTile(tile) || isWallTile(tile)) {
        // Calculate tile boundaries
        const tileLeft = checkX * tileSize;
        const tileRight = tileLeft + tileSize;
        const tileTop = checkY * tileSize;
        const tileBottom = tileTop + tileSize;

        // Add collision box
        debugBoxes.push({
          x: tileLeft,
          y: tileTop,
          width: tileSize,
          height: tileSize,
          color: isWallTile(tile) ? "#666666" : "#ff0000",
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
      } else if (isCabinTile(tile)) {
        // Calculate cabin boundaries (slightly smaller than visual size for better gameplay)
        const cabinScale = 2.5; // Reduced from 3 to 2.5 for collision
        const cabinSize = tileSize * cabinScale;
        const cabinOffset = (cabinSize - tileSize) / 2;
        const collisionHeight = cabinSize * 0.6; // Reduced height for better gameplay
        const verticalOffset = (cabinSize - collisionHeight) / 2; // Center the collision box vertically

        const tileLeft = checkX * tileSize - cabinOffset;
        const tileRight = tileLeft + cabinSize;
        const tileTop = checkY * tileSize - cabinSize + tileSize + verticalOffset; // Center vertically
        const tileBottom = tileTop + collisionHeight;

        // Add cabin collision box
        debugBoxes.push({
          x: tileLeft,
          y: tileTop,
          width: cabinSize,
          height: collisionHeight,
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
