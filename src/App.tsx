import React, { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  cancelAnimation,
} from "react-native-reanimated";
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
  // Use shared values for animation
  const mapX = useSharedValue(0);
  const mapY = useSharedValue(0);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const playerCenterX = useSharedValue(WIDTH / 2);
  const playerCenterY = useSharedValue(HEIGHT / 2);

  const [direction, setDirection] = useState<Direction>(Direction.Down);
  const [isMoving, setIsMoving] = useState(false);

  const cols = staticMap[0].length;
  const rows = staticMap.length;
  const maxMapX = 0;
  const minMapX = WIDTH - cols * TILE_SIZE;
  const maxMapY = 0;
  const minMapY = HEIGHT - rows * TILE_SIZE;
  const maxOffX = WIDTH / 2 - TILE_SIZE / 2;
  const maxOffY = HEIGHT / 2 - TILE_SIZE / 2;

  // Animation styles
  const mapAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: mapX.value }, { translateY: mapY.value }],
    };
  });

  // Handle movement with Reanimated
  useEffect(() => {
    if (!isMoving) {
      // Cancel any ongoing animations when not moving
      cancelAnimation(mapX);
      cancelAnimation(mapY);
      cancelAnimation(offsetX);
      cancelAnimation(offsetY);
      return;
    }

    const interval = setInterval(() => {
      const moveStep = SPEED / 60; // Simulate 60fps movement steps

      let moveX = 0;
      let moveY = 0;

      switch (direction) {
        case Direction.Left:
          moveX = -moveStep;
          break;
        case Direction.Right:
          moveX = moveStep;
          break;
        case Direction.Up:
          moveY = -moveStep;
          break;
        case Direction.Down:
          moveY = moveStep;
          break;
      }

      if (moveX !== 0 || moveY !== 0) {
        // Calculate world position for collision detection
        const worldX = -mapX.value + WIDTH / 2 + offsetX.value + moveX;
        const worldY = -mapY.value + HEIGHT / 2 + offsetY.value + moveY;
        const col = Math.floor(worldX / TILE_SIZE);
        const row = Math.floor(worldY / TILE_SIZE);

        // Check if the tile is walkable
        const tile = staticMap[row]?.[col] as WalkableTile | undefined;
        if (tile && WALKABLE_TILES.includes(tile)) {
          // X axis movement
          if (moveX !== 0) {
            // If offset is active, handle it first
            if (offsetX.value !== 0) {
              const offsetSign = Math.sign(offsetX.value);
              const moveSign = Math.sign(moveX);

              // If moving toward center (offset and movement in opposite directions)
              if (offsetSign !== moveSign) {
                const absOffset = Math.abs(offsetX.value);
                const absMoveX = Math.abs(moveX);

                // If this movement will cross zero offset
                if (absOffset <= absMoveX) {
                  // Extra movement after crossing zero
                  const extra = moveX + offsetX.value;
                  offsetX.value = 0;

                  // Apply extra movement to map if possible
                  const candidate = mapX.value - extra;
                  if (candidate <= maxMapX && candidate >= minMapX) {
                    mapX.value = candidate;
                  } else {
                    // Map at boundary, start offset in opposite direction
                    offsetX.value = extra;
                  }
                } else {
                  // Won't cross zero yet, just reduce offset
                  offsetX.value += moveX;
                }
              } else {
                // Moving away from center, just increase offset up to max
                offsetX.value =
                  Math.sign(offsetX.value) *
                  Math.min(Math.abs(offsetX.value + moveX), maxOffX);
              }
            } else {
              // No offset active, try to move map
              const candidate = mapX.value - moveX;
              if (candidate <= maxMapX && candidate >= minMapX) {
                // Move map
                mapX.value = candidate;
              } else {
                // Map at boundary, start offset
                offsetX.value += moveX;
              }
            }
          }

          // Y axis movement (similar logic)
          if (moveY !== 0) {
            // If offset is active, handle it first
            if (offsetY.value !== 0) {
              const offsetSign = Math.sign(offsetY.value);
              const moveSign = Math.sign(moveY);

              // If moving toward center (offset and movement in opposite directions)
              if (offsetSign !== moveSign) {
                const absOffset = Math.abs(offsetY.value);
                const absMoveY = Math.abs(moveY);

                // If this movement will cross zero offset
                if (absOffset <= absMoveY) {
                  // Extra movement after crossing zero
                  const extra = moveY + offsetY.value;
                  offsetY.value = 0;

                  // Apply extra movement to map if possible
                  const candidate = mapY.value - extra;
                  if (candidate <= maxMapY && candidate >= minMapY) {
                    mapY.value = candidate;
                  } else {
                    // Map at boundary, start offset in opposite direction
                    offsetY.value = extra;
                  }
                } else {
                  // Won't cross zero yet, just reduce offset
                  offsetY.value += moveY;
                }
              } else {
                // Moving away from center, just increase offset up to max
                offsetY.value =
                  Math.sign(offsetY.value) *
                  Math.min(Math.abs(offsetY.value + moveY), maxOffY);
              }
            } else {
              // No offset active, try to move map
              const candidate = mapY.value - moveY;
              if (candidate <= maxMapY && candidate >= minMapY) {
                // Move map
                mapY.value = candidate;
              } else {
                // Map at boundary, start offset
                offsetY.value += moveY;
              }
            }
          }

          // Update player position based on offset
          playerCenterX.value = WIDTH / 2 + offsetX.value;
          playerCenterY.value = HEIGHT / 2 + offsetY.value;
        }
      }
    }, 1000 / 60); // Update at 60fps

    return () => {
      clearInterval(interval);
    };
  }, [isMoving, direction]);

  const onPressIn = (d: Direction) => {
    setDirection(d);
    setIsMoving(true);
  };

  const onPressOut = () => {
    setIsMoving(false);
  };

  return (
    <View style={styles.container}>
      <Map
        mapX={mapX}
        mapY={mapY}
        tiles={staticMap}
        tileSize={TILE_SIZE}
        mapAnimatedStyle={mapAnimatedStyle}
      />
      <Player
        direction={direction}
        isMoving={isMoving}
        centerX={playerCenterX}
        centerY={playerCenterY}
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
