import { useState, useRef, useCallback, useEffect } from "react";
import { MapType } from "../types/enums";
import { EXPECTED_ASSETS } from "../constants/assets";
import { logger } from "../utils/logger";
import { Entity } from "../types/entities";

interface UseAssetLoadingProps {
  assetsLoaded: boolean;
  selectedMap: MapType;
  entities: Record<string, Entity>;
}

interface UseAssetLoadingReturn {
  isFullyLoaded: boolean;
  totalProgress: number;
  onImageLoad: (assetId?: string) => void;
  resetAssetLoading: () => void;
}

export const useAssetLoading = ({ assetsLoaded, selectedMap, entities }: UseAssetLoadingProps): UseAssetLoadingReturn => {
  const [renderedAssets, setRenderedAssets] = useState(new Set<string>());
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);
  const [renderStartTime, setRenderStartTime] = useState(0);
  const [hasStartedRendering, setHasStartedRendering] = useState(false);

  const lastRenderedAssetTimeRef = useRef(Date.now());
  const uniqueAssetsRef = useRef(new Set<string>());
  const expectedAssetsRef = useRef(new Set<string>());

  const resetAssetLoading = useCallback(() => {
    uniqueAssetsRef.current = new Set();
    setRenderedAssets(new Set());
    setHasStartedRendering(false);
    setIsFullyLoaded(false);
    setRenderStartTime(0);
  }, []);

  const onImageLoad = useCallback((assetId?: string) => {
    if (assetId) {
      logger.log("Game", `Image rendered: ${assetId} (${uniqueAssetsRef.current.size} unique assets so far)`);

      uniqueAssetsRef.current.add(assetId);
      lastRenderedAssetTimeRef.current = Date.now();
      setRenderedAssets((prev) => {
        const newSet = new Set(prev);
        newSet.add(assetId);
        return newSet;
      });
    }
  }, []);

  const checkAllAssetsLoaded = useCallback(() => {
    const hasAllRequiredAssets = EXPECTED_ASSETS[selectedMap].every((asset) => uniqueAssetsRef.current.has(asset));
    return hasAllRequiredAssets;
  }, [selectedMap]);

  useEffect(() => {
    if (!assetsLoaded) return;

    const newExpectedAssets = new Set<string>(EXPECTED_ASSETS[selectedMap]);

    Object.values(entities).forEach((entity) => {
      if (entity.assetId) {
        newExpectedAssets.add(entity.assetId);
      }
    });

    expectedAssetsRef.current = newExpectedAssets;
    logger.log("Game", `Initialized with ${newExpectedAssets.size} expected assets:`, Array.from(newExpectedAssets));

    if (!hasStartedRendering) {
      setRenderStartTime(Date.now());
      setHasStartedRendering(true);
    }
  }, [assetsLoaded, entities, hasStartedRendering, selectedMap]);

  useEffect(() => {
    if (!assetsLoaded || Object.keys(entities).length === 0) return;

    if (checkAllAssetsLoaded()) {
      setTimeout(() => {
        setIsFullyLoaded(true);
      }, 1000);
    }
  }, [assetsLoaded, renderedAssets, entities, checkAllAssetsLoaded]);

  const totalProgress = isFullyLoaded ? 100 : Math.min(95, Math.floor((uniqueAssetsRef.current.size / EXPECTED_ASSETS[selectedMap].length) * 95));

  return {
    isFullyLoaded,
    totalProgress,
    onImageLoad,
    resetAssetLoading,
  };
};
