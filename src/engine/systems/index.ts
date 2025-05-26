import { MovementSystem } from "./MovementSystem";
import { AnimationSystem } from "./AnimationSystem";
import { ControlSystem } from "./ControlSystem";
import { CollisionSystem } from "./CollisionSystem";
import { NPCSystem } from "./NPCSystem";
import { DialogSystem } from "./DialogSystem";
import { InteractionSystem } from "./InteractionSystem";
import { PortalSystem } from "./PortalSystem";
import { RenderingSystem } from "./RenderingSystem";
import { logger } from "../../utils/logger";

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
      logger.log("Performance", `System performance: ${JSON.stringify(systemTimes)}`);
      lastLogTime = now;
    }

    return result;
  };
};

// Create tracked versions of each system
const TrackedMovementSystem = trackSystemPerformance(MovementSystem, "Movement");
const TrackedAnimationSystem = trackSystemPerformance(AnimationSystem, "Animation");
const TrackedControlSystem = trackSystemPerformance(ControlSystem, "Control");
const TrackedCollisionSystem = trackSystemPerformance(CollisionSystem, "Collision");
const TrackedNPCSystem = trackSystemPerformance(NPCSystem, "NPC");
const TrackedDialogSystem = trackSystemPerformance(DialogSystem, "Dialog");
const TrackedInteractionSystem = trackSystemPerformance(InteractionSystem, "Interaction");
const TrackedPortalSystem = trackSystemPerformance(PortalSystem, "Portal");
const TrackedRenderingSystem = trackSystemPerformance(RenderingSystem, "Rendering");

// Order matters: Controls -> Dialog -> Interaction -> Portal -> Collision -> Movement -> Animation -> Rendering
export const Systems = [
  TrackedControlSystem, // First handle input
  TrackedDialogSystem, // Handle dialog interactions immediately
  TrackedNPCSystem, // Then update NPCs
  TrackedInteractionSystem, // Then handle walking to NPCs
  TrackedPortalSystem, // Check for portal interactions
  TrackedCollisionSystem, // Then check for potential collisions
  TrackedMovementSystem, // Apply movement respecting collision flags
  TrackedAnimationSystem, // Update visuals
  TrackedRenderingSystem, // Finally handle z-index ordering
];
