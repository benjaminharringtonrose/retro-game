import { Entity } from "./entities";

export interface SystemProps {
  time: {
    current: number;
    delta: number;
    previous: number;
    previousDelta: number;
  };
  touches: Touch[];
  events?: GameEvent[];
  layout: {
    width: number;
    height: number;
    x: number;
    y: number;
  };
  screen: {
    width: number;
    height: number;
    fontScale: number;
    scale: number;
  };
  dispatch: (event: GameEvent) => void;
}

export interface Touch {
  id: string;
  type: "start" | "end" | "move" | "press" | "long-press";
  event: any;
  delta?: { pageX: number; pageY: number };
  pageX: number;
  pageY: number;
}

export interface GameEvent {
  type: string;
  payload?: any;
}

export interface GameState {
  entities: { [key: string]: Entity };
  time: number;
  delta: number;
}

export interface GameEngine {
  dispatch: (event: GameEvent) => void;
  entities: { [key: string]: Entity };
}

declare global {
  interface Window {
    gameEngine: GameEngine | null;
  }
}

// Helper type for systems
export type System = (entities: { [key: string]: Entity }, props: SystemProps) => { [key: string]: Entity };
