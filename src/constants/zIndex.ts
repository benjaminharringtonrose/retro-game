export const Z_INDEX = {
  // World elements
  GROUND: 1,
  TREES: 50,
  PORTALS: 100,

  // Buildings and structures
  BUILDING_BEHIND: 200, // Entities when behind buildings
  BUILDINGS: 250, // Base building z-index
  BUILDING_FRONT: 300, // Entities when in front of buildings

  // Characters and interactive elements
  NPCS: 400,
  ITEMS: 450,

  // UI and overlay elements
  DIALOG: 500,
  UI_OVERLAY: 600,
} as const;

// Type for valid z-index values
export type ZIndexValue = (typeof Z_INDEX)[keyof typeof Z_INDEX];

// Entity categories for z-index assignment
export const ENTITY_Z_INDEX_CATEGORIES = {
  PORTAL: "portal",
  NPC: "npc",
  BUILDING: "building",
  PLAYER: "player",
  DIALOG: "dialog",
} as const;
