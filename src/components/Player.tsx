import { RefObject } from "react";
import { View } from "react-native";
import { Sprites, SpritesMethods } from "react-native-sprites";
import { SPRITE_HEIGHT, SPRITE_WIDTH } from "../constants/sprites";

interface PlayerProps {
  x: number;
  y: number;
  spriteSheet: RefObject<SpritesMethods | null>;
}

export const Player: React.FC<PlayerProps> = ({ x, y, spriteSheet }) => {
  return (
    <View
      style={{
        position: "absolute",
        left: x - SPRITE_WIDTH / 2,
        top: y - SPRITE_HEIGHT / 2,
        zIndex: 10,
      }}
    >
      <Sprites
        ref={spriteSheet}
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
      />
    </View>
  );
};
