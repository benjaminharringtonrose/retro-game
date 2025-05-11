declare module "react-native-game-engine" {
  import { Component } from "react";
  import { StyleProp, ViewStyle } from "react-native";

  export interface GameEngineProperties {
    systems?: Function[];
    entities?: { [key: string]: any };
    renderer?: Function;
    style?: StyleProp<ViewStyle>;
    running?: boolean;
    onEvent?: (e: any) => void;
    [key: string]: any;
  }

  export class GameEngine extends Component<GameEngineProperties> {
    /**
     * Stop the game loop
     */
    stop: () => void;

    /**
     * Start the game loop
     */
    start: () => void;

    /**
     * Swap the current entities with a new collection
     */
    swap: (entities: { [key: string]: any }) => void;

    /**
     * Dispatch a custom event
     */
    dispatch: (event: any) => void;

    /**
     * Access the current entities
     */
    entities: { [key: string]: any };
  }

  export class GameEngineRenderer extends Component<any> {}
}
