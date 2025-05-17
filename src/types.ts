export enum Direction {
  Left = "left",
  Right = "right",
  Up = "up",
  Down = "down",
}

export enum Tile {
  Grass = 0,
  Path = 1,
  Water = 2,
  Tree = 3,
  Tree2 = 3.2,
  Rock = 4,
}

export enum MapType {
  FOREST = "FOREST",
}

export interface Controls {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

export interface GameState {
  controls: Controls;
  health: number;
  rupees: number;
  hasItem: boolean;
}

export interface BaseProps {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PlayerProps extends BaseProps {
  direction: Direction;
  currentFrame: number;
}

export interface MapProps extends BaseProps {
  tileSize: number;
  tiles: number[][];
}

export interface PlayerEntity extends BaseProps {
  direction: Direction;
  isMoving: boolean;
  speed: number;
  currentFrame: number;
  renderer: React.FC<PlayerProps>;
}

export interface MapEntity extends BaseProps {
  tileSize: number;
  tiles: number[][];
  renderer: React.FC<MapProps>;
}

export interface Entities {
  player: PlayerEntity;
  map: MapEntity;
  gameState: GameState;
}

export interface MapPosition {
  x: number;
  y: number;
}

export interface CollidableEntity {
  type: string;
  position: {
    row: number;
    col: number;
  };
  sprite?: any;
  spriteScale: number;
  collision: {
    width: number;
    height: number;
    scale: number;
  };
  dialogues?: Record<string, string>;
  movementPattern?: {
    type: "patrol" | "random" | "stationary";
    points?: { row: number; col: number }[];
    radius?: number;
  };
  spritesheet?: {
    frameWidth: number;
    frameHeight: number;
    frames: number;
    frameRate: number;
    animations: {
      idle: number[];
      walk: number[];
    };
    rows: {
      down: number;
      right: number;
      up: number;
      left: number;
    };
  };
}

export interface MapData {
  name: string;
  initialPosition: MapPosition;
  mapData: number[][];
  collidableEntities?: CollidableEntity[];
  background?: any;
  bounds: {
    width: number;
    height: number;
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}

export type MapConfig = Record<MapType, MapData>;
