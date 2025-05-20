import { Entity, SystemProps, MapType } from "../../types";
import { TILE_SIZE } from "../../constants/map";
import { DEFAULT_MAPS } from "../../constants/map";
import { Dimensions } from "react-native";
import { PORTAL_CONFIGS } from "../../config/portals";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Delay before portal can be used again (prevents immediate teleport back)
const PORTAL_COOLDOWN = 1000; // 1 second
let lastPortalUse = 0;

const calculateDistance = (x1: number, y1: number, x2: number, y2: number): number => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
};

export const PortalSystem = (entities: { [key: string]: Entity }, { time, delta = 16.666 }: SystemProps) => {
  const player = entities["player-1"];
  const map = entities["map-1"];

  if (!player?.position || !map?.position || !map.tileData) {
    return entities;
  }

  // Don't check portals during cooldown
  if (Date.now() - lastPortalUse < PORTAL_COOLDOWN) {
    return entities;
  }

  // Calculate player's current position relative to the map
  // Note that player position is the center of the player sprite
  const playerMapX = player.position.x - map.position.x;
  const playerMapY = player.position.y - map.position.y;

  // Get player size for more precise collision detection
  const playerWidth = player.dimensions?.width || TILE_SIZE * 0.6;
  const playerHeight = player.dimensions?.height || TILE_SIZE * 0.8;

  // Player's feet position (bottom-center of player)
  const playerFeetX = playerMapX;
  const playerFeetY = playerMapY + playerHeight / 4; // Slightly below center

  // Log player position occasionally
  if (time % 1000 < 16) {
    // Once per second
    console.log(`[PortalSystem] Player position: map(${playerMapX.toFixed(2)}, ${playerMapY.toFixed(2)}), feet(${playerFeetX.toFixed(2)}, ${playerFeetY.toFixed(2)})`);
  }

  // Update portal positions based on map movement
  const portals = Object.values(entities).filter((entity) => entity.id.startsWith("portal-"));

  for (const portal of portals) {
    if (!portal.absolutePosition) continue;

    // Update portal position based on map movement
    // This ensures portals stay in the same position relative to the map
    portal.position.x = portal.absolutePosition.x + map.position.x;
    portal.position.y = portal.absolutePosition.y + map.position.y;

    if (!portal.portal || !portal.portal.isActive) {
      continue;
    }

    const portalX = portal.absolutePosition.x;
    const portalY = portal.absolutePosition.y;

    // Try multiple points on the player for portal detection
    // Check both center point and feet position
    const distanceFromCenter = calculateDistance(playerMapX, playerMapY, portalX, portalY);
    const distanceFromFeet = calculateDistance(playerFeetX, playerFeetY, portalX, portalY);

    // Use the smallest distance (most likely to trigger)
    const distance = Math.min(distanceFromCenter, distanceFromFeet);

    // Debug portal distances occasionally
    if (time % 1000 < 16) {
      // Log roughly once per second
      console.log(`[PortalSystem] Portal ${portal.id}: center=${distanceFromCenter.toFixed(2)}, feet=${distanceFromFeet.toFixed(2)}, trigger=${portal.portal.triggerDistance}, portal=(${portalX}, ${portalY})`);
    }

    // Check if player is within trigger distance
    if (distance <= portal.portal.triggerDistance) {
      console.log(`[PortalSystem] Player entered portal ${portal.id}`);

      // Activate portal
      lastPortalUse = Date.now();

      // Get target map and position
      const targetMapType = portal.portal.targetMapType;
      const targetPosition = portal.portal.targetPosition;

      // Update current map type if needed
      if (map.mapType !== targetMapType) {
        // Create new map data for the target map
        const mapData = DEFAULT_MAPS[targetMapType as keyof typeof DEFAULT_MAPS];
        if (!mapData) {
          console.error(`[PortalSystem] Map type ${targetMapType} not found`);
          continue;
        }

        // Update map properties
        map.mapType = targetMapType;
        map.tileData.tiles = mapData.mapData;
        map.tileData.background = mapData.background;

        // Calculate new map dimensions
        const mapWidth = mapData.mapData[0].length * TILE_SIZE;
        const mapHeight = mapData.mapData.length * TILE_SIZE;

        // Update map dimensions and bounds
        map.dimensions.width = mapWidth;
        map.dimensions.height = mapHeight;
        map.bounds.width = mapWidth;
        map.bounds.height = mapHeight;
        map.bounds.minX = -(mapWidth - screenWidth);
        map.bounds.maxX = 0;
        map.bounds.minY = -(mapHeight - screenHeight);
        map.bounds.maxY = 0;

        // For cabin interior, we want to center the map
        if (targetMapType === MapType.CABIN_INTERIOR) {
          const centerX = screenWidth / 2;
          const centerY = screenHeight / 2;

          // Calculate offsets to center the map
          const mapOffsetX = centerX - mapWidth / 2;
          const mapOffsetY = centerY - mapHeight / 2;

          console.log(`[PortalSystem] Centering cabin interior map (${mapWidth}x${mapHeight}) with offset (${mapOffsetX}, ${mapOffsetY})`);

          // Position the map centered on screen
          map.position.x = 0; // Let the background handle centering
          map.position.y = 0; // Let the background handle centering

          // Calculate player position at entry point (just inside door)
          const adjustedPlayerX = centerX;
          const adjustedPlayerY = centerY + 100; // Position player lower on screen inside cabin

          player.position.x = adjustedPlayerX;
          player.position.y = adjustedPlayerY;

          console.log(`[PortalSystem] Player position set to (${player.position.x}, ${player.position.y})`);
        } else {
          // For other maps, position map so player appears at target position
          const centerX = screenWidth / 2;
          const centerY = screenHeight / 2;

          const mapX = centerX - targetPosition.x;
          const mapY = centerY - targetPosition.y;

          console.log(`[PortalSystem] Setting map position to (${mapX}, ${mapY}) with target (${targetPosition.x}, ${targetPosition.y})`);

          // Update map position
          map.position.x = mapX;
          map.position.y = mapY;

          // Reset player to center of screen
          player.position.x = centerX;
          player.position.y = centerY;
        }

        // Handle portal visibility for the new map
        // Hide all portals first
        Object.values(entities)
          .filter((entity) => entity.id.startsWith("portal-"))
          .forEach((entity) => {
            // Get the portal config
            const config = PORTAL_CONFIGS[entity.id];
            // Set portal active state based on whether it belongs to the new map
            if (config) {
              entity.portal.isActive = config.sourceMapType === targetMapType;
            }
          });
      }

      // Only handle one portal at a time
      break;
    }
  }

  return entities;
};
