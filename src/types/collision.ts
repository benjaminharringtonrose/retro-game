import { Component } from "../types";

export interface CollisionState {
  id: string;
  blocked: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
  };
}

export interface DebugBox {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface CollisionComponent extends Component {
  bounds: {
    width: number;
    height: number;
  };
  solid: boolean;
}
