export const Z_INDEX = {
  PLAYER: 200,
  OBJECT: 300,
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
