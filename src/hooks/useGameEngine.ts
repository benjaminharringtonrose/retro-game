import { useRef, useEffect, useState } from "react";
import { GameEngine as RNGameEngine } from "react-native-game-engine";
import { Entity } from "../types/entities";
import { GameEngine, GameEvent } from "../types/system";
import { MapType } from "../types/enums";
import { logger } from "../utils/logger";

interface GameEngineType extends RNGameEngine {
  dispatch: (event: any) => void;
  entities: { [key: string]: Entity };
}

declare global {
  interface Window {
    gameEngine: GameEngine | null;
  }
}

interface UseGameEngineProps {
  isFullyLoaded: boolean;
  onMapTransition: (mapType: MapType) => void;
}

interface UseGameEngineReturn {
  engineRef: React.RefObject<GameEngineType | null>;
  gameRunning: boolean;
  handleEvent: (event: GameEvent) => void;
}

export const useGameEngine = ({ isFullyLoaded, onMapTransition }: UseGameEngineProps): UseGameEngineReturn => {
  const engineRef = useRef<GameEngineType>(null);
  const [gameRunning, setGameRunning] = useState(false);

  useEffect(() => {
    if (engineRef.current) {
      window.gameEngine = engineRef.current;
    }

    if (isFullyLoaded && !gameRunning) {
      logger.log("Game", "Assets loaded and rendered, starting game");
      setGameRunning(true);
    }

    return () => {
      window.gameEngine = null;
    };
  }, [isFullyLoaded, gameRunning]);

  const handleEvent = (event: GameEvent) => {
    logger.log("Game", "Game Event:", event);

    if (event.type === "map-transition-start") {
      onMapTransition(event.payload.mapType);
    }
  };

  return {
    engineRef,
    gameRunning,
    handleEvent,
  };
};
