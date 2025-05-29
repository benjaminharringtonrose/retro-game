import AsyncStorage from "@react-native-async-storage/async-storage";

export type LogSystem = "Game" | "Map" | "Player" | "Portal" | "Dialog" | "NPC" | "Assets" | "Collision" | "Movement" | "Animation" | "Performance" | "RenderingSystem";

interface LoggerState {
  enabledSystems: Set<LogSystem>;
}

const STORAGE_KEY = "@logger_enabled_systems";

class Logger {
  private state: LoggerState = {
    enabledSystems: new Set(),
  };

  constructor() {
    this.loadState();
  }

  private async loadState() {
    try {
      const storedSystems = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedSystems) {
        this.state.enabledSystems = new Set(JSON.parse(storedSystems));
        console.log("Loaded logger state:", Array.from(this.state.enabledSystems));
      }
    } catch (error) {
      console.error("Failed to load logger state:", error);
    }
  }

  private async saveState() {
    try {
      const systemsArray = Array.from(this.state.enabledSystems);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(systemsArray));
    } catch (error) {
      console.error("Failed to save logger state:", error);
    }
  }

  private formatMessage(system: LogSystem, message: string): string {
    return `[${system}] ${message}`;
  }

  private shouldLog(system: LogSystem): boolean {
    return this.state.enabledSystems.has(system);
  }

  async enableSystem(system: LogSystem) {
    this.state.enabledSystems.add(system);
    await this.saveState();
  }

  async disableSystem(system: LogSystem) {
    this.state.enabledSystems.delete(system);
    await this.saveState();
  }

  async toggleSystem(system: LogSystem) {
    if (this.shouldLog(system)) {
      await this.disableSystem(system);
    } else {
      await this.enableSystem(system);
    }
    return this.shouldLog(system);
  }

  isSystemEnabled(system: LogSystem): boolean {
    return this.shouldLog(system);
  }

  debug(system: LogSystem, message: string, ...args: any[]) {
    if (this.shouldLog(system)) {
      console.debug(this.formatMessage(system, message), ...args);
    }
  }

  log(system: LogSystem, message: string, ...args: any[]) {
    if (this.shouldLog(system)) {
      console.log(this.formatMessage(system, message), ...args);
    }
  }

  warn(system: LogSystem, message: string, ...args: any[]) {
    if (this.shouldLog(system)) {
      console.warn(this.formatMessage(system, message), ...args);
    }
  }

  error(system: LogSystem, message: string, ...args: any[]) {
    // Always log errors regardless of system state
    console.error(this.formatMessage(system, message), ...args);
  }

  getAllSystems(): LogSystem[] {
    return ["Map", "NPC", "Player", "Assets", "Game", "Dialog", "Collision", "Portal", "Movement", "Animation", "Performance", "RenderingSystem"];
  }
}

export const logger = new Logger();
