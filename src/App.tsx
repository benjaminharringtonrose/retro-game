import React, { useEffect, useState } from "react";
import * as ScreenOrientation from "expo-screen-orientation";
import GameScreen from "./GameScreen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { HomeScreen } from "./navigation/screens/HomeScreen";

const App = () => {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {started ? (
        <GameScreen />
      ) : (
        <HomeScreen onStart={() => setStarted(true)} />
      )}
    </GestureHandlerRootView>
  );
};

export default App;
