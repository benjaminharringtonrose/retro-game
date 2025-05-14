import React from "react";
import { View, StyleSheet } from "react-native";
import { CollidableEntity } from "../types";
import { TILE_SIZE } from "../constants/map";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

interface CollisionVisualizerProps {
  collidableEntities: CollidableEntity[];
  playerPosition: {
    x: number;
    y: number;
  };
  mapX: Animated.SharedValue<number>;
  mapY: Animated.SharedValue<number>;
}

export const CollisionVisualizer: React.FC<CollisionVisualizerProps> = ({ collidableEntities, playerPosition, mapX, mapY }) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: mapX.value }, { translateY: mapY.value }],
    };
  });

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Player collision box */}
      <View
        style={[
          styles.collisionBox,
          styles.playerBox,
          {
            left: playerPosition.x - TILE_SIZE / 4,
            top: playerPosition.y - TILE_SIZE / 4,
            width: TILE_SIZE / 2,
            height: TILE_SIZE / 2,
          },
        ]}
      />

      {/* Entity collision boxes */}
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        {collidableEntities.map((entity, index) => {
          const size = {
            width: entity.collision.width * TILE_SIZE,
            height: entity.collision.height * TILE_SIZE,
          };

          const scaledSize = {
            width: size.width * entity.scale,
            height: size.height * entity.scale,
          };

          const offset = {
            left: (scaledSize.width - size.width) / 2,
            top: (scaledSize.height - size.height) / 2,
          };

          const bounds = {
            left: entity.position.col * TILE_SIZE - offset.left,
            top: entity.position.row * TILE_SIZE - offset.top,
            width: scaledSize.width,
            height: scaledSize.height,
          };

          return <View key={`collision-${index}`} style={[styles.collisionBox, styles.entityBox, bounds]} />;
        })}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  collisionBox: {
    position: "absolute",
    borderWidth: 1,
  },
  playerBox: {
    backgroundColor: "rgba(255, 0, 0, 0.3)",
    borderColor: "rgba(255, 0, 0, 0.7)",
    zIndex: 2000,
  },
  entityBox: {
    backgroundColor: "rgba(255, 0, 0, 0.2)",
    borderColor: "rgba(255, 0, 0, 0.5)",
    zIndex: 1000,
  },
});
