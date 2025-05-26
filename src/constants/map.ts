import { MapType, MapConfig } from "../types";
import { Dimensions } from "react-native";
import { logger } from "../utils/logger";

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get("window");

export const TILE_SIZE = 64;

// Helper function to calculate map position based on dimensions
const calculateMapPosition = (mapWidth: number, mapHeight: number) => {
  // Always calculate the centered position
  const x = Math.floor((WINDOW_WIDTH - mapWidth) / 2);
  const y = Math.floor((WINDOW_HEIGHT - mapHeight) / 2);

  logger.log("Map", "[Map] Calculating position for", { mapWidth, mapHeight, windowWidth: WINDOW_WIDTH, windowHeight: WINDOW_HEIGHT, x, y });

  // If map is smaller than screen, return centered position
  if (mapWidth <= WINDOW_WIDTH && mapHeight <= WINDOW_HEIGHT) {
    return { x, y };
  }

  // For larger maps, start from top-left
  return { x: 0, y: 0 };
};

export const DEFAULT_MAPS: MapConfig = {
  [MapType.FOREST]: {
    name: "Forest Path",
    background: require("../assets/forest-background.png"),
    movementType: "scroll",
    mapData: [
      [3.2, 3, 3, 3, 3, 3, 3, 3, 3.2, 3, 3, 0, 0, 0, 3, 3, 3.2, 3, 3, 3, 3.2, 3, 3, 3, 3.2, 3, 3, 3, 3, 3],
      [3, 3.2, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.2, 3, 3, 3, 3.2, 3, 3, 3, 3.2, 3, 3, 3, 3],
      [3.2, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.2, 3, 3, 3, 3.2, 3, 3, 3, 3.2, 3, 3, 3],
      [3, 3.2, 3, 3, 3, 0, 0, 0, 3.2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.2, 3, 3, 3, 3.2, 3, 3, 3, 3.2, 3, 3],
      [3, 3, 3.2, 3, 0, 0, 0, 3.2, 3, 3.2, 3, 0, 0, 3.2, 0, 0, 0, 0, 0, 0, 3.2, 3, 3, 3, 3.2, 3, 3, 3, 3.2, 3],
      [3.2, 3, 3, 0, 0, 0, 3.2, 3, 3, 3, 3.2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.2, 3, 3, 3, 3.2, 3, 3, 3, 3],
      [3, 3.2, 0, 0, 0, 3.2, 3, 3, 0, 0, 0, 0, 0, 0, 3.2, 0, 0, 0, 0, 0, 0, 0, 3.2, 3, 3, 3, 3.2, 3, 3, 3],
      [3.2, 3, 0, 0, 3.2, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.2, 3, 3, 3, 3.2, 3, 3],
      [3, 3.2, 0, 3.2, 3, 3, 0, 0, 0, 0, 0, 0, 3.2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.2, 3, 3, 3, 3.2, 3],
      [3.2, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.2, 0, 0, 0, 0, 0, 0, 0, 3.2, 3, 3, 3, 3.2],
      [3, 3.2, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.2, 3, 3, 3],
      [3.2, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.2, 3, 3],
      [3, 3.2, 0, 0, 0, 0, 0, 0, 3.2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.2, 3],
      [3.2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3.2],
      [3, 3.2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.2, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 0, 0, 0, 3.2, 3],
      [3.2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 0, 0, 5, 5, 5, 0, 0, 0, 3, 3.2],
      [3, 3.2, 0, 0, 0, 0, 0, 0, 3.2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [3.2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [3, 3.2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.2, 3, 3],
      [3.2, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.2, 3, 3, 3],
      [3, 3.2, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.2, 0, 0, 0, 0, 0, 0, 0, 3.2, 3, 3, 3, 3.2],
      [3.2, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 3.2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.2, 3, 3, 3, 3, 3],
      [3, 3.2, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.2, 3, 3, 3, 3, 3.2, 3],
      [3.2, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 3.2, 0, 0, 0, 0, 0, 0, 0, 3.2, 3, 3, 3, 3, 3, 3, 3],
      [3, 3.2, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.2, 3, 3, 3, 3, 3, 3.2, 3, 3],
      [3.2, 3, 3, 3, 3, 3, 3, 3, 3, 3.2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.2, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      [3, 3.2, 3, 3, 3, 3, 3, 3, 3, 3, 3.2, 3, 0, 0, 0, 0, 0, 0, 3.2, 3, 3, 3, 3, 3, 3, 3, 3.2, 3, 3, 3],
      [3.2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3.2, 3, 3, 0, 0, 3.2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      [3, 3.2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3.2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3.2, 3, 3, 3],
      [3.2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3.2, 3, 3, 3.2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    ],
    get bounds() {
      const mapWidth = 30 * TILE_SIZE;
      const mapHeight = 30 * TILE_SIZE;
      return {
        width: mapWidth,
        height: mapHeight,
        minX: -(mapWidth - WINDOW_WIDTH),
        maxX: 0,
        minY: -(mapHeight - WINDOW_HEIGHT),
        maxY: 0,
      };
    },
    get initialPosition() {
      const mapWidth = 30 * TILE_SIZE;
      const mapHeight = 30 * TILE_SIZE;
      return calculateMapPosition(mapWidth, mapHeight);
    },
  },
  [MapType.CABIN_INTERIOR]: {
    name: "Cabin Interior",
    background: require("../assets/cabin-interior-1.png"),
    movementType: "fixed",
    mapData: [
      [8, 8, 8, 8, 8, 8, 8],
      [8, 8, 8, 8, 8, 8, 8],
      [8, 0, 0, 0, 0, 0, 8],
      [8, 0, 0, 0, 0, 0, 8],
      [8, 0, 0, 0, 0, 0, 8],
      [8, 0, 0, 7, 0, 0, 8],
    ],
    get bounds() {
      const mapWidth = 7 * TILE_SIZE;
      const mapHeight = 6 * TILE_SIZE;
      const position = calculateMapPosition(mapWidth, mapHeight);
      return {
        width: mapWidth,
        height: mapHeight,
        minX: position.x,
        maxX: position.x,
        minY: position.y,
        maxY: position.y,
      };
    },
    get initialPosition() {
      const mapWidth = 7 * TILE_SIZE;
      const mapHeight = 6 * TILE_SIZE;
      const position = calculateMapPosition(mapWidth, mapHeight);
      logger.log("Map", "[Map] Cabin interior initial position:", position);
      return position;
    },
  },
};
