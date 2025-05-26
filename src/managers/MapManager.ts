import { Dimensions } from "react-native";
import { Entity, MapType } from "../types";
import { DEFAULT_MAPS, TILE_SIZE } from "../constants/map";
import { logger } from "../utils/logger";

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get("window");

class MapManager {
  private static instance: MapManager;

  private constructor() {}

  public static getInstance(): MapManager {
    if (!MapManager.instance) {
      MapManager.instance = new MapManager();
    }
    return MapManager.instance;
  }

  private calculateMapPosition(mapWidth: number, mapHeight: number) {
    // Always calculate centered position
    const x = Math.floor((WINDOW_WIDTH - mapWidth) / 2);
    const y = Math.floor((WINDOW_HEIGHT - mapHeight) / 2);

    logger.log("Map", "Calculating position for", { mapWidth, mapHeight, windowWidth: WINDOW_WIDTH, windowHeight: WINDOW_HEIGHT, x, y });
    return { x, y };
  }

  public getMapDimensions(mapType: MapType) {
    const mapData = DEFAULT_MAPS[mapType];
    const mapWidth = mapData.mapData[0].length * TILE_SIZE;
    const mapHeight = mapData.mapData.length * TILE_SIZE;
    return { width: mapWidth, height: mapHeight };
  }

  public getMapPosition(mapType: MapType) {
    const { width, height } = this.getMapDimensions(mapType);
    const mapData = DEFAULT_MAPS[mapType];

    if (mapData.movementType === "fixed") {
      // Fixed maps are always centered
      return this.calculateMapPosition(width, height);
    } else {
      // For forest map, start at a specific position
      if (mapType === MapType.FOREST) {
        return {
          x: -TILE_SIZE * 13,
          y: -TILE_SIZE * 13,
        };
      }
      // Other scrolling maps start at origin
      return { x: 0, y: 0 };
    }
  }

  public getMapBounds(mapType: MapType) {
    const { width, height } = this.getMapDimensions(mapType);
    const mapData = DEFAULT_MAPS[mapType];
    const position = this.getMapPosition(mapType);

    if (mapData.movementType === "fixed") {
      // Fixed maps have static bounds matching their position
      return {
        width,
        height,
        left: position.x,
        right: position.x,
        top: position.y,
        bottom: position.y,
      };
    } else {
      // Scrolling maps have bounds based on screen size
      return {
        width,
        height,
        left: -(width - WINDOW_WIDTH),
        right: 0,
        top: -(height - WINDOW_HEIGHT),
        bottom: 0,
      };
    }
  }

  public updateMapForType(map: Entity, mapType: MapType, player: Entity) {
    const mapData = DEFAULT_MAPS[mapType];
    if (!mapData) {
      logger.error("Map", `Map type ${mapType} not found`);
      return;
    }

    // Update map properties
    map.mapType = mapType;
    map.tileData.tiles = mapData.mapData;
    map.tileData.background = mapData.background;

    // Get dimensions and position
    const dimensions = this.getMapDimensions(mapType);
    const position = this.getMapPosition(mapType);
    const bounds = this.getMapBounds(mapType);

    // Update map dimensions and bounds
    map.dimensions.width = dimensions.width;
    map.dimensions.height = dimensions.height;
    map.bounds = bounds;

    // Set map position
    map.position.x = position.x;
    map.position.y = position.y;

    // Position player at center of screen
    player.position.x = WINDOW_WIDTH / 2;
    player.position.y = WINDOW_HEIGHT / 2;

    logger.log("Map", `Updated map to ${mapType}:`, {
      position,
      dimensions,
      bounds,
      playerPosition: { x: player.position.x, y: player.position.y },
    });
  }

  public updateMapScroll(map: Entity, deltaX: number, deltaY: number): boolean {
    if (!map.bounds) {
      logger.error("Map", "Cannot scroll map - bounds are undefined");
      return false;
    }

    const newMapX = map.position.x - deltaX;
    const newMapY = map.position.y - deltaY;

    logger.log("Map", "Attempting map scroll:", {
      currentPosition: { x: map.position.x, y: map.position.y },
      delta: { x: deltaX, y: deltaY },
      newPosition: { x: newMapX, y: newMapY },
      bounds: map.bounds,
    });

    let movedX = false;
    let movedY = false;

    // Check X bounds with a small buffer to prevent edge cases
    const X_BUFFER = 1;
    if (deltaX !== 0 && newMapX <= map.bounds.right + X_BUFFER && newMapX >= map.bounds.left - X_BUFFER) {
      const oldX = map.position.x;
      map.position.x = newMapX;
      movedX = true;
      logger.log("Map", "Map scrolled horizontally:", {
        oldX,
        newX: map.position.x,
        bounds: { left: map.bounds.left, right: map.bounds.right },
      });
    } else if (deltaX !== 0) {
      logger.log("Map", "Horizontal scroll blocked:", {
        attemptedX: newMapX,
        bounds: { left: map.bounds.left, right: map.bounds.right },
      });
    }

    // Check Y bounds with a small buffer to prevent edge cases
    const Y_BUFFER = 1;
    if (deltaY !== 0 && newMapY <= map.bounds.bottom + Y_BUFFER && newMapY >= map.bounds.top - Y_BUFFER) {
      const oldY = map.position.y;
      map.position.y = newMapY;
      movedY = true;
      logger.log("Map", "Map scrolled vertically:", {
        oldY,
        newY: map.position.y,
        bounds: { top: map.bounds.top, bottom: map.bounds.bottom },
      });
    } else if (deltaY !== 0) {
      logger.log("Map", "Vertical scroll blocked:", {
        attemptedY: newMapY,
        bounds: { top: map.bounds.top, bottom: map.bounds.bottom },
      });
    }

    // Return true if we moved in any direction
    const moved = movedX || movedY;

    logger.log("Map", "Map scroll result:", {
      moved,
      movedX,
      movedY,
      finalPosition: { x: map.position.x, y: map.position.y },
    });

    return moved;
  }
}

export const mapManager = MapManager.getInstance();
