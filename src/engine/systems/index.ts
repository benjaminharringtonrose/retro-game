import { MovementSystem } from "./MovementSystem";
import { AnimationSystem } from "./AnimationSystem";
import { ControlSystem } from "./ControlSystem";
import { CollisionSystem } from "./CollisionSystem";
import { NPCSystem } from "./NPCSystem";

export { MovementSystem } from "./MovementSystem";
export { AnimationSystem } from "./AnimationSystem";
export { ControlSystem } from "./ControlSystem";
export { CollisionSystem } from "./CollisionSystem";
export { NPCSystem } from "./NPCSystem";

// Order matters: Controls -> Collision -> Movement -> Animation
export const Systems = [
  ControlSystem, // First handle input
  NPCSystem, // Then update NPCs
  CollisionSystem, // Then check for potential collisions
  MovementSystem, // Apply movement respecting collision flags
  AnimationSystem, // Finally update visuals
];
