// App.tsx
import React, { useEffect, useState } from "react";
import * as ScreenOrientation from "expo-screen-orientation";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "expo-font";

import GameScreen from "./navigation/screens/GameScreen";
import { HomeScreen } from "./navigation/screens/HomeScreen";
import { useCachedAssets } from "./hooks/useCachedAssets";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const App = () => {
  const [started, setStarted] = useState(false);
  const assetsReady = useCachedAssets();

  const [fontsLoaded] = useFonts({
    PressStart2P: require("./assets/fonts/PressStart2P-Regular.ttf"),
  });

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }, []);

  useEffect(() => {
    if (assetsReady && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [assetsReady, fontsLoaded]);

  if (!assetsReady || !fontsLoaded) {
    return null;
  }

  return <GestureHandlerRootView style={{ flex: 1 }}>{started ? <GameScreen /> : <HomeScreen onStart={() => setStarted(true)} />}</GestureHandlerRootView>;
};

export default App;
