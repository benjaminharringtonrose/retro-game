import React, { forwardRef, useEffect, useRef } from "react";
import { useWindowDimensions, View } from "react-native";
import { Sprites, SpritesMethods } from "react-native-sprites";
import { SPRITE_HEIGHT, SPRITE_WIDTH } from "../constants/sprites";

export interface PlayerProps {
  x: number;
  y: number;
  direction: "up" | "down" | "left" | "right";
}

export const Player = forwardRef<SpritesMethods, PlayerProps>(
  ({ x, y, direction }, ref) => {
    const { width, height } = useWindowDimensions();
    useEffect(() => {
      console.log("DIRECTIONNNNN", direction);
    }, [direction]);
    // useEffect(() => {
    //   console.log(
    //     `Player rendered with direction: ${direction}, x: ${x}, y: ${y}`
    //   );
    //   if (spriteRef.current) {
    //     console.log(`Playing animation for direction: ${direction}`);
    //     spriteRef.current.play({
    //       type: direction,
    //       fps: 12,
    //       loop: true,
    //       resetAfterFinish: false,
    //       onFinish: () => console.log(`Animation ${direction} finished`),
    //     });
    //   }
    // }, [direction]);

    // useEffect(() => {
    //   // Stop animation and set idle frame when component unmounts
    //   return () => {
    //     if (spriteRef.current) {
    //       spriteRef.current.stop();
    //     }
    //   };
    // }, []);

    return (
      <View
        style={{
          position: "absolute",
          left: width / 2 - 20,
          top: height / 2 - 80,
          zIndex: 10,
        }}
      >
        <Sprites
          ref={ref}
          source={require("../assets/character-spritesheet.png")}
          columns={3}
          rows={4}
          animations={{
            down: { row: 0, startFrame: 0, endFrame: 2 },
            left: { row: 1, startFrame: 0, endFrame: 2 },
            up: { row: 2, startFrame: 0, endFrame: 2 },
            right: { row: 3, startFrame: 0, endFrame: 2 },
          }}
          width={SPRITE_WIDTH}
          height={SPRITE_HEIGHT}
          onLoad={() => console.log("Sprite sheet loaded")}
        />
      </View>
    );
  }
);
