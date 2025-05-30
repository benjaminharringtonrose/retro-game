import { useAssets } from "expo-asset";
import { NPC_CONFIGS } from "../config/npcs";
import { logger } from "../utils/logger";

/**
 * Hook to preload and manage all game assets
 */
export const useGameAssets = () => {
  // Collect all assets that need to be loaded
  const mapAssets = [
    require("../assets/forest-background.png"),
    require("../assets/tree.png"),
    require("../assets/tree-2.png"),
    require("../assets/flowers.png"),
    require("../assets/cabin.png"),
    require("../assets/cabin-background.png"),
    require("../assets/portal.png"),
    require("../assets/ben-lilly-start.png"),
  ];

  // Collect NPC sprites
  const npcAssets = Object.values(NPC_CONFIGS).map((config) => config.sprite.source);

  // Player sprite
  const playerAssets = [require("../assets/character-spritesheet.png")];

  // Combine all assets
  const allAssets = [...mapAssets, ...npcAssets, ...playerAssets];

  // Use the official useAssets hook
  const [assets, error] = useAssets(allAssets);

  if (error) {
    logger.error("Assets", "Failed to load assets:", error.message);
  }

  if (assets) {
    logger.log("Assets", `Loaded ${assets.length} assets successfully`);
  }

  return {
    isLoaded: !!assets,
    assets,
    error: error?.message || null,
    progress: assets ? 1 : 0,
  };
};
