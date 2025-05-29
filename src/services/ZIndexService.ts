import { Entity } from "../types";
import { Z_INDEX, ENTITY_Z_INDEX_CATEGORIES } from "../constants/zIndex";

interface Position {
  x: number;
  y: number;
}

export class ZIndexService {
  /**
   * Determines if an entity is behind a building based on positions
   */
  static isEntityBehindBuilding(entityMapPos: Position, buildingBaseY: number): boolean {
    return entityMapPos.y < buildingBaseY;
  }

  /**
   * Extracts the entity type from an entity ID
   */
  static getEntityTypeFromId(id: string): string {
    if (id.startsWith("player-")) return ENTITY_Z_INDEX_CATEGORIES.PLAYER;
    if (id.startsWith("portal-")) return ENTITY_Z_INDEX_CATEGORIES.PORTAL;
    if (id.startsWith("npc-")) return ENTITY_Z_INDEX_CATEGORIES.NPC;
    if (id === "dialog-1") return ENTITY_Z_INDEX_CATEGORIES.DIALOG;
    if (id === "map-1") return "map";
    if (id.includes("cabin")) return ENTITY_Z_INDEX_CATEGORIES.BUILDING;
    return "unknown";
  }

  /**
   * Gets the appropriate z-index for an entity based on its position relative to buildings
   */
  static getEntityZIndex(entityType: string, isBehindBuilding: boolean = false): number {
    // Handle special cases first
    if (entityType === ENTITY_Z_INDEX_CATEGORIES.PORTAL) {
      return Z_INDEX.PORTALS;
    }
    if (entityType === ENTITY_Z_INDEX_CATEGORIES.NPC) {
      return Z_INDEX.NPCS;
    }
    if (entityType === ENTITY_Z_INDEX_CATEGORIES.DIALOG) {
      return Z_INDEX.DIALOG;
    }
    if (entityType === ENTITY_Z_INDEX_CATEGORIES.BUILDING) {
      return Z_INDEX.BUILDINGS;
    }

    // Handle player z-index based on building position
    if (entityType === ENTITY_Z_INDEX_CATEGORIES.PLAYER) {
      return isBehindBuilding ? Z_INDEX.BUILDING_BEHIND : Z_INDEX.BUILDING_FRONT;
    }

    // Default z-index for unknown entities
    return Z_INDEX.GROUND;
  }

  /**
   * Updates z-indices for all entities in the game world
   */
  static updateEntityZIndices(entities: { [key: string]: Entity }, playerMapPos: Position, buildingPositions: { baseY: number }[]): void {
    // First, handle buildings and determine player position relative to them
    let isPlayerBehindAnyBuilding = false;

    buildingPositions.forEach(({ baseY }) => {
      if (this.isEntityBehindBuilding(playerMapPos, baseY)) {
        isPlayerBehindAnyBuilding = true;
      }
    });

    // Update z-indices for all entities
    Object.entries(entities).forEach(([id, entity]) => {
      const entityType = this.getEntityTypeFromId(id);
      entity.zIndex = this.getEntityZIndex(entityType, isPlayerBehindAnyBuilding);
    });
  }
}
