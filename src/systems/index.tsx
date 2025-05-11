import {
  Entities,
  EntityType,
  GameEngineContext,
  PlayerEntity,
  EnemyEntity,
  TreasureEntity,
} from "../types";
import { Dimensions } from "react-native";

const GAME_WIDTH = Dimensions.get("window").width;
const GAME_HEIGHT = Dimensions.get("window").height * 0.7;

// System for handling player movement
export const MovementSystem = (
  entities: Entities,
  { time }: GameEngineContext
): Entities => {
  const player = entities.player as PlayerEntity;

  if (player && player.direction) {
    const newX = player.position.x + player.direction.x * player.speed;
    const newY = player.position.y + player.direction.y * player.speed;

    console.log("Direction:", player.direction, "Position:", player.position);

    const maxX = GAME_WIDTH - player.size;
    const maxY = GAME_HEIGHT - player.size;

    player.position.x = Math.max(0, Math.min(maxX, newX));
    player.position.y = Math.max(0, Math.min(maxY, newY));

    if (player.invulnerable) {
      player.invulnerableTime += time.delta;
      if (player.invulnerableTime > 1500) {
        player.invulnerable = false;
        player.invulnerableTime = 0;
      }
    }
  }

  return entities;
};

// System for handling collisions
export const CollisionSystem = (
  entities: Entities,
  { dispatch }: GameEngineContext
): Entities => {
  const player = entities.player as PlayerEntity;

  if (!player) return entities;

  Object.keys(entities).forEach((key) => {
    const entity = entities[key];

    if (entity.type === EntityType.OBSTACLE) {
      if (
        player.position.x < entity.position.x + entity.size &&
        player.position.x + player.size > entity.position.x &&
        player.position.y < entity.position.y + entity.size &&
        player.position.y + player.size > entity.position.y
      ) {
        if (player.direction.x > 0)
          player.position.x = entity.position.x - player.size;
        if (player.direction.x < 0)
          player.position.x = entity.position.x + entity.size;
        if (player.direction.y > 0)
          player.position.y = entity.position.y - player.size;
        if (player.direction.y < 0)
          player.position.y = entity.position.y + entity.size;
      }
    }

    if (entity.type === EntityType.TREASURE) {
      const treasure = entity as TreasureEntity;
      if (
        !treasure.collected &&
        player.position.x < treasure.position.x + treasure.size &&
        player.position.x + player.size > treasure.position.x &&
        player.position.y < treasure.position.y + treasure.size &&
        player.position.y + player.size > treasure.position.y
      ) {
        treasure.collected = true;
        player.score += 10;
        dispatch({ type: "score-update", score: player.score });

        let allCollected = true;
        Object.keys(entities).forEach((entityKey) => {
          if (entities[entityKey].type === EntityType.TREASURE) {
            const t = entities[entityKey] as TreasureEntity;
            if (!t.collected) allCollected = false;
          }
        });

        if (allCollected) {
          dispatch({ type: "victory" });
        }
      }
    }

    if (entity.type === EntityType.ENEMY) {
      if (
        player.position.x < entity.position.x + entity.size &&
        player.position.x + player.size > entity.position.x &&
        player.position.y < entity.position.y + entity.size &&
        player.position.y + player.size > entity.position.y &&
        !player.invulnerable
      ) {
        player.health -= 1;
        player.invulnerable = true;
        dispatch({ type: "health-update", health: player.health });

        if (player.health <= 0) {
          dispatch({ type: "game-over" });
        }
      }
    }
  });

  return entities;
};

// System for enemy AI
export const AISystem = (
  entities: Entities,
  { time }: GameEngineContext
): Entities => {
  Object.keys(entities).forEach((key) => {
    const entity = entities[key];

    if (entity.type === EntityType.ENEMY) {
      const enemy = entity as EnemyEntity;

      if (enemy.movementPattern === "horizontal") {
        enemy.position.x += enemy.direction.x * enemy.speed;
        if (
          enemy.position.x <=
            enemy.startPosition.x - enemy.patrolDistance / 2 ||
          enemy.position.x >= enemy.startPosition.x + enemy.patrolDistance / 2
        ) {
          enemy.direction.x *= -1;
        }
      } else if (enemy.movementPattern === "vertical") {
        enemy.position.y += enemy.direction.y * enemy.speed;
        if (
          enemy.position.y <=
            enemy.startPosition.y - enemy.patrolDistance / 2 ||
          enemy.position.y >= enemy.startPosition.y + enemy.patrolDistance / 2
        ) {
          enemy.direction.y *= -1;
        }
      } else if (enemy.movementPattern === "follow") {
        const player = entities.player as PlayerEntity;

        if (player) {
          const dx = player.position.x - enemy.position.x;
          const dy = player.position.y - enemy.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            if (distance > 0) {
              enemy.direction.x = dx / distance;
              enemy.direction.y = dy / distance;
              enemy.position.x += enemy.direction.x * enemy.speed;
              enemy.position.y += enemy.direction.y * enemy.speed;
            }
          } else {
            enemy.movementPattern =
              enemy.startPosition.x !== enemy.startPosition.y
                ? "horizontal"
                : "vertical";
          }
        }
      }
    }
  });

  return entities;
};

// System to track game status
export const GameStatusSystem = (
  entities: Entities,
  { dispatch }: GameEngineContext
): Entities => {
  const player = entities.player as PlayerEntity;

  let treasuresTotal = 0;
  let treasuresCollected = 0;

  Object.keys(entities).forEach((key) => {
    if (entities[key].type === EntityType.TREASURE) {
      treasuresTotal++;
      if ((entities[key] as TreasureEntity).collected) {
        treasuresCollected++;
      }
    }
  });

  if (treasuresCollected === treasuresTotal && treasuresTotal > 0) {
    dispatch({ type: "victory" });
  }

  return entities;
};
