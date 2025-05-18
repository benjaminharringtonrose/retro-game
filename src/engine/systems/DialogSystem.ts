import { Entity, SystemProps } from "../../types";
import { NPC_CONFIGS } from "../../config/npcs";
import { TILE_SIZE } from "../../constants/map";

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
      const config = NPC_CONFIGS[npc.id];

      if (!config || !config.dialogue) return;

      // Calculate distance using map-relative coordinates
      const playerMapX = player.position.x - map.position.x;
      const playerMapY = player.position.y - map.position.y;
      const npcMapX = npc.absolutePosition.x;
      const npcMapY = npc.absolutePosition.y;

      const dx = playerMapX - npcMapX;
      const dy = playerMapY - npcMapY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxDistance = TILE_SIZE * config.dialogue.triggerDistance;

      // Only show dialog if player is within range
      const inRange = distance < maxDistance;

      if (inRange) {
        dialog.isVisible = true;
        // Get a random message from the NPC's dialogue options
        const messageIndex = Math.floor(Math.random() * config.dialogue.messages.length);
        dialog.message = config.dialogue.messages[messageIndex];
      }
    }
  });

  return entities;
};
