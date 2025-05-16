import { GameEngine } from "../GameEngine";
import { System } from "../types/engine";
import { ComponentType, MovementComponent, InputComponent, TransformComponent, AnimationComponent } from "../types/components";
import { TILE_SIZE } from "../../constants/map";
import { CollidableEntity } from "../../types";

export class NPCMovementSystem implements System {
  private npcs: CollidableEntity[];
  private lastUpdate: number = 0;
  private readonly UPDATE_INTERVAL = 1000; // Update NPC movement every second

  constructor(npcs: CollidableEntity[]) {
    this.npcs = npcs.filter((npc) => npc.type === "npc" && npc.movementPattern);
  }

  update(engine: GameEngine, deltaTime: number): void {
    const currentTime = Date.now();
    if (currentTime - this.lastUpdate < this.UPDATE_INTERVAL) {
      return;
    }

    this.lastUpdate = currentTime;

    const entities = engine.getEntitiesWithComponents([ComponentType.Movement, ComponentType.Input, ComponentType.Transform, ComponentType.Animation]);

    for (const entityId of entities) {
      const movement = engine.getComponent<MovementComponent>(entityId, ComponentType.Movement);
      const input = engine.getComponent<InputComponent>(entityId, ComponentType.Input);
      const transform = engine.getComponent<TransformComponent>(entityId, ComponentType.Transform);
      const animation = engine.getComponent<AnimationComponent>(entityId, ComponentType.Animation);

      if (!movement || !input || !transform || !animation || input.isControlled) {
        continue; // Skip player or invalid entities
      }

      // Calculate world position (relative to map origin)
      const worldX = transform.position.x - movement.mapX.value;
      const worldY = transform.position.y - movement.mapY.value;

      // Convert to tile coordinates
      const currentTile = {
        row: Math.floor(worldY / TILE_SIZE),
        col: Math.floor(worldX / TILE_SIZE),
      };

      // Find matching NPC configuration
      const npc = this.npcs.find((n) => n.position.row === currentTile.row && n.position.col === currentTile.col);

      if (!npc || !npc.movementPattern || !npc.spritesheet) {
        continue;
      }

      switch (npc.movementPattern.type) {
        case "patrol":
          this.handlePatrolMovement(npc, input, transform, animation, movement);
          break;
        case "random":
          this.handleRandomMovement(npc, input, animation);
          break;
        case "stationary":
          // No movement needed
          input.isMoving = false;
          animation.currentFrame = npc.spritesheet.animations.idle[0];
          animation.isPlaying = false;
          break;
      }

      // Update NPC position based on movement
      if (input.isMoving) {
        const speed = movement.speed * (deltaTime / 1000);
        const dx = input.direction.x * speed;
        const dy = input.direction.y * speed;

        // Update transform position
        transform.position.x = worldX + dx;
        transform.position.y = worldY + dy;

        // Update movement component
        movement.velocity = {
          x: input.direction.x * movement.speed,
          y: input.direction.y * movement.speed,
        };
      } else {
        movement.velocity = { x: 0, y: 0 };
      }
    }
  }

  private handlePatrolMovement(npc: CollidableEntity, input: InputComponent, transform: TransformComponent, animation: AnimationComponent, movement: MovementComponent): void {
    if (!npc.movementPattern?.points || npc.movementPattern.points.length < 2 || !npc.spritesheet) {
      return;
    }

    // Calculate world position
    const worldX = transform.position.x - movement.mapX.value;
    const worldY = transform.position.y - movement.mapY.value;

    // Convert to tile coordinates
    const currentPoint = {
      row: Math.floor(worldY / TILE_SIZE),
      col: Math.floor(worldX / TILE_SIZE),
    };

    // Find current position in patrol path
    const currentIndex = npc.movementPattern.points.findIndex((p) => p.row === currentPoint.row && p.col === currentPoint.col);

    if (currentIndex === -1) {
      // Move to first point if not on path
      const target = npc.movementPattern.points[0];
      this.moveTowards(input, currentPoint, target, animation, npc.spritesheet);
    } else {
      // Move to next point in path
      const nextIndex = (currentIndex + 1) % npc.movementPattern.points.length;
      const target = npc.movementPattern.points[nextIndex];
      this.moveTowards(input, currentPoint, target, animation, npc.spritesheet);
    }
  }

  private handleRandomMovement(npc: CollidableEntity, input: InputComponent, animation: AnimationComponent): void {
    if (!npc.movementPattern?.radius || !npc.spritesheet) {
      return;
    }

    // Randomly change direction occasionally
    if (Math.random() < 0.3) {
      const angle = Math.random() * Math.PI * 2;
      input.direction = {
        x: Math.cos(angle),
        y: Math.sin(angle),
      };
      input.isMoving = true;

      // Update animation based on direction
      this.updateAnimation(input.direction, animation, npc.spritesheet);
    }
  }

  private moveTowards(input: InputComponent, current: { row: number; col: number }, target: { row: number; col: number }, animation: AnimationComponent, spritesheet: NonNullable<CollidableEntity["spritesheet"]>): void {
    const dx = target.col - current.col;
    const dy = target.row - current.row;

    if (Math.abs(dx) > Math.abs(dy)) {
      // Move horizontally
      input.direction = { x: Math.sign(dx), y: 0 };
    } else {
      // Move vertically
      input.direction = { x: 0, y: Math.sign(dy) };
    }

    input.isMoving = dx !== 0 || dy !== 0;

    // Update animation based on movement
    this.updateAnimation(input.direction, animation, spritesheet);
  }

  private updateAnimation(direction: { x: number; y: number }, animation: AnimationComponent, spritesheet: NonNullable<CollidableEntity["spritesheet"]>): void {
    // Determine animation row based on direction
    let row = spritesheet.rows.down; // Default to down
    if (Math.abs(direction.x) > Math.abs(direction.y)) {
      row = direction.x > 0 ? spritesheet.rows.right : spritesheet.rows.left;
    } else {
      row = direction.y > 0 ? spritesheet.rows.down : spritesheet.rows.up;
    }

    // Update animation frame
    animation.frameWidth = spritesheet.frameWidth;
    animation.frameHeight = spritesheet.frameHeight;
    animation.frames = spritesheet.frames;
    animation.frameRate = spritesheet.frameRate;
    animation.isPlaying = true;
    animation.currentFrame = row * spritesheet.frames;
  }
}
