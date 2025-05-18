import { MovementSystem } from "./MovementSystem";
import { AnimationSystem } from "./AnimationSystem";
import { ControlSystem } from "./ControlSystem";
import { CollisionSystem } from "./CollisionSystem";
import { NPCSystem } from "./NPCSystem";
import { DialogSystem } from "./DialogSystem";
import { InteractionSystem } from "./InteractionSystem";

export { MovementSystem } from "./MovementSystem";
export { AnimationSystem } from "./AnimationSystem";
export { ControlSystem } from "./ControlSystem";
export { CollisionSystem } from "./CollisionSystem";
export { NPCSystem } from "./NPCSystem";
export { DialogSystem } from "./DialogSystem";
export { InteractionSystem } from "./InteractionSystem";

// Order matters: Controls -> Collision -> Movement -> Animation
export const Systems = [
  ControlSystem, // First handle input
  InteractionSystem, // Then handle NPC interactions
  NPCSystem, // Then update NPCs
  CollisionSystem, // Then check for potential collisions
  DialogSystem, // Handle dialog after collisions
  MovementSystem, // Apply movement respecting collision flags
  AnimationSystem, // Finally update visuals
];
