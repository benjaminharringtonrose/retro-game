import { useState, useEffect } from "react";
import { Asset } from "expo-asset";

export function useCachedAssets(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function load() {
      const images = [
        require("../assets/character-spritesheet.png"),
        require("../assets/tree.png"),
        require("../assets/tree-2.png"),
        require("../assets/forest-background.png"),
        require("../assets/lilly-spritesheet.png"),
        require("../assets/willow-spritesheet.png"),
        require("../assets/portal-7.png"),
        require("../assets/tree-2.png"),
        require("../assets/flowers.png"),
        require("../assets/cabin.png"),
        require("../assets/cabin-interior-1.png"),
        require("../assets/rosie-spritesheet.png"),
        require("../assets/ben-lilly-start.png"),
      ];
      const tasks = images.map((img) => Asset.fromModule(img).downloadAsync());
      await Promise.all(tasks);
      setReady(true);
    }
    load();
  }, []);

  return ready;
}
