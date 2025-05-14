import { MapType } from "../../types";

export interface PortalEntryPoint {
  // The area that triggers the portal
  bounds: {
    x: number; // Relative to entity position
    y: number;
    width: number;
    height: number;
  };
  // Direction player must be moving to trigger portal
  requiredDirection?: "up" | "down" | "left" | "right";
  // Visual indicator for portal (optional)
  indicator?: {
    type: "door" | "stairs" | "custom";
    sprite?: string;
  };
}

export interface PortalDestination {
  mapType: MapType;
  position: {
    x: number;
    y: number;
  };
  // Initial direction player should face
  facingDirection?: "up" | "down" | "left" | "right";
}

export interface Portal {
  id: string;
  entryPoint: PortalEntryPoint;
  destination: PortalDestination;
  // Optional transition effect
  transition?: {
    type: "fade" | "slide" | "none";
    duration: number;
  };
}
