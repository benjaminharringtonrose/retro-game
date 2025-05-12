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
  direction: "left" | "right" | "up" | "down";
  isMoving: boolean;
  renderer: React.FC<PlayerProps>;
}

export interface MapEntity {
  x: number;
  y: number;
  width: number;
  height: number;
  renderer: React.FC<MapProps>;
}

export interface Entities {
  player: PlayerEntity;
  map: MapEntity;
  gameState: GameState;
}
