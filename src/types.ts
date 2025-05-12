import { JSX } from "react";
import { SpritesMethods } from "react-native-sprites";
import { MapProps } from "./components/Map";

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
  ref: React.RefObject<SpritesMethods | null>;
  renderer: JSX.Element;
  x: number;
  y: number;
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
