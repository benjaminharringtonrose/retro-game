import React, { useState, useEffect } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { useSharedValue, useAnimatedStyle, cancelAnimation } from "react-native-reanimated";
import { Direction, Tile } from "./types";
import { Map } from "./components/Map";
import { Player } from "./components/Player";
import { DEFAULT_MAPS } from "./maps/home";
import { Pad } from "./components/Pad";
import { TILE_SIZE } from "./constants/map";

const CURRENT_MAP = "TOWN";

const SPEED = 200;

const WALKABLE_TILES = [Tile.Grass, Tile.Path] as const;
type WalkableTile = (typeof WALKABLE_TILES)[number];

export default function GameScreen() {
  const { width: wWidth, height: wHeight } = useWindowDimensions();

  // animated values
  const mapX = useSharedValue(DEFAULT_MAPS[CURRENT_MAP].initialPosition.x);
  const mapY = useSharedValue(DEFAULT_MAPS[CURRENT_MAP].initialPosition.y);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const playerCenterX = useSharedValue(wWidth / 2);
  const playerCenterY = useSharedValue(wHeight / 2);

  const [direction, setDirection] = useState(Direction.Down);
  const [isMoving, setIsMoving] = useState(false);

  const cols = DEFAULT_MAPS[CURRENT_MAP].mapData[0].length;
  const rows = DEFAULT_MAPS[CURRENT_MAP].mapData.length;
  const maxMapX = 0;
  const minMapX = wWidth - cols * TILE_SIZE;
  const maxMapY = 0;
  const minMapY = wHeight - rows * TILE_SIZE;
  const maxOffX = wWidth / 2 - TILE_SIZE / 2;
  const maxOffY = wHeight / 2 - TILE_SIZE / 2;

  const mapAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: mapX.value }, { translateY: mapY.value }],
  }));

  // Movement loop
  useEffect(() => {
    if (!isMoving) {
      cancelAnimation(mapX);
      cancelAnimation(mapY);
      cancelAnimation(offsetX);
      cancelAnimation(offsetY);
      return;
    }
    const id = setInterval(() => {
      const step = SPEED / 60;
      let dx = 0,
        dy = 0;
      switch (direction) {
        case Direction.Left:
          dx = -step;
          break;
        case Direction.Right:
          dx = step;
          break;
        case Direction.Up:
          dy = -step;
          break;
        case Direction.Down:
          dy = step;
          break;
      }
      if (dx === 0 && dy === 0) return;

      // Figure out which tile we're moving into
      const worldX = -mapX.value + wWidth / 2 + offsetX.value + dx;
      const worldY = -mapY.value + wHeight / 2 + offsetY.value + dy;
      const col = Math.floor(worldX / TILE_SIZE);
      const row = Math.floor(worldY / TILE_SIZE);
      const tile = DEFAULT_MAPS[CURRENT_MAP].mapData[row]?.[col] as WalkableTile | undefined;

      if (tile === undefined || !WALKABLE_TILES.includes(tile)) {
        return;
      }

      // --- X axis ---
      if (dx !== 0) {
        // precompute for both branches
        const absOff = Math.abs(offsetX.value);
        const absDx = Math.abs(dx);
        const offSign = Math.sign(offsetX.value);
        const mvSign = Math.sign(dx);

        if (offsetX.value !== 0) {
          if (offSign !== mvSign) {
            if (absOff <= absDx) {
              const extra = dx + offsetX.value;
              offsetX.value = 0;
              const cand = mapX.value - extra;
              if (cand <= maxMapX && cand >= minMapX) mapX.value = cand;
              else offsetX.value = extra;
            } else {
              offsetX.value += dx;
            }
          } else {
            // same direction, clamp by half-screen
            offsetX.value = offSign * Math.min(absOff + absDx, maxOffX);
          }
        } else {
          const cand = mapX.value - dx;
          if (cand <= maxMapX && cand >= minMapX) mapX.value = cand;
          else offsetX.value += dx;
        }
      }

      // --- Y axis (identical) ---
      if (dy !== 0) {
        const absOffY = Math.abs(offsetY.value);
        const absDy = Math.abs(dy);
        const offSignY = Math.sign(offsetY.value);
        const mvSignY = Math.sign(dy);

        if (offsetY.value !== 0) {
          if (offSignY !== mvSignY) {
            if (absOffY <= absDy) {
              const extra = dy + offsetY.value;
              offsetY.value = 0;
              const cand = mapY.value - extra;
              if (cand <= maxMapY && cand >= minMapY) mapY.value = cand;
              else offsetY.value = extra;
            } else {
              offsetY.value += dy;
            }
          } else {
            offsetY.value = offSignY * Math.min(absOffY + absDy, maxOffY);
          }
        } else {
          const cand = mapY.value - dy;
          if (cand <= maxMapY && cand >= minMapY) mapY.value = cand;
          else offsetY.value += dy;
        }
      }

      // update player pos
      playerCenterX.value = wWidth / 2 + offsetX.value;
      playerCenterY.value = wHeight / 2 + offsetY.value;
    }, 1000 / 60);

    return () => clearInterval(id);
  }, [isMoving, direction]);

  return (
    <View style={styles.container}>
      <Map mapX={mapX} mapY={mapY} tiles={DEFAULT_MAPS[CURRENT_MAP].mapData} tileSize={TILE_SIZE} mapAnimatedStyle={mapAnimatedStyle} />
      <Player direction={direction} isMoving={isMoving} centerX={playerCenterX} centerY={playerCenterY} />
      <Pad setIsMoving={setIsMoving} setDirection={setDirection} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#222" },
});
