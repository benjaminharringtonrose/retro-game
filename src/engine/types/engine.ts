import { Component, ComponentType } from "./components";

export interface IGameEngine {
  getComponent<T extends Component>(entityId: number, componentType: ComponentType): T | undefined;
  getEntitiesWithComponents(componentTypes: ComponentType[]): number[];
}

export interface System {
  update(engine: IGameEngine, deltaTime: number): void;
}
