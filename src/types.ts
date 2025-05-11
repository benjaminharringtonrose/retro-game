// types.ts - Type definitions for our game
import React from "react";

// Define point structure for positions and directions
export interface Point {
  x: number;
  y: number;
}

// Enum for entity types
export enum EntityType {
  PLAYER = "player",
  ENEMY = "enemy",
  OBSTACLE = "obstacle",
  TREASURE = "treasure",
}

// Base entity interface
export interface Entity {
  type: EntityType;
  position: Point;
  size: number;
  renderer: React.ReactNode;
}

// Player entity
export interface PlayerEntity extends Entity {
  type: EntityType.PLAYER;
  speed: number;
  health: number;
  score: number;
  direction: Point;
  invulnerable: boolean;
  invulnerableTime: number;
}

// Enemy entity
export interface EnemyEntity extends Entity {
  type: EntityType.ENEMY;
  speed: number;
  direction: Point;
  movementPattern: "horizontal" | "vertical" | "follow";
  patrolDistance: number;
  startPosition: Point;
}

// Obstacle entity (like trees)
export interface ObstacleEntity extends Entity {
  type: EntityType.OBSTACLE;
}

// Treasure entity
export interface TreasureEntity extends Entity {
  type: EntityType.TREASURE;
  collected: boolean;
}

// Union type for all possible entities
export type GameEntity =
  | PlayerEntity
  | EnemyEntity
  | ObstacleEntity
  | TreasureEntity;

// Entities collection indexed by unique string ids
export interface Entities {
  [key: string]: GameEntity;
}

// Game event options
export interface GameEvent {
  type: string;
  [key: string]: any;
}

// Game status type
export type GameStatus =
  | "ready"
  | "playing"
  | "paused"
  | "gameover"
  | "victory";

// Game engine context for system functions
export interface GameEngineContext {
  touches: TouchEvent[];
  time: { current: number; delta: number; previous: number };
  dispatch: (event: GameEvent) => void;
}

// Touch event structure
export interface TouchEvent {
  type: "start" | "end" | "move" | "press";
  id: string;
  event: any;
  delta?: Point;
  start?: Point;
}
