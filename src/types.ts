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
}

export interface RenderComponent extends Component {
  renderer: React.ComponentType<any>;
}

export interface TileDataComponent extends Component {
  tileSize: number;
  tiles: number[][];
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

// Entity type
export interface Entity {
  id: string;
  [key: string]: any;
}

// Game state
export interface GameState {
  entities: { [key: string]: Entity };
  time: number;
  delta: number;
}

// System types
export interface SystemProps {
  time: number;
  delta: number;
  touches: Touch[];
  events?: GameEvent[];
  screen: { width: number; height: number };
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

// Helper type for systems
export type System = (entities: { [key: string]: Entity }, props: SystemProps) => { [key: string]: Entity };

// Map related types
export interface MapPosition {
  x: number;
  y: number;
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

export interface MapData {
  name: string;
  initialPosition: MapPosition;
  mapData: number[][];
  background: any;
  collidableEntities?: CollidableEntity[];
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

export interface MapProps {
  position: {
    x: number;
    y: number;
  };
  dimensions: {
    width: number;
    height: number;
  };
  tileData: {
    tileSize: number;
    tiles: number[][];
  };
}

export type Entities = { [key: string]: Entity };

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
