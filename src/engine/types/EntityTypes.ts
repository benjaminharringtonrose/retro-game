export enum EntityType {
  PLAYER = "PLAYER",
  NPC = "NPC",
  STATIC_OBJECT = "STATIC_OBJECT",
  INTERACTIVE_OBJECT = "INTERACTIVE_OBJECT",
}

export interface EntityConfig {
  type: EntityType;
  position: { x: number; y: number };
  spritesheet?: string;
  initialDirection?: number;
  isControlled?: boolean;
  collisionBounds?: {
    width: number;
    height: number;
  };
  behaviors?: string[];
  interactionRadius?: number;
}

export interface NPCConfig extends EntityConfig {
  dialogues?: Record<string, string>;
  movementPattern?: {
    type: "patrol" | "random" | "stationary";
    points?: { x: number; y: number }[];
    radius?: number;
  };
}
