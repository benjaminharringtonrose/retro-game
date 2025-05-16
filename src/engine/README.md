# Retro Game Engine

A powerful and efficient Entity Component System (ECS) game engine designed for retro-style games. This engine provides a robust foundation for building 2D games with modern architecture principles.

## Architecture Overview

The engine is built on the Entity Component System (ECS) pattern, consisting of three main parts:

1. **Entities**: Simple numeric IDs that represent game objects
2. **Components**: Data containers that define properties and state
3. **Systems**: Logic processors that operate on entities with specific components

### Core Files

- `GameEngine.ts`: The central orchestrator of the engine
- `EntityManager.ts`: Manages entity lifecycle and component associations
- `ComponentFactory.ts`: Creates and initializes components
- `EntityFactory.ts`: Creates preconfigured entities with common component combinations
- `System.ts`: Base interface for all systems
- `types.ts`: Type definitions and interfaces

## Game Engine

The `GameEngine` class is the core of the system, providing:

- Entity creation and management
- Component attachment and retrieval
- System execution and game loop management
- Efficient caching system for entity queries
- Frame-based cache invalidation
- Performance optimizations for component lookups

## Systems

### Movement System

The `MovementSystem` is a sophisticated system handling all entity movement with the following features:

#### Key Features

- Pixel-perfect collision detection
- Smooth camera following with screen boundaries
- Tile-based movement restrictions
- Entity collision handling
- Screen-edge handling with smooth transitions

#### Movement Mechanics

1. **Boundary Management**

   - Maintains map boundaries considering screen dimensions
   - Handles both larger-than-screen and smaller-than-screen maps
   - Implements screen padding and centered positioning

2. **Movement Processing**

   - Processes movement in both X and Y axes independently
   - Handles diagonal movement correctly
   - Maintains constant movement speed regardless of direction

3. **Collision Detection**

   - Checks for tile-based collisions (water, trees, rocks)
   - Handles entity-to-entity collisions
   - Uses optimized hitboxes for precise collision detection

4. **Camera System**
   - Implements smooth camera following
   - Handles screen edge cases
   - Provides smooth transitions when reaching map boundaries

### Other Systems

- **CollisionSystem**: Handles collision detection and response
- **PortalSystem**: Manages level transitions and teleportation
- **RenderSystem**: Handles sprite rendering and animations
- **AnimationSystem**: Manages sprite animations and state transitions

## Component Types

The engine uses various component types including:

- `MovementComponent`: Position and movement data
- `InputComponent`: User input state
- `TransformComponent`: Position and scale information
- Additional components defined in `types/components.ts`

## Usage

To use the engine, create a new instance of `GameEngine` and add required systems:

```typescript
const engine = new GameEngine();
engine.addSystem(new MovementSystem(mapConfig));
engine.addSystem(new CollisionSystem());
engine.addSystem(new RenderSystem());
// Add other systems as needed

engine.start(); // Starts the game loop
```

## Performance Considerations

- Component queries are cached with a TTL of 5 seconds
- Cache is automatically cleaned when reaching maximum size (100 entries)
- Frame-based cache invalidation every 60 frames
- Optimized entity lookups using Set data structures
- Efficient component iteration without array conversions

## Map Configuration

The movement system requires a map configuration with:

- Tile-based map data
- Collidable entity definitions
- Map dimensions and boundaries
- Screen size considerations

## Debug Features

The engine includes various debug features:

- Position logging for movement debugging
- Entity state tracking
- Cache performance monitoring
- Frame counting and performance metrics

## Best Practices

1. Always initialize systems in the correct order
2. Clear systems when switching game states
3. Manage entity lifecycles properly
4. Use the component cache for performance
5. Handle boundary cases in movement calculations

## Technical Details

- Uses TypeScript for type safety
- Implements efficient data structures
- Provides frame-based update system
- Handles window resizing and screen boundaries
- Maintains consistent game loop timing
