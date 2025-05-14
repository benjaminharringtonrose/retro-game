import React from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import { CollidableEntity } from "../types";
import { TILE_SIZE } from "../constants/map";
import Animated, { SharedValue, useAnimatedStyle } from "react-native-reanimated";

interface CollisionVisualizerProps {
  collidableEntities: CollidableEntity[];
  mapX: SharedValue<number>;
  mapY: SharedValue<number>;
}

export const CollisionVisualizer = ({ collidableEntities, mapX, mapY }: CollisionVisualizerProps) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Player collision box should be centered on screen with half tile size
  const playerCollisionStyle = useAnimatedStyle(() => ({
    position: "absolute",
    width: TILE_SIZE / 2,
    height: TILE_SIZE / 2,
    left: screenWidth / 2 - TILE_SIZE / 4,
    top: screenHeight / 2 - TILE_SIZE / 4,
    borderColor: "red",
    borderWidth: 2,
    backgroundColor: "rgba(255, 0, 0, 0.2)",
    zIndex: 2000,
  }));

  // Entity collisions should move with the map
  const mapStyle = useAnimatedStyle(() => ({
    position: "absolute",
    width: "100%",
    height: "100%",
    transform: [{ translateX: mapX.value }, { translateY: mapY.value }],
  }));

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View style={playerCollisionStyle} />
      <Animated.View style={mapStyle}>
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

          const position = {
            left: entity.position.col * TILE_SIZE - offset.left,
            top: entity.position.row * TILE_SIZE - offset.top,
          };

          return (
            <View
              key={`collision-${index}`}
              style={[
                styles.collisionBox,
                {
                  ...position,
                  width: scaledSize.width,
                  height: scaledSize.height,
                },
              ]}
            />
          );
        })}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  collisionBox: {
    position: "absolute",
    borderColor: "red",
    borderWidth: 2,
    backgroundColor: "rgba(255, 0, 0, 0.2)",
    zIndex: 1000,
  },
});
