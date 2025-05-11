import React from "react";
import { View } from "react-native";
import { GameEntity } from "./types";

interface RenderProps {
  entities: { [key: string]: GameEntity };
}

/**
 * Custom renderer for game entities
 * This component handles positioning and rendering of each entity
 */
const GameRenderer: React.FC<RenderProps> = ({ entities }) => {
  return (
    <View style={{ flex: 1 }}>
      {Object.keys(entities).map((key) => {
        const entity = entities[key];

        // Log entity positions for debugging
        console.log(`Rendering ${key}:`, entity.position);

        // Skip rendering collected treasures
        if (entity.type === "treasure" && entity.collected) {
          return null;
        }

        // Add positioning to the entity's renderer
        return (
          <View
            key={key}
            style={{
              position: "absolute",
              left: entity.position.x,
              top: entity.position.y,
              width: entity.size,
              height: entity.size,
              // Apply flashing effect to player when invulnerable
              opacity:
                entity.type === "player" && entity.invulnerable
                  ? Math.floor(Date.now() / 150) % 2
                    ? 0.4
                    : 1
                  : 1,
            }}
          >
            {entity.renderer}
          </View>
        );
      })}
    </View>
  );
};

export default GameRenderer;
