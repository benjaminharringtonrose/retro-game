import { Entity, SystemProps } from "../../types";

const INTERACTION_RANGE = 1; // Interaction range in tiles

export const DialogSystem = (entities: { [key: string]: Entity }, { events = [] }: SystemProps) => {
  const dialog = entities["dialog-1"];
  const player = entities["player-1"];
  const map = entities["map-1"];

  // Handle all dialog-related events
  events.forEach((event) => {
    if (event.type === "dialog-close" && event.payload.id === dialog.id) {
      // Handle dialog close
      dialog.isVisible = false;
      dialog.message = "";
    } else if (event.type === "npc-click") {
      // Show dialog when NPC is clicked and player is in range
      const npc = entities[event.payload.npcId];
      if (npc.id === "npc-lilly") {
        // Calculate distance using map-relative coordinates
        const playerMapX = player.position.x - map.position.x;
        const playerMapY = player.position.y - map.position.y;
        const npcMapX = npc.absolutePosition.x;
        const npcMapY = npc.absolutePosition.y;

        const dx = playerMapX - npcMapX;
        const dy = playerMapY - npcMapY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = map.tileData.tileSize * INTERACTION_RANGE;

        // Only show dialog if player is within range
        const inRange = distance < maxDistance;

        if (inRange) {
          dialog.isVisible = true;
          dialog.message = "I love you Ben!";
        }
      }
    }
  });

  return entities;
};
