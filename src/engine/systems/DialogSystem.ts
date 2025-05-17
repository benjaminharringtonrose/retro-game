import { Entity, SystemProps } from "../../types";

export const DialogSystem = (entities: { [key: string]: Entity }, { events = [] }: SystemProps) => {
  const player = entities["player-1"];
  const npcs = Object.values(entities).filter((entity) => entity.id.startsWith("npc"));
  const dialog = entities["dialog-1"];

  // Check for collisions with NPCs to trigger dialog
  npcs.forEach((npc) => {
    if (npc.id === "npc-lilly") {
      // Calculate distance between player and Lilly
      const playerMapX = player.position.x - entities["map-1"].position.x;
      const playerMapY = player.position.y - entities["map-1"].position.y;
      const lillyMapX = npc.absolutePosition.x;
      const lillyMapY = npc.absolutePosition.y;

      const dx = playerMapX - lillyMapX;
      const dy = playerMapY - lillyMapY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Use tile size * 0.8 as interaction range
      const inRange = distance < entities["map-1"].tileData.tileSize * 0.8;

      console.log("[DialogSystem] Distance to Lilly:", {
        distance,
        inRange,
        wasInRange: dialog.inRange,
      });

      // Update dialog state based on range
      if (inRange && !dialog.inRange) {
        // Just entered range
        dialog.isVisible = true;
        dialog.message = "I love you Ben!";
        dialog.inRange = true;
        console.log("[DialogSystem] Entered range, showing dialog");
      } else if (!inRange && dialog.inRange) {
        // Just left range
        dialog.isVisible = false;
        dialog.message = "";
        dialog.inRange = false;
        console.log("[DialogSystem] Left range, hiding dialog");
      }
    }
  });

  return entities;
};
