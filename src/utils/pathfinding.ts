import { TILE_SIZE } from "../constants/map";
import { Tile } from "../types";

interface Node {
  tileX: number;
  tileY: number;
  g: number; // Cost from start to current node
  h: number; // Estimated cost from current node to end
  f: number; // Total cost (g + h)
  parent: Node | null;
}

// Helper to get tile coordinates from map coordinates
export const getTileCoords = (x: number, y: number): { tileX: number; tileY: number } => ({
  tileX: Math.floor(x / TILE_SIZE),
  tileY: Math.floor(y / TILE_SIZE),
});

// Helper to get map coordinates from tile coordinates
export const getMapCoords = (tileX: number, tileY: number): { x: number; y: number } => ({
  x: tileX * TILE_SIZE + TILE_SIZE / 2,
  y: tileY * TILE_SIZE + TILE_SIZE / 2,
});

// Manhattan distance heuristic for tile coordinates
const heuristic = (nodeA: { tileX: number; tileY: number }, nodeB: { tileX: number; tileY: number }): number => {
  return Math.abs(nodeA.tileX - nodeB.tileX) + Math.abs(nodeA.tileY - nodeB.tileY);
};

// Check if a tile position is walkable
const isWalkable = (tileX: number, tileY: number, mapTiles: number[][]): boolean => {
  // Check bounds
  if (tileY < 0 || tileY >= mapTiles.length || tileX < 0 || tileX >= mapTiles[0].length) {
    return false;
  }

  const tileType = mapTiles[tileY][tileX];
  return tileType !== Tile.Tree && tileType !== Tile.Tree2;
};

// Get neighboring tiles
const getNeighbors = (node: Node, mapTiles: number[][]): Node[] => {
  // Define possible movement directions (8-directional)
  const directions = [
    { dx: 0, dy: -1, cost: 1 }, // up
    { dx: 1, dy: 0, cost: 1 }, // right
    { dx: 0, dy: 1, cost: 1 }, // down
    { dx: -1, dy: 0, cost: 1 }, // left
    { dx: 1, dy: -1, cost: 1.4 }, // up-right
    { dx: 1, dy: 1, cost: 1.4 }, // down-right
    { dx: -1, dy: 1, cost: 1.4 }, // down-left
    { dx: -1, dy: -1, cost: 1.4 }, // up-left
  ];

  const neighbors: Node[] = [];

  for (const { dx, dy, cost } of directions) {
    const newTileX = node.tileX + dx;
    const newTileY = node.tileY + dy;

    // Check if the new position is walkable
    if (isWalkable(newTileX, newTileY, mapTiles)) {
      // For diagonal movement, check if both adjacent tiles are walkable
      if (Math.abs(dx) === 1 && Math.abs(dy) === 1) {
        if (!isWalkable(node.tileX + dx, node.tileY, mapTiles) || !isWalkable(node.tileX, node.tileY + dy, mapTiles)) {
          continue;
        }
      }

      neighbors.push({
        tileX: newTileX,
        tileY: newTileY,
        g: node.g + cost,
        h: 0,
        f: 0,
        parent: node,
      });
    }
  }

  return neighbors;
};

export const findPath = (startX: number, startY: number, endX: number, endY: number, mapTiles: number[][]): { x: number; y: number }[] => {
  console.log("Finding path from", { startX, startY }, "to", { endX, endY });

  // Convert coordinates to tile positions
  const startTile = getTileCoords(startX, startY);
  const endTile = getTileCoords(endX, endY);

  console.log("Tile coordinates:", { startTile, endTile });

  // Check if start or end positions are in walls
  if (!isWalkable(startTile.tileX, startTile.tileY, mapTiles)) {
    console.error("Start position is in a wall");
    return [];
  }

  if (!isWalkable(endTile.tileX, endTile.tileY, mapTiles)) {
    console.log("End position is in a wall, finding nearest walkable tile");
    let bestTile = { tileX: endTile.tileX, tileY: endTile.tileY };
    let bestDistance = Infinity;

    // Search in a 3x3 area around the target
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const checkX = endTile.tileX + dx;
        const checkY = endTile.tileY + dy;

        if (isWalkable(checkX, checkY, mapTiles)) {
          const dist = Math.abs(dx) + Math.abs(dy);
          if (dist < bestDistance) {
            bestDistance = dist;
            bestTile = { tileX: checkX, tileY: checkY };
          }
        }
      }
    }

    if (bestDistance === Infinity) {
      console.error("No walkable tiles near end position");
      return [];
    }

    endTile.tileX = bestTile.tileX;
    endTile.tileY = bestTile.tileY;
    console.log("Using alternative end tile:", endTile);
  }

  const start: Node = {
    tileX: startTile.tileX,
    tileY: startTile.tileY,
    g: 0,
    h: heuristic(startTile, endTile),
    f: 0,
    parent: null,
  };
  start.f = start.g + start.h;

  const openSet: Node[] = [start];
  const closedSet: Set<string> = new Set();
  let iterations = 0;
  const maxIterations = 1000;

  while (openSet.length > 0 && iterations < maxIterations) {
    iterations++;

    // Find node with lowest f score
    let currentIndex = 0;
    for (let i = 1; i < openSet.length; i++) {
      if (openSet[i].f < openSet[currentIndex].f) {
        currentIndex = i;
      }
    }
    const current = openSet[currentIndex];

    // Check if we've reached the goal
    if (current.tileX === endTile.tileX && current.tileY === endTile.tileY) {
      console.log("Path found in", iterations, "iterations");
      const path: { x: number; y: number }[] = [];
      let node: Node | null = current;

      // Convert tile coordinates back to pixel coordinates for the path
      while (node) {
        const { x, y } = getMapCoords(node.tileX, node.tileY);
        path.unshift({ x, y });
        node = node.parent;
      }
      return path;
    }

    // Move current node from open to closed set
    openSet.splice(currentIndex, 1);
    closedSet.add(`${current.tileX},${current.tileY}`);

    // Get neighbors
    const neighbors = getNeighbors(current, mapTiles);
    for (const neighbor of neighbors) {
      // Skip if neighbor is in closed set
      if (closedSet.has(`${neighbor.tileX},${neighbor.tileY}`)) {
        continue;
      }

      // Calculate g score (using tile distances)
      const tentativeG = current.g + Math.sqrt(Math.pow(neighbor.tileX - current.tileX, 2) + Math.pow(neighbor.tileY - current.tileY, 2));

      // Find if the neighbor is in the open set
      const openNeighbor = openSet.find((node) => node.tileX === neighbor.tileX && node.tileY === neighbor.tileY);

      if (!openNeighbor) {
        // New node, add to open set
        neighbor.g = tentativeG;
        neighbor.h = heuristic(neighbor, endTile);
        neighbor.f = neighbor.g + neighbor.h;
        neighbor.parent = current;
        openSet.push(neighbor);
      } else if (tentativeG < openNeighbor.g) {
        // Better path found to existing node
        openNeighbor.g = tentativeG;
        openNeighbor.f = openNeighbor.g + openNeighbor.h;
        openNeighbor.parent = current;
      }
    }
  }

  console.log("No path found after", iterations, "iterations");
  return [];
};
