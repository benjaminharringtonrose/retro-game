import { SharedValue } from "react-native-reanimated";

export interface Vector2D {
  x: number;
  y: number;
}

export enum ComponentType {
  Transform = "transform",
  Movement = "movement",
  Input = "input",
  Render = "render",
  Collision = "collision",
  Interaction = "interaction",
}

export interface Component {
  type: ComponentType;
}

export interface TransformComponent extends Component {
  type: ComponentType.Transform;
  position: Vector2D;
  scale: Vector2D;
  rotation: Vector2D;
}

export interface MovementComponent extends Component {
  type: ComponentType.Movement;
  mapX: SharedValue<number>;
  mapY: SharedValue<number>;
  offsetX: SharedValue<number>;
  offsetY: SharedValue<number>;
  velocity: Vector2D;
  speed: number;
}

export interface InputComponent extends Component {
  type: ComponentType.Input;
  direction: Vector2D;
  isMoving: boolean;
  isControlled: boolean;
}

export interface RenderComponent extends Component {
  type: ComponentType.Render;
  spritesheet: any;
  currentFrame: number;
  direction: Vector2D;
}

export interface CollisionComponent extends Component {
  type: ComponentType.Collision;
  bounds: {
    width: number;
    height: number;
  };
}

export interface InteractionComponent extends Component {
  type: ComponentType.Interaction;
  radius: number;
  onInteract: () => void;
}
