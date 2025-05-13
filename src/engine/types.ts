import { SharedValue } from "react-native-reanimated";

export interface Vector2D {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  components: Set<Component>;
}

export interface Component {
  type: ComponentType;
  [key: string]: any;
}

export enum ComponentType {
  Transform = "transform",
  Sprite = "sprite",
  Animation = "animation",
  Collision = "collision",
  Input = "input",
  Movement = "movement",
}

export interface TransformComponent extends Component {
  type: ComponentType.Transform;
  position: Vector2D;
  scale: Vector2D;
  rotation: number;
}

export interface SpriteComponent extends Component {
  type: ComponentType.Sprite;
  source: any;
  width: number;
  height: number;
  animatedStyle?: any;
}

export interface AnimationComponent extends Component {
  type: ComponentType.Animation;
  frames: number;
  currentFrame: number;
  frameWidth: number;
  frameHeight: number;
  frameRate: number;
  isPlaying: boolean;
}

export interface CollisionComponent extends Component {
  type: ComponentType.Collision;
  bounds: {
    width: number;
    height: number;
  };
  solid: boolean;
}

export interface InputComponent extends Component {
  type: ComponentType.Input;
  direction: Vector2D;
  isMoving: boolean;
}

export interface MovementComponent extends Component {
  type: ComponentType.Movement;
  velocity: Vector2D;
  speed: number;
  mapX: SharedValue<number>;
  mapY: SharedValue<number>;
  offsetX: SharedValue<number>;
  offsetY: SharedValue<number>;
}
