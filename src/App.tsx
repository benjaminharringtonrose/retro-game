// App.tsx
import React, { useEffect, useState } from "react";
import * as ScreenOrientation from "expo-screen-orientation";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import GameScreen from "./navigation/screens/GameScreen";
import { HomeScreen } from "./navigation/screens/HomeScreen";
import { useCachedAssets } from "./hooks/useCachedAssets";

const App = () => {
  const [started, setStarted] = useState(false);
  const ready = useCachedAssets();

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    SplashScreen.hide();
  }, []);

  if (!ready) {
    // you can render a splash or null until assets are cached
    return null;
  }

  return <GestureHandlerRootView style={{ flex: 1 }}>{started ? <GameScreen /> : <HomeScreen onStart={() => setStarted(true)} />}</GestureHandlerRootView>;
};

export default App;
