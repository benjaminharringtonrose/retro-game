import { Component, ComponentType } from "./types/components";
import { System } from "./types/engine";

export class GameEngine {
  private systems: System[] = [];
  private entities: Map<number, Set<Component>> = new Map();
  private nextEntityId: number = 1;
  private isRunning: boolean = false;
  private lastTimestamp: number = 0;

  addSystem(system: System) {
    this.systems.push(system);
  }

  createEntity(): number {
    const entityId = this.nextEntityId++;
    this.entities.set(entityId, new Set());
    return entityId;
  }

  addComponent(entityId: number, component: Component) {
    const components = this.entities.get(entityId);
    if (components) {
      components.add(component);
    }
  }

  removeEntity(entityId: number) {
    this.entities.delete(entityId);
  }

  getComponent<T extends Component>(entityId: number, componentType: ComponentType): T | undefined {
    const components = this.entities.get(entityId);
    if (!components) return undefined;
    return Array.from(components).find((c) => c.type === componentType) as T;
  }

  getEntitiesWithComponents(componentTypes: ComponentType[]): number[] {
    return Array.from(this.entities.entries())
      .filter(([_, components]) => componentTypes.every((type) => Array.from(components).some((c) => c.type === type)))
      .map(([entityId]) => entityId);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTimestamp = performance.now();
    this.gameLoop();
  }

  stop() {
    this.isRunning = false;
  }

  private gameLoop = () => {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTimestamp;
    this.lastTimestamp = currentTime;

    for (const system of this.systems) {
      system.update(this, deltaTime);
    }

    requestAnimationFrame(this.gameLoop);
  };
}
