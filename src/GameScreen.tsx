import React, { useState, useEffect } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  cancelAnimation,
  runOnJS,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Direction, Tile } from "./types";
import { Map } from "./components/Map";
import { Player } from "./components/Player";
import { DEFAULT_MAPS } from "./maps/home";

const SPEED = 200;
const TILE_SIZE = 48;
const WALKABLE_TILES = [Tile.Grass, Tile.Path] as const;
type WalkableTile = (typeof WALKABLE_TILES)[number];

export default function GameScreen() {
  const { width: wWidth, height: wHeight } = useWindowDimensions();

  // animated values
  const mapX = useSharedValue(0);
  const mapY = useSharedValue(0);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const playerCenterX = useSharedValue(wWidth / 2);
  const playerCenterY = useSharedValue(wHeight / 2);
  const padOffsetX = useSharedValue(0);
  const padOffsetY = useSharedValue(0);

  const [direction, setDirection] = useState<Direction>(Direction.Down);
  const [isMoving, setIsMoving] = useState(false);

  const cols = DEFAULT_MAPS.FOREST.mapData[0].length;
  const rows = DEFAULT_MAPS.FOREST.mapData.length;
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
      const tile = DEFAULT_MAPS.FOREST.mapData[row]?.[col] as
        | WalkableTile
        | undefined;
      if (tile === undefined || !WALKABLE_TILES.includes(tile)) {
        console.log("NOPE");
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

  const padCenterAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: padOffsetX.value },
      { translateY: padOffsetY.value },
    ],
  }));

  const padRadius = 100; // half of pad width/height
  const knobRadius = 25; // half of padCenter width/height
  const maxKnobDistance = padRadius - knobRadius; // 100 - 25 = 75

  // Pan-gesture “joystick”
  const pan = Gesture.Pan()
    .onBegin(() => {
      runOnJS(setIsMoving)(true);
    })
    .onUpdate((e) => {
      // raw translation
      let tx = e.translationX;
      let ty = e.translationY;
      // clamp vector length so knob stays inside outer circle
      const dist = Math.hypot(tx, ty);
      if (dist > maxKnobDistance) {
        const angle = Math.atan2(ty, tx);
        tx = Math.cos(angle) * maxKnobDistance;
        ty = Math.sin(angle) * maxKnobDistance;
      }
      padOffsetX.value = tx;
      padOffsetY.value = ty;

      // update direction as before
      const newDirection =
        Math.abs(tx) > Math.abs(ty)
          ? tx > 0
            ? Direction.Right
            : Direction.Left
          : ty > 0
          ? Direction.Down
          : Direction.Up;
      runOnJS(setDirection)(newDirection);
    })
    .onEnd(() => {
      // snap knob back to center
      padOffsetX.value = withTiming(0);
      padOffsetY.value = withTiming(0);
      runOnJS(setIsMoving)(false);
    })
    .onFinalize(() => {
      // ensure movement stops
      padOffsetX.value = withTiming(0);
      padOffsetY.value = withTiming(0);
      runOnJS(setIsMoving)(false);
    });

  return (
    <View style={styles.container}>
      <Map
        mapX={mapX}
        mapY={mapY}
        tiles={DEFAULT_MAPS.FOREST.mapData}
        tileSize={TILE_SIZE}
        mapAnimatedStyle={mapAnimatedStyle}
      />
      <Player
        direction={direction}
        isMoving={isMoving}
        centerX={playerCenterX}
        centerY={playerCenterY}
      />

      <GestureDetector gesture={pan}>
        <View style={styles.pad}>
          <Animated.View style={[styles.padCenter, padCenterAnimatedStyle]} />
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#222" },
  pad: {
    position: "absolute",
    bottom: 10,
    left: 40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  padCenter: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
});
