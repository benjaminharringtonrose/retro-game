import React, { useEffect, useState } from "react";
import { Dimensions, View, StyleSheet } from "react-native";
import { Sprite } from "@kaizer433/react-native-spritesheet";

const { width, height } = Dimensions.get("window");

interface PlayerProps {
  tileSize: number;
  direction: "up" | "down" | "left" | "right";
}

interface Frame {
  filename: string;
  frame: { x: number; y: number; w: number; h: number };
}

const Player: React.FC<PlayerProps> = ({ tileSize, direction }) => {
  // All frames for 4x4 sprite sheet (32x32 pixels per frame)
  const allFrames: Frame[] = [
    // Down (row 1)
    { filename: "down_0", frame: { x: 0, y: 0, w: 32, h: 32 } },
    { filename: "down_1", frame: { x: 32, y: 0, w: 32, h: 32 } },
    { filename: "down_2", frame: { x: 64, y: 0, w: 32, h: 32 } },
    { filename: "down_3", frame: { x: 96, y: 0, w: 32, h: 32 } },
    // Up (row 2)
    { filename: "up_0", frame: { x: 0, y: 32, w: 32, h: 32 } },
    { filename: "up_1", frame: { x: 32, y: 32, w: 32, h: 32 } },
    { filename: "up_2", frame: { x: 64, y: 32, w: 32, h: 32 } },
    { filename: "up_3", frame: { x: 96, y: 32, w: 32, h: 32 } },
    // Left (row 3)
    { filename: "left_0", frame: { x: 0, y: 64, w: 32, h: 32 } },
    { filename: "left_1", frame: { x: 32, y: 64, w: 32, h: 32 } },
    { filename: "left_2", frame: { x: 64, y: 64, w: 32, h: 32 } },
    { filename: "left_3", frame: { x: 96, y: 64, w: 32, h: 32 } },
    // Right (row 4)
    { filename: "right_0", frame: { x: 0, y: 96, w: 32, h: 32 } },
    { filename: "right_1", frame: { x: 32, y: 96, w: 32, h: 32 } },
    { filename: "right_2", frame: { x: 64, y: 96, w: 32, h: 32 } },
    { filename: "right_3", frame: { x: 96, y: 96, w: 32, h: 32 } },
  ];

  // Animation frame indices for each direction
  const animations = {
    down: [0, 1, 2, 3],
    up: [4, 5, 6, 7],
    left: [8, 9, 10, 11],
    right: [12, 13, 14, 15],
  };

  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);

  // Animate based on direction
  useEffect(() => {
    const fps = 10; // Frames per second
    const frameIndices = animations[direction];
    let frameIndex = 0;

    const interval = setInterval(() => {
      frameIndex = (frameIndex + 1) % frameIndices.length;
      setCurrentFrameIndex(frameIndices[frameIndex]);
    }, 1000 / fps);

    return () => clearInterval(interval);
  }, [direction]);

  // Select the current frame
  const currentFrame = [allFrames[currentFrameIndex]];

  // Player is centered on screen
  const playerX = width / 2 - tileSize / 2;
  const playerY = height / 2 - tileSize / 2;

  return (
    <View style={[styles.container, { left: playerX, top: playerY }]}>
      <Sprite
        source={require("../assets/sprites/player.png")}
        width={tileSize}
        height={tileSize}
        spriteSheetWidth={128} // 4 frames * 32 pixels
        spriteSheetHeight={128} // 4 rows * 32 pixels
        frames={currentFrame}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
  },
});

export default Player;
