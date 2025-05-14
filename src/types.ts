import { MapProps } from "./components/Map";
import { PlayerProps } from "./components/Player";

export interface Controls {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  a: boolean;
  b: boolean;
  start: boolean;
  select: boolean;
}

export interface GameState {
  controls: Controls;
  health: number;
  rupees: number;
  hasItem: boolean;
}

export interface PlayerEntity {
  direction: Direction;
  isMoving: boolean;
  speed: number;
  x: number;
  y: number;
  width: number;
  height: number;
  renderer: React.FC<PlayerProps>;
}

export interface MapEntity {
  x: number;
  y: number;
  width: number;
  height: number;
  tileSize: number;
  tiles: Tile[][];
  renderer: React.FC<MapProps>;
}

export interface Entities {
  player: PlayerEntity;
  map: MapEntity;
  gameState: GameState;
}

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
  MOUNTAIN_PASS = "MOUNTAIN_PASS",
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
  sprite: any;
  scale: number;
  collision: {
    width: number;
    height: number;
  };
}

export interface MapData {
  name: string;
  initialPosition?: MapPosition;
  mapData: number[][];
  collidableEntities?: CollidableEntity[];
}

export type MapConfig = Record<MapType, MapData>;
