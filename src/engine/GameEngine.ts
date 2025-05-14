import { Component, ComponentType } from "./types/components";
import { System, IGameEngine } from "./types/engine";

export class GameEngine implements IGameEngine {
  private systems: System[] = [];
  private entities: Map<number, Set<Component>> = new Map();
  private nextEntityId: number = 1;
  private isRunning: boolean = false;
  private lastTimestamp: number = 0;
  private componentCache: Map<string, number[]> = new Map();
  private frameCount: number = 0;
  private readonly CACHE_RESET_FRAMES = 60; // Reset cache every 60 frames

  addSystem(system: System) {
    this.systems.push(system);
  }

  createEntity(): number {
    const entityId = this.nextEntityId++;
    this.entities.set(entityId, new Set());
    this.componentCache.clear(); // Clear cache when entities change
    return entityId;
  }

  addComponent(entityId: number, component: Component) {
    const components = this.entities.get(entityId);
    if (components) {
      components.add(component);
      this.componentCache.clear(); // Clear cache when components change
    }
  }

  removeEntity(entityId: number) {
    this.entities.delete(entityId);
    this.componentCache.clear(); // Clear cache when entities change
  }

  getComponent<T extends Component>(entityId: number, componentType: ComponentType): T | undefined {
    const components = this.entities.get(entityId);
    if (!components) return undefined;

    // Use the iterator instead of converting to array
    for (const component of components) {
      if (component.type === componentType) {
        return component as T;
      }
    }
    return undefined;
  }

  getEntitiesWithComponents(componentTypes: ComponentType[]): number[] {
    // Create a cache key from the component types
    const cacheKey = componentTypes.sort().join(",");

    // Check if we have a cached result
    const cached = this.componentCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // If not cached, compute the result
    const result = [];
    for (const [entityId, components] of this.entities) {
      let hasAll = true;
      for (const type of componentTypes) {
        let found = false;
        for (const component of components) {
          if (component.type === type) {
            found = true;
            break;
          }
        }
        if (!found) {
          hasAll = false;
          break;
        }
      }
      if (hasAll) {
        result.push(entityId);
      }
    }

    // Cache the result
    this.componentCache.set(cacheKey, result);
    return result;
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

    // Reset cache periodically to prevent stale data
    this.frameCount++;
    if (this.frameCount >= this.CACHE_RESET_FRAMES) {
      this.componentCache.clear();
      this.frameCount = 0;
    }

    for (const system of this.systems) {
      system.update(this, deltaTime);
    }

    requestAnimationFrame(this.gameLoop);
  };
}
