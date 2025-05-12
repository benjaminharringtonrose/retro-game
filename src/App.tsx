import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { GameEngine } from "react-native-game-engine";
import { Asset } from "expo-asset";
import * as SplashScreen from "expo-splash-screen";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { Controls, Direction, Entities } from "./types";
import { Player } from "./components/Player";
import { Map } from "./components/Map";
import { MovePlayer } from "./systems/MovePlayer";
import { GameBoyButton } from "./components/GameBoyButton";
import { staticMap } from "./maps/home";
import { MOVE_SPEED, SPRITE_HEIGHT, SPRITE_WIDTH } from "./constants/sprites";

const App: React.FC = () => {
  const gameEngine = useRef<GameEngine>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [entities, setEntities] = useState<Entities | null>(null);

  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.hideAsync();
        await activateKeepAwakeAsync();

        await Asset.loadAsync([require("./assets/character-spritesheet.png")]);

        setEntities({
          player: {
            isMoving: false,
            speed: MOVE_SPEED,
            x: 0,
            y: 0,
            width: 50,
            height: 63,
            direction: Direction.Down,
            renderer: Player,
          },
          map: {
            x: 0,
            y: 0,
            width: staticMap[0].length * 48,
            height: staticMap.length * 48,
            tileSize: 48,
            tiles: staticMap,
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
            health: 3,
            rupees: 0,
            hasItem: false,
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

  const startGame = () => {
    setGameStarted(true);
  };

  const handlePressIn = (button: keyof Controls) => {
    if (entities) {
      entities.gameState.controls[button] = true;

      if (button === "a") {
        console.log("A button pressed - attack/interact");
      } else if (button === "b") {
        console.log("B button pressed - use item");
      } else if (button === "start") {
        console.log("Start button pressed - pause game");
      } else if (button === "select") {
        console.log("Select button pressed - inventory");
      }
    }
  };

  const handlePressOut = (button: keyof Controls) => {
    if (entities) {
      entities.gameState.controls[button] = false;
    }
  };

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

  if (isLoading || !entities) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />
      <View style={styles.gameContainer}>
        <View style={styles.hudContainer}>
          <View style={styles.heartContainer}>
            {Array(entities.gameState.health)
              .fill(0)
              .map((_, index) => (
                <View key={`heart-${index}`} style={styles.heart} />
              ))}
          </View>
          <View style={styles.rupeesContainer}>
            <Text style={styles.rupeesText}>
              Rupees: {entities.gameState.rupees}
            </Text>
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
              onPressIn={() => handlePressIn(Direction.Up)}
              onPressOut={() => handlePressOut(Direction.Up)}
              label="▲"
            />
            <View style={styles.dpadMiddle}>
              <GameBoyButton
                style={styles.leftButton}
                onPressIn={() => handlePressIn(Direction.Left)}
                onPressOut={() => handlePressOut(Direction.Left)}
                label="◀"
              />
              <View style={styles.dpadCenter} />
              <GameBoyButton
                style={styles.rightButton}
                onPressIn={() => handlePressIn(Direction.Right)}
                onPressOut={() => handlePressOut(Direction.Right)}
                label="▶"
              />
            </View>
            <GameBoyButton
              style={styles.downButton}
              onPressIn={() => handlePressIn(Direction.Down)}
              onPressOut={() => handlePressOut(Direction.Down)}
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
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
});

export default App;
