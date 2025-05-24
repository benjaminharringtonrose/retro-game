import { Direction } from "./enums";
import { GameEvent } from "./system";

export interface PlayerProps {
  position: {
    x: number;
    y: number;
  };
  movement: {
    direction: Direction;
    isMoving: boolean;
    speed: number;
  };
  animation: {
    currentFrame: number;
    frameCount: number;
    frameRate: number;
  };
}

export interface NPCProps {
  id: string;
  position: {
    x: number;
    y: number;
  };
  movement: {
    direction: Direction;
    isMoving: boolean;
    speed: number;
    bounds: {
      minX: number;
      maxX: number;
      minY: number;
      maxY: number;
    };
  };
  animation: {
    currentFrame: number;
    frameCount: number;
    frameRate: number;
    onImageLoad?: (assetId?: string) => void;
  };
  onInteract?: () => GameEvent;
}

export interface DialogProps {
  message: string;
  isVisible: boolean;
  onClose?: () => void;
}

export interface DialogState {
  isVisible: boolean;
  message: string;
}
