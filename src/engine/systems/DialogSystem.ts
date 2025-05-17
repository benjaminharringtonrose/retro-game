import { Entity, SystemProps } from "../../types";

export const DialogSystem = (entities: { [key: string]: Entity }, { events = [], dispatch }: SystemProps) => {
  const player = entities["player-1"];
  const npcs = Object.values(entities).filter((entity) => entity.id.startsWith("npc"));

  // Initialize dialog state if it doesn't exist
  if (!entities.dialog) {
    entities.dialog = {
      id: "dialog",
      isVisible: false,
      message: "",
      // Track if we're in range of an NPC
      inRange: false,
    };
    console.log("[DialogSystem] Initialized dialog state:", entities.dialog);
  }

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
        wasInRange: entities.dialog.inRange,
      });

      // Update dialog state based on range
      if (inRange && !entities.dialog.inRange) {
        // Just entered range
        entities.dialog.isVisible = true;
        entities.dialog.message = "I love you Ben!";
        entities.dialog.inRange = true;
        console.log("[DialogSystem] Entered range, showing dialog");

        dispatch({
          type: "entities-updated",
          payload: entities,
        });
      } else if (!inRange && entities.dialog.inRange) {
        // Just left range
        entities.dialog.isVisible = false;
        entities.dialog.message = "";
        entities.dialog.inRange = false;
        console.log("[DialogSystem] Left range, hiding dialog");

        dispatch({
          type: "entities-updated",
          payload: entities,
        });
      }
    }
  });

  return entities;
};
