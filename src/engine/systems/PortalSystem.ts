import { Entity, SystemProps, MapType } from "../../types";
import { TILE_SIZE } from "../../constants/map";
import { PORTAL_CONFIGS } from "../../config/portals";
import { mapManager } from "../../managers/MapManager";
import { Dimensions } from "react-native";
import { createPortal } from "../entities";

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
  const playerMapX = player.position.x - map.position.x;
  const playerMapY = player.position.y - map.position.y;

  // Get player size for more precise collision detection
  const playerWidth = player.dimensions?.width || TILE_SIZE * 0.6;
  const playerHeight = player.dimensions?.height || TILE_SIZE * 0.8;

  // Player's feet position (bottom-center of player)
  const playerFeetX = playerMapX;
  const playerFeetY = playerMapY + playerHeight / 4;

  // Update portal positions based on map movement
  const portals = Object.values(entities).filter((entity) => entity.id.startsWith("portal-"));

  for (const portal of portals) {
    if (!portal.absolutePosition) continue;

    // Update portal position based on map movement
    portal.position.x = portal.absolutePosition.x + map.position.x;
    portal.position.y = portal.absolutePosition.y + map.position.y;

    if (!portal.portal || !portal.portal.isActive) {
      continue;
    }

    const portalX = portal.absolutePosition.x;
    const portalY = portal.absolutePosition.y;

    // Try multiple points on the player for portal detection
    const distanceFromCenter = calculateDistance(playerMapX, playerMapY, portalX, portalY);
    const distanceFromFeet = calculateDistance(playerFeetX, playerFeetY, portalX, portalY);

    // Use the smallest distance (most likely to trigger)
    const distance = Math.min(distanceFromCenter, distanceFromFeet);

    // Check if player is within trigger distance
    if (distance <= portal.portal.triggerDistance) {
      console.log(`[PortalSystem] Player entered portal ${portal.id}`);

      // Activate portal
      lastPortalUse = Date.now();

      // Get target map type
      const targetMapType = portal.portal.targetMapType;

      // Update current map type if needed
      if (map.mapType !== targetMapType) {
        // Use MapManager to handle the transition
        mapManager.updateMapForType(map, targetMapType, player);

        // Remove all existing portals
        Object.keys(entities).forEach((key) => {
          if (key.startsWith("portal-")) {
            delete entities[key];
          }
        });

        // Create new portals for the target map
        Object.entries(PORTAL_CONFIGS).forEach(([portalId, config]) => {
          if (config.sourceMapType === targetMapType) {
            entities[portalId] = createPortal(portalId, map.position);
          }
        });

        console.log(`[PortalSystem] Transitioned to map ${targetMapType}`);
      }

      // Only handle one portal at a time
      break;
    }
  }

  return entities;
};
