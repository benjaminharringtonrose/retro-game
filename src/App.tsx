import React, { useState, useRef, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { Direction } from "./types";
import { Map } from "./components/Map";
import { Player } from "./components/Player";
import { GameBoyButton } from "./components/GameBoyButton";
import { staticMap } from "./maps/home";
import { HEIGHT, WIDTH } from "./constants/window";

const SPEED = 200; // pixels per second
const TILE_SIZE = 48;
const WALKABLE_TILES = ["grass", "path"] as const;

type WalkableTile = (typeof WALKABLE_TILES)[number];

export default function App() {
  const [mapX, setMapX] = useState(0);
  const [mapY, setMapY] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [direction, setDirection] = useState<Direction>(Direction.Down);
  const [isMoving, setIsMoving] = useState(false);

  const rafId = useRef<number>(undefined);
  const lastTime = useRef<number>(undefined);

  // Map dimensions and bounds
  const mapCols = staticMap[0].length;
  const mapRows = staticMap.length;
  const maxX = 0;
  const minX = WIDTH - mapCols * TILE_SIZE;
  const maxY = 0;
  const minY = HEIGHT - mapRows * TILE_SIZE;

  // Player offset limits when at map edge
  const maxOffsetX = WIDTH / 2 - TILE_SIZE / 2;
  const maxOffsetY = HEIGHT / 2 - TILE_SIZE / 2;

  useEffect(() => {
    if (!isMoving) {
      cancelAnimationFrame(rafId.current!);
      lastTime.current = undefined;
      return;
    }

    const loop = (time: number) => {
      if (lastTime.current != null) {
        const dt = (time - lastTime.current) / 1000;
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

        // Horizontal movement
        if (dx !== 0) {
          setMapX((oldX) => {
            const newX = oldX + dx;
            // If within map scroll bounds, move map
            if (newX <= maxX && newX >= minX) {
              setOffsetX(0);
              return newX;
            }
            // At edge: lock map, move player offset in correct direction
            setOffsetX((old) => {
              const next = old - dx;
              return Math.max(-maxOffsetX, Math.min(maxOffsetX, next));
            });
            return oldX;
          });
        }

        // Vertical movement
        if (dy !== 0) {
          setMapY((oldY) => {
            const newY = oldY + dy;
            if (newY <= maxY && newY >= minY) {
              setOffsetY(0);
              return newY;
            }
            setOffsetY((old) => {
              const next = old - dy;
              return Math.max(-maxOffsetY, Math.min(maxOffsetY, next));
            });
            return oldY;
          });
        }
      }
      lastTime.current = time;
      rafId.current = requestAnimationFrame(loop);
    };

    rafId.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId.current!);
  }, [isMoving, direction, mapX, mapY]);

  const handlePressIn = (dir: Direction) => {
    setDirection(dir);
    setIsMoving(true);
  };
  const handlePressOut = () => {
    setIsMoving(false);
  };

  return (
    <View style={styles.container}>
      <Map x={mapX} y={mapY} tiles={staticMap} tileSize={TILE_SIZE} />

      <Player
        direction={direction}
        isMoving={isMoving}
        centerX={WIDTH / 2 + offsetX}
        centerY={HEIGHT / 2 + offsetY}
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
