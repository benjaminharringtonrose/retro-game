import { Direction, MapType } from "./enums";
import React from "react";

// Base component types
export interface Component {
  id: string;
}

export interface PositionComponent extends Component {
  x: number;
  y: number;
}

export interface DimensionsComponent extends Component {
  width: number;
  height: number;
}

export interface MovementComponent extends Component {
  speed: number;
  direction: Direction;
  isMoving: boolean;
}

export interface AnimationComponent extends Component {
  currentFrame: number;
  frameCount: number;
  frameRate: number;
  accumulatedTime?: number;
  onImageLoad?: (assetId?: string) => void;
}

export interface RenderComponent extends Component {
  renderer: React.ComponentType<any>;
}

export interface TileDataComponent extends Component {
  tileSize: number;
  tiles: number[][];
  onImageLoad?: (assetId?: string) => void;
  background?: any;
}

export interface ControlsComponent extends Component {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

export interface StatsComponent extends Component {
  health: number;
  rupees: number;
  hasItem: boolean;
}

export interface DialogComponent extends Component {
  isVisible: boolean;
  message: string;
}

export interface PortalComponent extends Component {
  targetMapType: MapType;
  targetPosition: {
    x: number;
    y: number;
  };
  isActive: boolean;
  triggerDistance: number;
}

export interface PlayerProps {
  position: {
    x: number;
    y: number;
  };
  movement: {
    direction: Direction;
    isMoving: boolean;
  };
  animation: {
    currentFrame: number;
  };
  zIndex?: number;
}
