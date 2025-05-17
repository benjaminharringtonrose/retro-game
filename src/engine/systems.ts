import { GameEngineUpdateEventOptionType } from "react-native-game-engine";
import { Entities, Direction } from "../types";
import { Dimensions } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

let frameCount = 0;

const moveMap = (entities: Entities) => {
  const { map, gameState } = entities;
  const { controls } = gameState;
  const speed = 8; // Map movement speed

  if (!map || !controls) return;

  let isMoving = false;
  let newDirection = entities.player.direction;

  if (controls.up) {
    map.y += speed;
    newDirection = Direction.Up;
    isMoving = true;
  } else if (controls.down) {
    map.y -= speed;
    newDirection = Direction.Down;
    isMoving = true;
  }

  if (controls.left) {
    map.x += speed;
    newDirection = Direction.Left;
    isMoving = true;
  } else if (controls.right) {
    map.x -= speed;
    newDirection = Direction.Right;
    isMoving = true;
  }

  // Update player state
  entities.player.direction = newDirection;
  entities.player.isMoving = isMoving;

  // Update animation frame
  if (isMoving) {
    // Cycle through frames 0, 1, 2 at a slower rate
    entities.player.currentFrame = Math.floor(frameCount / 5) % 3;
  } else {
    // Use middle frame when standing still
    entities.player.currentFrame = 1;
  }

  // Keep map within bounds
  const mapWidth = map.width;
  const mapHeight = map.height;
  const padding = 32; // Padding from map edges

  map.x = Math.min(padding, Math.max(map.x, -(mapWidth - screenWidth + padding)));
  map.y = Math.min(padding, Math.max(map.y, -(mapHeight - screenHeight + padding)));
};

const GameLoop = (entities: Entities) => {
  if (!entities || !entities.player || !entities.gameState || !entities.map) {
    return entities;
  }

  // Increment frame counter
  frameCount++;

  // Move map and update player animation
  moveMap(entities);

  return entities;
};

export { GameLoop };
