// App.tsx
import React, { useState, useRef, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { Direction } from "./types";
import { Map } from "./components/Map";
import { Player } from "./components/Player";
import { GameBoyButton } from "./components/GameBoyButton";
import { staticMap } from "./maps/home";
import { HEIGHT, WIDTH } from "./constants/window";

const SPEED = 200; // pixels per second

export default function App() {
  const [mapX, setMapX] = useState(0);
  const [mapY, setMapY] = useState(0);
  const [direction, setDirection] = useState<Direction>(Direction.Down);
  const [isMoving, setIsMoving] = useState(false);

  const rafId = useRef<number>(undefined);
  const lastTime = useRef<number>(undefined);

  // start/stop the render loop
  useEffect(() => {
    if (!isMoving) {
      cancelAnimationFrame(rafId.current!);
      lastTime.current = undefined;
      return;
    }
    const loop = (time: number) => {
      if (lastTime.current != null) {
        const dt = (time - lastTime.current) / 1000; // sec
        let dx = 0,
          dy = 0;
        switch (direction) {
          case Direction.Left:
            dx = SPEED * dt;
            break;
          case Direction.Right:
            dx = -SPEED * dt;
            break;
          case Direction.Up:
            dy = SPEED * dt;
            break;
          case Direction.Down:
            dy = -SPEED * dt;
            break;
        }
        setMapX((x) => x + dx);
        setMapY((y) => y + dy);
      }
      lastTime.current = time;
      rafId.current = requestAnimationFrame(loop);
    };
    rafId.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId.current!);
  }, [isMoving, direction]);

  const handlePressIn = (dir: Direction) => {
    setDirection(dir);
    setIsMoving(true);
  };
  const handlePressOut = () => {
    setIsMoving(false);
  };

  return (
    <View style={styles.container}>
      <Map x={mapX} y={mapY} tiles={staticMap} tileSize={48} />

      <Player
        direction={direction}
        isMoving={isMoving}
        centerX={WIDTH / 2}
        centerY={HEIGHT / 2}
      />

      <View style={styles.controls}>
        <GameBoyButton
          label="▲"
          onPressIn={() => handlePressIn(Direction.Up)}
          onPressOut={handlePressOut}
          style={styles.up}
        />
        <GameBoyButton
          label="◀"
          onPressIn={() => handlePressIn(Direction.Left)}
          onPressOut={handlePressOut}
          style={styles.left}
        />
        <GameBoyButton
          label="▶"
          onPressIn={() => handlePressIn(Direction.Right)}
          onPressOut={handlePressOut}
          style={styles.right}
        />
        <GameBoyButton
          label="▼"
          onPressIn={() => handlePressIn(Direction.Down)}
          onPressOut={handlePressOut}
          style={styles.down}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#222" },
  controls: {
    position: "absolute",
    bottom: 40,
    left: 20,
    width: 200,
    height: 200,
  },
  up: { position: "absolute", top: 0, left: 70 },
  left: { position: "absolute", top: 70, left: 0 },
  right: { position: "absolute", top: 70, left: 140 },
  down: { position: "absolute", top: 140, left: 70 },
});
