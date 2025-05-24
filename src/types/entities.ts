import { Direction, MapType } from "./enums";
import { PortalComponent } from "./components";

// Base Entity type
export interface Entity {
  id: string;
  [key: string]: any;
}

export interface NPCEntity extends Entity {
  absolutePosition: {
    x: number;
    y: number;
  };
  initialPosition: {
    x: number;
    y: number;
  };
  aiState?: {
    currentWaitTime: number;
    targetWaitTime: number;
    isWaiting: boolean;
    lastMoveTime: number;
    moveInterval: number;
  };
}

export interface PortalEntity extends Entity {
  position: {
    x: number;
    y: number;
  };
  dimensions: {
    width: number;
    height: number;
  };
  portal: PortalComponent;
  absolutePosition: {
    x: number;
    y: number;
  };
}

export interface CollidableEntity {
  type: string;
  position: { row: number; col: number };
  sprite: any;
  spriteScale: number;
  collision: {
    width: number;
    height: number;
    scale: number;
  };
}

export type Entities = { [key: string]: Entity };
