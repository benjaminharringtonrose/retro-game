import { MapType } from "./enums";
import { DebugBox } from "./collision";

export interface MapPosition {
  x: number;
  y: number;
}

export interface MapData {
  name: string;
  initialPosition: MapPosition;
  mapData: number[][];
  movementType: "scroll" | "fixed";
  background: any;
  bounds: {
    width: number;
    height: number;
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}

export type MapConfig = Record<MapType, MapData>;

export interface MapProps {
  position: {
    x: number;
    y: number;
  };
  dimensions: {
    width: number;
    height: number;
  };
  tileData: {
    tileSize: number;
    tiles: number[][];
    onImageLoad?: (assetId?: string) => void;
    background?: any;
  };
  boxes?: DebugBox[];
  debug?: {
    boxes: DebugBox[];
  };
}

export interface PortalConfig {
  id: string;
  position: {
    x: number;
    y: number;
  };
  dimensions: {
    width: number;
    height: number;
  };
  targetMapType: MapType;
  targetPosition: {
    x: number;
    y: number;
  };
  triggerDistance: number;
  sprite?: any;
  sourceMapType: MapType;
  animation?: {
    frameCount: number;
    frameRate: number;
  };
}
