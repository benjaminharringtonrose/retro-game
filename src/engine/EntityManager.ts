import { EntityConfig, EntityType } from "./types/EntityTypes";
import { ComponentFactory } from "./ComponentFactory";
import { SharedValue } from "react-native-reanimated";
import { GameEngine } from "./GameEngine";

export class EntityManager {
  private engine: GameEngine;
  private entities: Map<string, number> = new Map();
  private nextEntityId: number = 1;

  constructor(engine: GameEngine) {
    this.engine = engine;
  }

  createEntity(
    config: EntityConfig,
    sharedValues?: {
      mapX?: SharedValue<number>;
      mapY?: SharedValue<number>;
      offsetX?: SharedValue<number>;
      offsetY?: SharedValue<number>;
    }
  ): string {
    const entityId = `entity_${this.nextEntityId++}`;
    const entity = this.engine.createEntity();

    // Add components based on entity type
    const components = ComponentFactory.createComponentsFromConfig(config, sharedValues);
    components.forEach((component) => this.engine.addComponent(entity, component));

    this.entities.set(entityId, entity);
    return entityId;
  }

  removeEntity(entityId: string) {
    const entity = this.entities.get(entityId);
    if (entity !== undefined) {
      this.engine.removeEntity(entity);
      this.entities.delete(entityId);
    }
  }

  getEntity(entityId: string): number | undefined {
    return this.entities.get(entityId);
  }

  createNPC(
    config: EntityConfig & {
      position: { x: number; y: number };
      spritesheet: any;
      movementPattern?: {
        type: "patrol" | "random" | "stationary";
        points?: { x: number; y: number }[];
        radius?: number;
      };
    }
  ) {
    return this.createEntity({
      ...config,
      type: EntityType.NPC,
      isControlled: false,
    });
  }

  createPlayer(
    config: EntityConfig & {
      position: { x: number; y: number };
      spritesheet: any;
    },
    sharedValues: {
      mapX: SharedValue<number>;
      mapY: SharedValue<number>;
      offsetX: SharedValue<number>;
      offsetY: SharedValue<number>;
    }
  ) {
    return this.createEntity(
      {
        ...config,
        type: EntityType.PLAYER,
        isControlled: true,
      },
      sharedValues
    );
  }
}
