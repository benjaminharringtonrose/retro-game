import "./gesture-handler";
import "@expo/metro-runtime"; // Necessary for Fast Refresh on Web
import { registerRootComponent } from "expo";

import App from "./src/App";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const Root = () => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <App />
  </GestureHandlerRootView>
);

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(Root);
