import { useState, useEffect } from "react";
import { Asset } from "expo-asset";

export function useCachedAssets(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function load() {
      const images = [
        require("../assets/character-spritesheet.png"),
        require("../assets/tree.png"),
        // …now you can add any other PNGs or JPGs you have
      ];
      const tasks = images.map((img) => Asset.fromModule(img).downloadAsync());
      await Promise.all(tasks);
      setReady(true);
    }
    load();
  }, []);

  return ready;
}
