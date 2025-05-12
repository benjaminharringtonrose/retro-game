import React, { useState, useRef, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { Direction } from "./types";
import { Map } from "./components/Map";
import { Player } from "./components/Player";
import { GameBoyButton } from "./components/GameBoyButton";
import { staticMap } from "./maps/home";
import { HEIGHT, WIDTH } from "./constants/window";

const SPEED = 200;
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
  const raf = useRef<number>(undefined);
  const last = useRef<number>(undefined);

  const cols = staticMap[0].length;
  const rows = staticMap.length;
  const maxMapX = 0;
  const minMapX = WIDTH - cols * TILE_SIZE;
  const maxMapY = 0;
  const minMapY = HEIGHT - rows * TILE_SIZE;
  const maxOffX = WIDTH / 2 - TILE_SIZE / 2;
  const maxOffY = HEIGHT / 2 - TILE_SIZE / 2;

  useEffect(() => {
    if (!isMoving) {
      cancelAnimationFrame(raf.current!);
      last.current = undefined;
      return;
    }
    const step = (time: number) => {
      if (last.current != null) {
        const dt = (time - last.current) / 1000;
        let moveX = 0,
          moveY = 0;
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
        if (moveX !== 0 || moveY !== 0) {
          // compute world tile position
          const worldX = -mapX + WIDTH / 2 + offsetX + moveX;
          const worldY = -mapY + HEIGHT / 2 + offsetY + moveY;
          const col = Math.floor(worldX / TILE_SIZE);
          const row = Math.floor(worldY / TILE_SIZE);
          const tile = staticMap[row]?.[col] as WalkableTile | undefined;
          if (tile && WALKABLE_TILES.includes(tile)) {
            // X axis
            if (moveX !== 0) {
              // If offset active
              if (offsetX !== 0) {
                const remaining = Math.abs(offsetX) - Math.abs(moveX);
                if (remaining > 0) {
                  // just reduce offset
                  setOffsetX((old) => old + moveX);
                } else {
                  // offset crosses zero: clear and apply extra to map
                  const extra = moveX + offsetX * (moveX > 0 ? 1 : -1);
                  setOffsetX(0);
                  setMapX((old) => {
                    const candidate = old - extra;
                    return Math.max(minMapX, Math.min(maxMapX, candidate));
                  });
                }
              } else {
                // scroll map if possible, else start offset
                setMapX((old) => {
                  const candidate = old - moveX;
                  if (candidate <= maxMapX && candidate >= minMapX) {
                    return candidate;
                  }
                  // start offset
                  setOffsetX((of) =>
                    Math.max(-maxOffX, Math.min(maxOffX, of + moveX))
                  );
                  return old;
                });
              }
            }
            // Y axis (same logic)
            if (moveY !== 0) {
              if (offsetY !== 0) {
                const remaining = Math.abs(offsetY) - Math.abs(moveY);
                if (remaining > 0) {
                  setOffsetY((old) => old + moveY);
                } else {
                  const extra = moveY + offsetY * (moveY > 0 ? 1 : -1);
                  setOffsetY(0);
                  setMapY((old) => {
                    const candidate = old - extra;
                    return Math.max(minMapY, Math.min(maxMapY, candidate));
                  });
                }
              } else {
                setMapY((old) => {
                  const candidate = old - moveY;
                  if (candidate <= maxMapY && candidate >= minMapY) {
                    return candidate;
                  }
                  setOffsetY((of) =>
                    Math.max(-maxOffY, Math.min(maxOffY, of + moveY))
                  );
                  return old;
                });
              }
            }
          }
        }
      }
      last.current = time;
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current!);
  }, [isMoving, direction, mapX, mapY, offsetX, offsetY]);

  const onPressIn = (d: Direction) => {
    setDirection(d);
    setIsMoving(true);
  };
  const onPressOut = () => setIsMoving(false);

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
          onPressIn={() => onPressIn(Direction.Up)}
          onPressOut={onPressOut}
          style={styles.up}
        />
        <GameBoyButton
          label="◀"
          onPressIn={() => onPressIn(Direction.Left)}
          onPressOut={onPressOut}
          style={styles.left}
        />
        <GameBoyButton
          label="▶"
          onPressIn={() => onPressIn(Direction.Right)}
          onPressOut={onPressOut}
          style={styles.right}
        />
        <GameBoyButton
          label="▼"
          onPressIn={() => onPressIn(Direction.Down)}
          onPressOut={onPressOut}
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
