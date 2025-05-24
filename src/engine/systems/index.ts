import { MovementSystem } from "./MovementSystem";
import { AnimationSystem } from "./AnimationSystem";
import { ControlSystem } from "./ControlSystem";
import { CollisionSystem } from "./CollisionSystem";
import { NPCSystem } from "./NPCSystem";
import { DialogSystem } from "./DialogSystem";
import { InteractionSystem } from "./InteractionSystem";
import { PortalSystem } from "./PortalSystem";

// Simple performance tracking
let lastLogTime = 0;
const LOG_INTERVAL = 1000;

// Track system execution times
const systemTimes: Record<string, number> = {};

// Higher-order function to track system performance
const trackSystemPerformance = (system: any, name: string) => {
  return (entities: any, updateArgs: any) => {
    // Start timing
    const startTime = performance.now();

    // Run the system
    const result = system(entities, updateArgs);

    // Record execution time
    const endTime = performance.now();
    systemTimes[name] = endTime - startTime;

    // Log systems taking too long (occasionally)
    const now = Date.now();
    if (now - lastLogTime > LOG_INTERVAL) {
      const totalTime = Object.values(systemTimes).reduce((sum, time) => sum + time, 0);
      console.log(`System performance: ${JSON.stringify(systemTimes)}`);
      lastLogTime = now;
    }

    return result;
  };
};

// Tracked systems
const TrackedControlSystem = trackSystemPerformance(ControlSystem, "ControlSystem");
const TrackedDialogSystem = trackSystemPerformance(DialogSystem, "DialogSystem");
const TrackedNPCSystem = trackSystemPerformance(NPCSystem, "NPCSystem");
const TrackedInteractionSystem = trackSystemPerformance(InteractionSystem, "InteractionSystem");
const TrackedCollisionSystem = trackSystemPerformance(CollisionSystem, "CollisionSystem");
const TrackedMovementSystem = trackSystemPerformance(MovementSystem, "MovementSystem");
const TrackedAnimationSystem = trackSystemPerformance(AnimationSystem, "AnimationSystem");
const TrackedPortalSystem = trackSystemPerformance(PortalSystem, "PortalSystem");

export { MovementSystem } from "./MovementSystem";
export { AnimationSystem } from "./AnimationSystem";
export { ControlSystem } from "./ControlSystem";
export { CollisionSystem } from "./CollisionSystem";
export { NPCSystem } from "./NPCSystem";
export { DialogSystem } from "./DialogSystem";
export { InteractionSystem } from "./InteractionSystem";
export { PortalSystem } from "./PortalSystem";

// Order matters: Controls -> Dialog -> Interaction -> Portal -> Collision -> Movement -> Animation
export const Systems = [
  TrackedControlSystem, // First handle input
  TrackedDialogSystem, // Handle dialog interactions immediately
  TrackedNPCSystem, // Then update NPCs
  TrackedInteractionSystem, // Then handle walking to NPCs
  TrackedPortalSystem, // Check for portal interactions
  TrackedCollisionSystem, // Then check for potential collisions
  TrackedMovementSystem, // Apply movement respecting collision flags
  TrackedAnimationSystem, // Finally update visuals
];
