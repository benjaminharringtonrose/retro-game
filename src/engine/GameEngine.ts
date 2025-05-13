import { Entity, Component, ComponentType } from "./types";

export class GameEngine {
  private entities: Map<string, Entity>;
  private systems: System[];
  private isRunning: boolean;
  private lastTimestamp: number;
  private frameId: number;

  constructor() {
    this.entities = new Map();
    this.systems = [];
    this.isRunning = false;
    this.lastTimestamp = 0;
    this.frameId = 0;
  }

  addEntity(entity: Entity): void {
    this.entities.set(entity.id, entity);
  }

  removeEntity(entityId: string): void {
    this.entities.delete(entityId);
  }

  addSystem(system: System): void {
    this.systems.push(system);
  }

  getEntitiesWithComponents(componentTypes: ComponentType[]): Entity[] {
    return Array.from(this.entities.values()).filter((entity) => {
      return componentTypes.every((type) => Array.from(entity.components).some((component) => component.type === type));
    });
  }

  getComponent<T extends Component>(entity: Entity, type: ComponentType): T | undefined {
    return Array.from(entity.components).find((component) => component.type === type) as T | undefined;
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTimestamp = performance.now();
    this.gameLoop();
  }

  stop(): void {
    this.isRunning = false;
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
    }
  }

  private gameLoop = (): void => {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTimestamp) / 1000; // Convert to seconds
    this.lastTimestamp = currentTime;

    // Update all systems
    for (const system of this.systems) {
      system.update(this, deltaTime);
    }

    this.frameId = requestAnimationFrame(this.gameLoop);
  };
}

export interface System {
  update(engine: GameEngine, deltaTime: number): void;
}
