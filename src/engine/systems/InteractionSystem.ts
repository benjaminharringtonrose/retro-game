import { GameEngine } from "../GameEngine";
import { System } from "../types/engine";
import { ComponentType, MovementComponent, InputComponent, TransformComponent } from "../types/components";
import { TILE_SIZE } from "../../constants/map";
import { CollidableEntity } from "../../types";

const INTERACTION_RADIUS = TILE_SIZE * 1.5;

export class InteractionSystem implements System {
  private npcs: CollidableEntity[];
  private onInteract?: (dialogue: string) => void;

  constructor(npcs: CollidableEntity[], onInteract?: (dialogue: string) => void) {
    this.npcs = npcs.filter((npc) => npc.type === "npc" && npc.dialogues);
    this.onInteract = onInteract;
  }

  update(engine: GameEngine, deltaTime: number): void {
    const entities = engine.getEntitiesWithComponents([ComponentType.Movement, ComponentType.Input, ComponentType.Transform]);

    // Find the player entity
    const playerEntity = entities.find((entityId) => {
      const input = engine.getComponent<InputComponent>(entityId, ComponentType.Input);
      return input?.isControlled;
    });

    if (!playerEntity) return;

    const playerTransform = engine.getComponent<TransformComponent>(playerEntity, ComponentType.Transform);
    const playerMovement = engine.getComponent<MovementComponent>(playerEntity, ComponentType.Movement);

    if (!playerTransform || !playerMovement) return;

    // Calculate player's world position
    const playerWorldX = -playerMovement.mapX.value + playerTransform.position.x + playerMovement.offsetX.value;
    const playerWorldY = -playerMovement.mapY.value + playerTransform.position.y + playerMovement.offsetY.value;

    // Check for nearby NPCs
    for (const npc of this.npcs) {
      const npcWorldX = npc.position.col * TILE_SIZE;
      const npcWorldY = npc.position.row * TILE_SIZE;

      // Calculate distance to NPC
      const dx = npcWorldX - playerWorldX;
      const dy = npcWorldY - playerWorldY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // If player is within interaction radius
      if (distance <= INTERACTION_RADIUS) {
        // Trigger dialogue
        const dialogue = npc.dialogues?.default || "...";
        this.onInteract?.(dialogue);
      }
    }
  }
}
