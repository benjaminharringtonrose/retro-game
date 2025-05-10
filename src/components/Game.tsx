import React, { JSX, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import {
  GameEngine,
  GameEngineSystem,
  GameEngineUpdateEventOptionType,
} from "react-native-game-engine";
import TileMap from "./TileMap";
import Player from "./Player";
import NPC from "./NPC";
import Controls from "./Controls";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const TILE_SIZE = 32; // Scaled-up for mobile (16x16 sprites scaled 2x)

// Simple 10x10 tile map: 0 = grass, 1 = path
const map: number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
  [0, 1, 0, 1, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

interface GameProps {
  screenWidth: number;
  screenHeight: number;
}

interface PlayerEntity {
  x: number;
  y: number;
  direction: "up" | "down" | "left" | "right";
  renderer: JSX.Element;
}

interface NPCEntity {
  x: number;
  y: number;
  renderer: JSX.Element;
}

interface MapEntity {
  renderer: JSX.Element;
}

interface CameraEntity {
  x: number;
  y: number;
}

interface Entities {
  map: MapEntity;
  player: PlayerEntity;
  npc: NPCEntity;
  camera: CameraEntity;
}

const Game: React.FC<GameProps> = ({ screenWidth, screenHeight }) => {
  const [dialogue, setDialogue] = useState<string | null>(null);

  // Calculate camera offset to keep player centered
  const getCameraOffset = (
    playerX: number,
    playerY: number
  ): { cameraX: number; cameraY: number } => {
    const centerX = screenWidth / 2 - TILE_SIZE / 2;
    const centerY = screenHeight / 2 - TILE_SIZE / 2;
    const mapWidth = map[0].length * TILE_SIZE;
    const mapHeight = map.length * TILE_SIZE;

    // Calculate desired camera position
    let cameraX = centerX - playerX * TILE_SIZE;
    let cameraY = centerY - playerY * TILE_SIZE;

    // Clamp camera to prevent showing beyond map edges
    cameraX = Math.min(0, Math.max(cameraX, screenWidth - mapWidth));
    cameraY = Math.min(0, Math.max(cameraY, screenHeight - mapHeight));

    return { cameraX, cameraY };
  };

  // Define control button regions (approximate, based on Controls.js layout)
  const BUTTON_SIZE = 40; // From Controls.js button style
  const INTERACT_SIZE = 50; // From Controls.js interact button
  const CONTROLS_RIGHT = SCREEN_WIDTH - 20 - INTERACT_SIZE - 5 - BUTTON_SIZE;
  const CONTROLS_BOTTOM = SCREEN_HEIGHT - 20;
  const controlRegions = {
    up: {
      x: CONTROLS_RIGHT - BUTTON_SIZE / 2,
      y: CONTROLS_BOTTOM - BUTTON_SIZE * 2 - 10,
      width: BUTTON_SIZE,
      height: BUTTON_SIZE,
    },
    left: {
      x: CONTROLS_RIGHT - BUTTON_SIZE - 5 - BUTTON_SIZE / 2,
      y: CONTROLS_BOTTOM - BUTTON_SIZE - 5,
      width: BUTTON_SIZE,
      height: BUTTON_SIZE,
    },
    right: {
      x: CONTROLS_RIGHT + 5 + BUTTON_SIZE / 2,
      y: CONTROLS_BOTTOM - BUTTON_SIZE - 5,
      width: BUTTON_SIZE,
      height: BUTTON_SIZE,
    },
    down: {
      x: CONTROLS_RIGHT - BUTTON_SIZE / 2,
      y: CONTROLS_BOTTOM - BUTTON_SIZE,
      width: BUTTON_SIZE,
      height: BUTTON_SIZE,
    },
    interact: {
      x: CONTROLS_RIGHT + BUTTON_SIZE + 10 + INTERACT_SIZE / 2,
      y: CONTROLS_BOTTOM - INTERACT_SIZE / 2 - 5,
      width: INTERACT_SIZE,
      height: INTERACT_SIZE,
    },
  };

  // Map touch coordinates to control action
  const getControlFromTouch = (pageX: number, pageY: number): string | null => {
    for (const [control, region] of Object.entries(controlRegions)) {
      if (
        pageX >= region.x - region.width / 2 &&
        pageX <= region.x + region.width / 2 &&
        pageY >= region.y - region.height / 2 &&
        pageY <= region.y + region.height / 2
      ) {
        return control;
      }
    }
    return null;
  };

  // Game engine systems (update logic)
  const systems: GameEngineSystem[] = [
    (
      entities: Entities,
      { touches }: GameEngineUpdateEventOptionType
    ): Entities => {
      const player = entities.player;
      touches
        .filter((t) => t.type === "press")
        .forEach((t) => {
          const control = getControlFromTouch(t.event.pageX, t.event.pageY);
          if (!control) return;

          let newX = player.x;
          let newY = player.y;
          let newDirection = player.direction;

          if (
            control === "up" &&
            player.y > 0 &&
            map[player.y - 1][player.x] !== 0
          ) {
            newY -= 1;
            newDirection = "up";
          } else if (
            control === "down" &&
            player.y < map.length - 1 &&
            map[player.y + 1][player.x] !== 0
          ) {
            newY += 1;
            newDirection = "down";
          } else if (
            control === "left" &&
            player.x > 0 &&
            map[player.y][player.x - 1] !== 0
          ) {
            newX -= 1;
            newDirection = "left";
          } else if (
            control === "right" &&
            player.x < map[0].length - 1 &&
            map[player.y][player.x + 1] !== 0
          ) {
            newX += 1;
            newDirection = "right";
          } else if (control === "interact") {
            // Check for NPC interaction
            const npc = entities.npc;
            if (
              (player.x === npc.x && Math.abs(player.y - npc.y) === 1) ||
              (player.y === npc.y && Math.abs(player.x - npc.x) === 1)
            ) {
              setDialogue("Hi! Welcome to the Pokémon world!");
            }
          }

          // Update player position, direction, and camera
          player.x = newX;
          player.y = newY;
          player.direction = newDirection;
          const { cameraX, cameraY } = getCameraOffset(newX, newY);
          entities.camera = { x: cameraX, y: cameraY };
        });

      return entities;
    },
  ];

  // Initial camera position
  const initialCamera = getCameraOffset(1, 1); // Player starts at (1,1)

  return (
    <View style={styles.container}>
      <GameEngine
        systems={systems}
        entities={{
          map: {
            renderer: (
              <TileMap
                map={map}
                tileSize={TILE_SIZE}
                camera={{ x: initialCamera.cameraX, y: initialCamera.cameraY }}
              />
            ),
          },
          player: {
            x: 1,
            y: 1,
            direction: "down" as const,
            renderer: <Player tileSize={TILE_SIZE} direction="down" />,
          },
          npc: {
            x: 3,
            y: 3,
            renderer: (
              <NPC
                x={3}
                y={3}
                tileSize={TILE_SIZE}
                camera={{ x: initialCamera.cameraX, y: initialCamera.cameraY }}
              />
            ),
          },
          camera: { x: initialCamera.cameraX, y: initialCamera.cameraY },
        }}
      />
      <Controls />
      {dialogue && (
        <View style={styles.dialogue}>
          <Text style={styles.dialogueText}>{dialogue}</Text>
          <TouchableOpacity onPress={() => setDialogue(null)}>
            <Text style={styles.dialogueText}>Close</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dialogue: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#0f380f",
    borderWidth: 4,
    borderColor: "#8bac0f",
    padding: 10,
  },
  dialogueText: {
    color: "#9bbc0f",
    fontFamily: "monospace",
    fontSize: 16,
  },
});

export default Game;
