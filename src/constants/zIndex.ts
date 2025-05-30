export const Z_INDEX = {
  // World elements
  GROUND: 1,
  TREES: 50,
  PORTALS: 100,

  // Player and buildings
  PLAYER: 200,
  CABIN_FRONT: 300,

  // Characters and interactive elements
  NPCS: 400,
  DIALOG: 500,
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
