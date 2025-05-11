import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { GameEngine } from "react-native-game-engine";
import { Asset } from "expo-asset";
import * as SplashScreen from "expo-splash-screen";
import { Sprites, SpritesMethods } from "react-native-sprites"; // Correct import

// Keep the screen from going to sleep
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";

// Constants
const SPRITE_SIZE = 128; // Adjust sprite size for visibility
const MOVE_SPEED = 2;
const { width: WIDTH, height: HEIGHT } = Dimensions.get("window");

// GameState interface
interface GameState {
  controls: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
    a: boolean;
    b: boolean;
    start: boolean;
    select: boolean;
  };
  health: number;
  rupees: number;
  hasItem: boolean;
}

// Player entity interface
interface PlayerEntity {
  direction: string;
  spriteSheet: SpritesMethods | null;
  renderer: React.FC<{
    x: number;
    y: number;
    spriteSheet: SpritesMethods | null;
  }>;
  x: number;
  y: number;
}

// Map entity interface
interface MapEntity {
  x: number;
  y: number;
  width: number;
  height: number;
  renderer: React.FC<{ x: number; y: number; width: number; height: number }>;
}

// Game component to move player
const MovePlayer = (entities: any, { touches, time, dispatch }: any) => {
  const { player, map, gameState } = entities;
  let movedX = 0;
  let movedY = 0;

  // Update player position based on controls
  if (gameState.controls.up) {
    movedY = -MOVE_SPEED;
    player.direction = "up";
  } else if (gameState.controls.down) {
    movedY = MOVE_SPEED;
    player.direction = "down";
  } else if (gameState.controls.left) {
    movedX = -MOVE_SPEED;
    player.direction = "left";
  } else if (gameState.controls.right) {
    movedX = MOVE_SPEED;
    player.direction = "right";
  }

  // Update player position
  player.x += movedX;
  player.y += movedY;

  // Update sprite animation based on direction
  if (player.spriteSheet && typeof player.spriteSheet.play === "function") {
    player.spriteSheet.play({
      type: player.direction,
      fps: 8,
      loop: true,
      resetAfterFinish: false,
      onFinish: () => {},
    });
  }

  return entities;
};

// Player component
const Player: React.FC<{
  x: number;
  y: number;
  spriteSheet: SpritesMethods | null;
}> = ({ x, y, spriteSheet }) => {
  return (
    <View
      style={{
        position: "absolute",
        left: x - SPRITE_SIZE / 2, // Center the player on the x-axis
        top: y - SPRITE_SIZE / 2, // Center the player on the y-axis
        zIndex: 10, // Ensure player is above map elements
      }}
    >
      <Sprites
        ref={spriteSheet}
        source={require("./assets/character-spritesheet.png")}
        columns={3} // Assuming 3 columns for movement (down, left, right, up)
        rows={4} // Assuming 4 rows for the directions
        animations={{
          down: { row: 0, startFrame: 0, endFrame: 2 },
          left: { row: 1, startFrame: 0, endFrame: 2 },
          right: { row: 2, startFrame: 0, endFrame: 2 },
          up: { row: 3, startFrame: 0, endFrame: 2 },
        }}
        offsetY={-50}
        width={SPRITE_SIZE}
        height={SPRITE_SIZE}
      />
    </View>
  );
};

// Map component
const Map: React.FC<{
  x: number;
  y: number;
  width: number;
  height: number;
}> = ({ x, y, width, height }) => {
  return (
    <View
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        height,
        backgroundColor: "#7cad6c", // Zelda-like grass color
      }}
    >
      {/* Add trees */}
      {Array(20)
        .fill()
        .map((_, i) => (
          <View
            key={`tree-${i}`}
            style={{
              position: "absolute",
              width: 48,
              height: 48,
              backgroundColor: "#2e5e1b",
              left: 100 + (i % 5) * 150,
              top: 100 + Math.floor(i / 5) * 150,
              borderRadius: 24,
            }}
          />
        ))}

      {/* Add water */}
      <View
        style={{
          position: "absolute",
          width: 200,
          height: 200,
          backgroundColor: "#3498db",
          left: 400,
          top: 300,
        }}
      />

      {/* Add rocks */}
      {Array(8)
        .fill()
        .map((_, i) => (
          <View
            key={`rock-${i}`}
            style={{
              position: "absolute",
              width: 30,
              height: 30,
              backgroundColor: "#7f8c8d",
              left: 250 + (i % 4) * 100,
              top: 200 + Math.floor(i / 4) * 100,
              borderRadius: 5,
            }}
          />
        ))}

      {/* Add a cave */}
      <View
        style={{
          position: "absolute",
          width: 60,
          height: 40,
          backgroundColor: "#34495e",
          left: 700,
          top: 500,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
        }}
      />
    </View>
  );
};

// GameBoy Button component
const GameBoyButton: React.FC<{
  onPressIn: () => void;
  onPressOut: () => void;
  label: string;
  style: object;
}> = ({ onPressIn, onPressOut, label, style }) => (
  <TouchableOpacity
    onPressIn={onPressIn}
    onPressOut={onPressOut}
    style={[styles.button, style]}
  >
    <Text style={styles.buttonText}>{label}</Text>
  </TouchableOpacity>
);

// Main App component
export default function App() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const gameEngine = useRef<GameEngine | null>(null);
  const spriteRef = useRef<SpritesMethods | null>(null); // Correct type for the sprite ref

  // Game entities
  const [entities, setEntities] = useState<{
    player: PlayerEntity;
    map: MapEntity;
    gameState: GameState;
  } | null>(null);

  // Initialize game
  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.hide();
        await activateKeepAwakeAsync();

        // Load assets
        await Asset.loadAsync([require("./assets/character-spritesheet.png")]);

        // Set up game entities
        setEntities({
          player: {
            direction: "down",
            spriteSheet: spriteRef,
            renderer: Player,
            x: WIDTH / 2, // Start at the center of the screen
            y: HEIGHT / 2, // Start at the center of the screen
          },
          map: {
            x: 0, // Starting position of map
            y: 0,
            width: 1200,
            height: 1200,
            renderer: Map,
          },
          gameState: {
            controls: {
              up: false,
              down: false,
              left: false,
              right: false,
              a: false,
              b: false,
              start: false,
              select: false,
            },
            health: 3, // Player starts with 3 hearts
            rupees: 0, // Starting currency
            hasItem: false, // If player has picked up an item
          },
        });

        setIsLoading(false);
      } catch (e) {
        console.warn(e);
      }
    }

    prepare();

    return () => {
      deactivateKeepAwake();
    };
  }, []);

  // Start game screen
  const startGame = () => {
    setGameStarted(true);
  };

  // Handle button presses
  const handlePressIn = (button: string) => {
    if (
      gameEngine.current &&
      gameEngine.current.props &&
      gameEngine.current.props.entities
    ) {
      const { gameState } = gameEngine.current.props.entities;
      gameState.controls[button as keyof typeof gameState.controls] = true;

      // Handle special actions
      if (button === "a") {
        // Sword attack or interact based on player direction
        console.log("A button pressed - attack/interact");
      } else if (button === "b") {
        // Use secondary item
        console.log("B button pressed - use item");
      } else if (button === "start") {
        // Pause game
        console.log("Start button pressed - pause game");
      } else if (button === "select") {
        // Open inventory
        console.log("Select button pressed - inventory");
      }
    }
  };

  const handlePressOut = (button: string) => {
    if (
      gameEngine.current &&
      gameEngine.current.props &&
      gameEngine.current.props.entities
    ) {
      const { gameState } = gameEngine.current.props.entities;
      gameState.controls[button as keyof typeof gameState.controls] = false;
    }
  };

  // Render start screen
  if (!gameStarted) {
    return (
      <View style={styles.startContainer}>
        <Text style={styles.titleText}>Zelda Adventure</Text>
        <TouchableOpacity style={styles.startGameButton} onPress={startGame}>
          <Text style={styles.startButtonText}>START GAME</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render loading screen
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Main game render
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />
      <View style={styles.gameContainer}>
        {/* Game HUD - Health and Rupees */}
        <View style={styles.hudContainer}>
          <View style={styles.heartContainer}>
            {Array(3)
              .fill()
              .map((_, index) => (
                <View key={`heart-${index}`} style={styles.heart} />
              ))}
          </View>
          <View style={styles.rupeesContainer}>
            <Text style={styles.rupeesText}>Rupees: 0</Text>
          </View>
        </View>

        <GameEngine
          ref={gameEngine}
          style={styles.gameEngine}
          systems={[MovePlayer]}
          entities={entities}
          running={gameStarted}
        />

        <View style={styles.controls}>
          <View style={styles.dpad}>
            <GameBoyButton
              style={styles.upButton}
              onPressIn={() => handlePressIn("up")}
              onPressOut={() => handlePressOut("up")}
              label="▲"
            />
            <View style={styles.dpadMiddle}>
              <GameBoyButton
                style={styles.leftButton}
                onPressIn={() => handlePressIn("left")}
                onPressOut={() => handlePressOut("left")}
                label="◀"
              />
              <View style={styles.dpadCenter} />
              <GameBoyButton
                style={styles.rightButton}
                onPressIn={() => handlePressIn("right")}
                onPressOut={() => handlePressOut("right")}
                label="▶"
              />
            </View>
            <GameBoyButton
              style={styles.downButton}
              onPressIn={() => handlePressIn("down")}
              onPressOut={() => handlePressOut("down")}
              label="▼"
            />
          </View>

          <View style={styles.actionButtons}>
            <GameBoyButton
              style={styles.bButton}
              onPressIn={() => handlePressIn("b")}
              onPressOut={() => handlePressOut("b")}
              label="B"
            />
            <GameBoyButton
              style={styles.aButton}
              onPressIn={() => handlePressIn("a")}
              onPressOut={() => handlePressOut("a")}
              label="A"
            />
          </View>

          <View style={styles.menuButtons}>
            <GameBoyButton
              style={styles.selectButton}
              onPressIn={() => handlePressIn("select")}
              onPressOut={() => handlePressOut("select")}
              label="SELECT"
            />
            <GameBoyButton
              style={styles.startButton}
              onPressIn={() => handlePressIn("start")}
              onPressOut={() => handlePressOut("start")}
              label="START"
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000", // Black background for authentic GameBoy feel
  },
  startContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  titleText: {
    color: "#4CAF50",
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 40,
  },
  hudContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingRight: 20,
  },
  heartContainer: {
    flexDirection: "row",
  },
  heart: {
    width: 20,
    height: 20,
    backgroundColor: "#e74c3c",
    marginRight: 5,
    borderRadius: 10,
  },
  rupeesContainer: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 5,
    borderRadius: 5,
  },
  rupeesText: {
    color: "#fff",
    fontWeight: "bold",
  },
  startGameButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#fff",
  },
  startButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  gameContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  gameEngine: {
    flex: 1,
    backgroundColor: "#7cad6c",
  },
  loadingText: {
    fontSize: 24,
    textAlign: "center",
    marginTop: 100,
  },
  controls: {
    height: 120,
    backgroundColor: "#dcdcdc",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    alignItems: "center",
  },
  dpad: {
    width: 120,
    height: 120,
    justifyContent: "space-between",
    alignItems: "center",
  },
  dpadMiddle: {
    flexDirection: "row",
    width: 120,
    justifyContent: "space-between",
    alignItems: "center",
  },
  dpadCenter: {
    width: 30,
    height: 30,
    backgroundColor: "#aaa",
    borderRadius: 15,
  },
  button: {
    width: 36,
    height: 36,
    backgroundColor: "#444",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 18,
  },
  upButton: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  leftButton: {
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  rightButton: {
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
  },
  downButton: {
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  actionButtons: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  aButton: {
    width: 50,
    height: 50,
    backgroundColor: "#e74c3c",
    borderRadius: 25,
    bottom: 10,
    left: 20,
  },
  bButton: {
    width: 50,
    height: 50,
    backgroundColor: "#e74c3c",
    borderRadius: 25,
    top: 10,
    right: 20,
  },
  menuButtons: {
    flexDirection: "row",
    width: 120,
    justifyContent: "space-between",
  },
  selectButton: {
    width: 50,
    height: 20,
    backgroundColor: "#777",
    borderRadius: 10,
  },
  startButton: {
    width: 50,
    height: 20,
    backgroundColor: "#777",
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});
