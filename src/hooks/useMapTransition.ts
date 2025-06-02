import { useState } from "react";
import { MapType } from "../types/enums";

interface UseMapTransitionReturn {
  selectedMap: MapType;
  mapTransitionLoading: boolean;
  handleMapTransition: (newMap: MapType) => void;
  clearMapTransition: () => void;
}

export const useMapTransition = (initialMap: MapType = MapType.FOREST): UseMapTransitionReturn => {
  const [selectedMap, setSelectedMap] = useState<MapType>(initialMap);
  const [mapTransitionLoading, setMapTransitionLoading] = useState(false);

  const handleMapTransition = (newMap: MapType) => {
    setSelectedMap(newMap);
    setMapTransitionLoading(true);
  };

  const clearMapTransition = () => {
    setMapTransitionLoading(false);
  };

  return {
    selectedMap,
    mapTransitionLoading,
    handleMapTransition,
    clearMapTransition,
  };
};
