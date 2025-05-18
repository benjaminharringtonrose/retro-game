import { Entity, SystemProps, Direction } from "../../types";
import { TILE_SIZE } from "../../constants/map";

interface InteractionState {
  targetNPC: string | null;
  targetX: number;
  targetY: number;
  isMovingToTarget: boolean;
}

const INTERACTION_RANGE = TILE_SIZE * 0.8; // Same as dialog range

const calculateDistance = (x1: number, y1: number, x2: number, y2: number): number => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
};

const getDirectionToTarget = (currentX: number, currentY: number, targetX: number, targetY: number): Direction => {
  const dx = targetX - currentX;
  const dy = targetY - currentY;

  // Use the larger difference to determine primary direction
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? Direction.Right : Direction.Left;
  } else {
    return dy > 0 ? Direction.Down : Direction.Up;
  }
};

export const InteractionSystem = (entities: { [key: string]: Entity }, { events = [] }: SystemProps) => {
  const player = entities["player-1"];
  const map = entities["map-1"];

  // Initialize or get interaction state
  if (!player.interaction) {
    player.interaction = {
      targetNPC: null,
      targetX: 0,
      targetY: 0,
      isMovingToTarget: false,
    } as InteractionState;
  }

  // Handle NPC click events
  events.forEach((event) => {
    if (event.type === "npc-click") {
      const npcId = event.payload.npcId;
      const npc = entities[npcId];

      if (npc) {
        // Calculate target position (one tile away from NPC)
        const npcMapX = npc.absolutePosition.x;
        const npcMapY = npc.absolutePosition.y;

        // Set interaction target
        player.interaction.targetNPC = npcId;
        player.interaction.targetX = npcMapX;
        player.interaction.targetY = npcMapY;
        player.interaction.isMovingToTarget = true;
      }
    }
  });

  // Handle movement to target
  if (player.interaction.isMovingToTarget && player.interaction.targetNPC) {
    const playerMapX = player.position.x - map.position.x;
    const playerMapY = player.position.y - map.position.y;

    const distance = calculateDistance(playerMapX, playerMapY, player.interaction.targetX, player.interaction.targetY);

    if (distance <= INTERACTION_RANGE) {
      // We've reached interaction range
      player.interaction.isMovingToTarget = false;

      // Face the NPC
      const direction = getDirectionToTarget(playerMapX, playerMapY, player.interaction.targetX, player.interaction.targetY);
      player.movement.direction = direction;

      // Stop movement
      player.controls.up = false;
      player.controls.down = false;
      player.controls.left = false;
      player.controls.right = false;
      player.movement.isMoving = false;
    } else {
      // Move towards target
      const direction = getDirectionToTarget(playerMapX, playerMapY, player.interaction.targetX, player.interaction.targetY);

      // Set movement controls based on direction
      player.controls.up = direction === Direction.Up;
      player.controls.down = direction === Direction.Down;
      player.controls.left = direction === Direction.Left;
      player.controls.right = direction === Direction.Right;
      player.movement.isMoving = true;
      player.movement.direction = direction;
    }
  }

  return entities;
};
