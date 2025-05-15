import { Component, ComponentType } from "./types/components";
import { System, IGameEngine } from "./types/engine";

export class GameEngine implements IGameEngine {
  private systems: System[] = [];
  private entities: Map<number, Set<Component>> = new Map();
  private nextEntityId: number = 1;
  private isRunning: boolean = false;
  private lastTimestamp: number = 0;
  private componentCache: Map<string, { result: number[]; timestamp: number }> = new Map();
  private frameCount: number = 0;
  private readonly CACHE_RESET_FRAMES = 60; // Reset cache every 60 frames
  private readonly MAX_CACHE_SIZE = 100;
  private readonly CACHE_TTL = 5000; // 5 seconds TTL

  addSystem(system: System) {
    this.systems.push(system);
  }

  clearSystems() {
    this.systems = [];
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

  private cleanCache() {
    const now = performance.now();
    for (const [key, value] of this.componentCache) {
      if (now - value.timestamp > this.CACHE_TTL) {
        this.componentCache.delete(key);
      }
    }

    // If still too many entries, remove oldest
    if (this.componentCache.size > this.MAX_CACHE_SIZE) {
      const entries = Array.from(this.componentCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const toRemove = entries.slice(0, entries.length - this.MAX_CACHE_SIZE);
      for (const [key] of toRemove) {
        this.componentCache.delete(key);
      }
    }
  }

  getEntitiesWithComponents(componentTypes: ComponentType[]): number[] {
    const cacheKey = componentTypes.sort().join(",");
    const now = performance.now();

    const cached = this.componentCache.get(cacheKey);
    if (cached && now - cached.timestamp < this.CACHE_TTL) {
      return cached.result;
    }

    const result = [];
    for (const [entityId, components] of this.entities) {
      let hasAll = true;
      for (const type of componentTypes) {
        if (!Array.from(components).some((comp) => comp.type === type)) {
          hasAll = false;
          break;
        }
      }
      if (hasAll) {
        result.push(entityId);
      }
    }

    this.componentCache.set(cacheKey, { result, timestamp: now });
    this.cleanCache();
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
