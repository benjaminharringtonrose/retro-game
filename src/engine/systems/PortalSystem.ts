import { Entity, SystemProps } from "../../types";
import { TILE_SIZE } from "../../constants/map";
import { PORTAL_CONFIGS } from "../../config/portals";
import { mapManager } from "../../managers/MapManager";
import { createPortal } from "../entities";
import { logger } from "../../utils/logger";

// Delay before portal can be used again (prevents immediate teleport back)
const PORTAL_COOLDOWN = 1000; // 1 second
let lastPortalUse = 0;

const calculateDistance = (x1: number, y1: number, x2: number, y2: number): number => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
};

export const PortalSystem = (entities: { [key: string]: Entity }, { time }: SystemProps) => {
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

  const playerHeight = player.dimensions?.height || TILE_SIZE * 0.8;

  // Player's feet position (bottom-center of player)
  const playerFeetX = playerMapX;
  const playerFeetY = playerMapY + playerHeight;

  // Get all portals
  const portals = Object.values(entities).filter((entity) => entity.id.startsWith("portal-"));

  // Sync debug state from map to portals
  portals.forEach((portal) => {
    // Get the portal's fixed position from its config
    const config = PORTAL_CONFIGS[portal.id];
    if (!config) return;

    // Calculate portal's position relative to the map
    const portalMapX = config.position.x;
    const portalMapY = config.position.y;

    // Update portal's screen position based on map position
    portal.position.x = portalMapX + map.position.x;
    portal.position.y = portalMapY + map.position.y;

    portal.debug = {
      showDebug: map.debug?.showDebug || false,
      boxes: [
        {
          x: portalMapX,
          y: portalMapY + portal.dimensions.height,
          width: 10,
          height: 10,
          color: "red",
        },
        {
          x: portalMapX - portal.portal.triggerDistance,
          y: portalMapY + portal.dimensions.height - portal.portal.triggerDistance,
          width: portal.portal.triggerDistance * 2,
          height: portal.portal.triggerDistance * 2,
          color: "rgba(255, 0, 0, 0.2)",
        },
      ],
    };
  });

  for (const portal of portals) {
    if (!portal.position || !portal.portal || !portal.portal.isActive) {
      continue;
    }

    // Get the portal's config for its fixed position
    const config = PORTAL_CONFIGS[portal.id];
    if (!config) continue;

    const portalMapX = config.position.x + portal.dimensions.width / 2; // Center horizontally
    const portalMapY = config.position.y + portal.dimensions.height / 2; // Center vertically

    // Try multiple points on the player for portal detection
    const distanceFromCenter = calculateDistance(playerMapX, playerMapY, portalMapX, portalMapY);
    const distanceFromFeet = calculateDistance(playerFeetX, playerFeetY, portalMapX, portalMapY);

    // Use the smallest distance (most likely to trigger)
    const distance = Math.min(distanceFromCenter, distanceFromFeet);

    // Update debug visualization to show entrance point
    portal.debug = {
      showDebug: map.debug?.showDebug || false,
      boxes: [
        {
          x: portalMapX - 5, // Center the debug point
          y: portalMapY - 5, // Center the debug point
          width: 10,
          height: 10,
          color: "red",
        },
        {
          x: portalMapX - portal.portal.triggerDistance,
          y: portalMapY - portal.portal.triggerDistance,
          width: portal.portal.triggerDistance * 2,
          height: portal.portal.triggerDistance * 2,
          color: "rgba(255, 0, 0, 0.2)",
        },
      ],
    };

    // Check if player is within trigger distance
    if (distance <= portal.portal.triggerDistance) {
      logger.log("Portal", `Player entered portal ${portal.id}`, {
        portalMapX,
        portalMapY,
        playerFeetX,
        playerFeetY,
        distanceFromFeet,
        distanceFromCenter,
        triggerDistance: portal.portal.triggerDistance,
      });

      // Activate portal
      lastPortalUse = Date.now();

      // Get target map type
      const targetMapType = portal.portal.targetMapType;

      // Update current map type if needed
      if (map.mapType !== targetMapType) {
        // Use MapManager to handle the transition
        mapManager.updateMapForType(map, targetMapType, player);

        // Clear player's interaction state
        if (player.interaction) {
          player.interaction.targetNPC = null;
          player.interaction.targetPortal = null;
          player.interaction.isMovingToTarget = false;
          player.interaction.currentPath = [];
          player.interaction.currentPathIndex = 0;
        }

        // Stop player movement
        if (player.controls) {
          player.controls.up = false;
          player.controls.down = false;
          player.controls.left = false;
          player.controls.right = false;
        }
        if (player.movement) {
          player.movement.isMoving = false;
        }

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

        logger.log("Portal", `Transitioned to map ${targetMapType}`);
      }

      // Only handle one portal at a time
      break;
    }
  }

  return entities;
};
