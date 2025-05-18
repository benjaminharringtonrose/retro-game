import { Entity, SystemProps } from "../../types";

export const DialogSystem = (entities: { [key: string]: Entity }, { events = [] }: SystemProps) => {
  const dialog = entities["dialog-1"];

  // Handle all dialog-related events
  events.forEach((event) => {
    if (event.type === "dialog-close" && event.payload.id === dialog.id) {
      // Handle dialog close
      dialog.isVisible = false;
      dialog.message = "";
    } else if (event.type === "npc-click") {
      // Show dialog when NPC is clicked
      const npc = entities[event.payload.npcId];
      if (npc.id === "npc-lilly") {
        dialog.isVisible = true;
        dialog.message = "I love you Ben!";
      }
    }
  });

  return entities;
};
