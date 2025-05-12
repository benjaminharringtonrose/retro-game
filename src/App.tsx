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

  const mapCols = staticMap[0].length;
  const mapRows = staticMap.length;
  const maxMapX = 0;
  const minMapX = WIDTH - mapCols * TILE_SIZE;
  const maxMapY = 0;
  const minMapY = HEIGHT - mapRows * TILE_SIZE;
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
        let moveX = 0;
        let moveY = 0;
        switch (direction) {
          case Direction.Left:
            moveX = -SPEED * dt;
            break;
          case Direction.Right:
            moveX = SPEED * dt;
            break;
          case Direction.Up:
            moveY = -SPEED * dt;
            break;
          case Direction.Down:
            moveY = SPEED * dt;
            break;
        }

        // Compute current world position
        const worldX = -mapX + WIDTH / 2 + offsetX + moveX;
        const worldY = -mapY + HEIGHT / 2 + offsetY + moveY;
        const col = Math.floor(worldX / TILE_SIZE);
        const row = Math.floor(worldY / TILE_SIZE);
        const tile = staticMap[row]?.[col] as WalkableTile | undefined;
        // Only move if next tile is walkable
        if (tile && WALKABLE_TILES.includes(tile)) {
          // Map scroll delta
          const dxMap = -moveX;
          const dyMap = -moveY;

          // Horizontal: decide map vs offset
          if (moveX !== 0) {
            const desiredMapX = mapX + dxMap;
            if (desiredMapX <= maxMapX && desiredMapX >= minMapX) {
              setMapX(desiredMapX);
              setOffsetX(0);
            } else {
              setOffsetX((old) => {
                const next = old + moveX;
                return Math.max(-maxOffsetX, Math.min(maxOffsetX, next));
              });
            }
          }

          // Vertical: decide map vs offset
          if (moveY !== 0) {
            const desiredMapY = mapY + dyMap;
            if (desiredMapY <= maxMapY && desiredMapY >= minMapY) {
              setMapY(desiredMapY);
              setOffsetY(0);
            } else {
              setOffsetY((old) => {
                const next = old + moveY;
                return Math.max(-maxOffsetY, Math.min(maxOffsetY, next));
              });
            }
          }
        }
      }
      lastTime.current = time;
      rafId.current = requestAnimationFrame(loop);
    };

    rafId.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId.current!);
  }, [isMoving, direction, mapX, mapY, offsetX, offsetY]);

  const handlePressIn = (dir: Direction) => {
    setDirection(dir);
    setIsMoving(true);
  };
  const handlePressOut = () => setIsMoving(false);

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
