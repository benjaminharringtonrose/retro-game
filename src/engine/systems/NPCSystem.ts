import { Entity, SystemProps } from "../../types";
import { TILE_SIZE } from "../../constants/map";

export const NPCSystem = (entities: { [key: string]: Entity }, { time, delta }: SystemProps) => {
  const npcs = Object.values(entities).filter((entity) => entity.id.startsWith("npc"));
  const map = entities["map-1"];

  if (!map?.position) return entities;

  npcs.forEach((npc) => {
    if (!npc.position) return;

    // Store the absolute position (relative to map) in a new property if not set
    if (!npc.absolutePosition) {
      npc.absolutePosition = {
        x: npc.position.x - map.position.x,
        y: npc.position.y - map.position.y,
      };
    }

    // Update screen position based on map position
    npc.position.x = npc.absolutePosition.x + map.position.x;
    npc.position.y = npc.absolutePosition.y + map.position.y;
  });

  return entities;
};
