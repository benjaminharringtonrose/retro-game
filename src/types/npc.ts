import { Direction } from "../types";

export interface NPCBoundary {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface NPCBehavior {
  type: "stationary" | "patrol" | "wander";
  moveSpeed: number;
  waitTimeRange: {
    min: number;
    max: number;
  };
  moveIntervalRange: {
    min: number;
    max: number;
  };
  allowedTiles: number[];
  boundary: NPCBoundary;
}

export interface NPCSprite {
  source: any;
  width: number;
  height: number;
  scale: number;
  frameCount: number;
  frameRate: number;
  rows: {
    [key in Direction]?: number;
  };
}

export interface NPCDialogue {
  messages: string[];
  triggerDistance: number;
}

export interface NPCConfig {
  id: string;
  name: string;
  sprite: NPCSprite;
  behavior: NPCBehavior;
  dialogue?: NPCDialogue;
  initialPosition: {
    x: number;
    y: number;
  };
}
