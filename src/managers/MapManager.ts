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
        minX: position.x,
        maxX: position.x,
        minY: position.y,
        maxY: position.y,
      };
    } else {
      // Scrolling maps have bounds based on screen size
      return {
        width,
        height,
        minX: -(width - WINDOW_WIDTH),
        maxX: 0,
        minY: -(height - WINDOW_HEIGHT),
        maxY: 0,
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
    if (!map.bounds) return false;

    const newMapX = map.position.x - deltaX;
    const newMapY = map.position.y - deltaY;

    let moved = false;

    // Check X bounds
    if (newMapX <= map.bounds.maxX && newMapX >= map.bounds.minX) {
      map.position.x = newMapX;
      moved = true;
    }

    // Check Y bounds
    if (newMapY <= map.bounds.maxY && newMapY >= map.bounds.minY) {
      map.position.y = newMapY;
      moved = true;
    }

    return moved;
  }
}

export const mapManager = MapManager.getInstance();
