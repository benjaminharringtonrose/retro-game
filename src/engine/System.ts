import { GameEngine } from "./GameEngine";

export interface System {
  update(engine: GameEngine, deltaTime: number): void;
}
