import React, { useState, useEffect } from "react";
import { StyleSheet, View, Modal, TouchableOpacity, Text, TouchableWithoutFeedback, ScrollView, ActivityIndicator } from "react-native";
import { logger, LogSystem } from "../utils/logger";

interface DevMenuProps {
  isVisible: boolean;
  onClose: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showDebug: boolean;
  onToggleDebug: () => void;
  debugBoxCount?: number;
}

export const DevMenu: React.FC<DevMenuProps> = ({ isVisible, onClose, showGrid, onToggleGrid, showDebug, onToggleDebug, debugBoxCount = 0 }) => {
  const [activeTab, setActiveTab] = useState<"general" | "logging">("general");
  const [isTogglingSystem, setIsTogglingSystem] = useState<LogSystem | null>(null);
  const [enabledSystems, setEnabledSystems] = useState<Set<LogSystem>>(new Set());

  // Initialize enabled systems
  useEffect(() => {
    const systems = logger.getAllSystems();
    const enabled = new Set<LogSystem>();
    systems.forEach((system) => {
      if (logger.isSystemEnabled(system)) {
        enabled.add(system);
      }
    });
    setEnabledSystems(enabled);
  }, []);

  const handleToggleLogger = async (system: LogSystem) => {
    setIsTogglingSystem(system);
    try {
      const isEnabled = await logger.toggleSystem(system);
      setEnabledSystems((prev) => {
        const newSet = new Set(prev);
        if (isEnabled) {
          newSet.add(system);
        } else {
          newSet.delete(system);
        }
        return newSet;
      });
    } catch (error) {
      logger.error("Game", "Failed to toggle logging system:", error);
    } finally {
      setIsTogglingSystem(null);
    }
  };

  const renderGeneralTab = () => (
    <>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => {
          onToggleGrid();
          onClose();
        }}
      >
        <Text style={styles.menuText}>{showGrid ? "Hide Grid" : "Show Grid"}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => {
          onToggleDebug();
          onClose();
        }}
      >
        <Text style={styles.menuText}>{showDebug ? `Hide Debug (${debugBoxCount})` : "Show Debug"}</Text>
      </TouchableOpacity>
    </>
  );

  const renderLoggingTab = () => (
    <ScrollView style={styles.scrollView}>
      {logger.getAllSystems().map((system) => (
        <TouchableOpacity key={system} style={[styles.menuItem, enabledSystems.has(system) && styles.menuItemActive]} onPress={() => handleToggleLogger(system)} disabled={isTogglingSystem === system}>
          <View style={styles.menuItemContent}>
            <Text style={styles.menuText}>
              {system} Logging {enabledSystems.has(system) ? "ON" : "OFF"}
            </Text>
            {isTogglingSystem === system && <ActivityIndicator size="small" color="#fff" style={styles.loader} />}
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <Modal animationType="fade" transparent={true} visible={isVisible} onRequestClose={onClose} supportedOrientations={["portrait", "landscape"]} presentationStyle="overFullScreen">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.menuContainer}>
              <View style={styles.header}>
                <Text style={styles.title}>Developer Menu</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.tabs}>
                <TouchableOpacity style={[styles.tab, activeTab === "general" && styles.activeTab]} onPress={() => setActiveTab("general")}>
                  <Text style={[styles.tabText, activeTab === "general" && styles.activeTabText]}>General</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, activeTab === "logging" && styles.activeTab]} onPress={() => setActiveTab("logging")}>
                  <Text style={[styles.tabText, activeTab === "logging" && styles.activeTabText]}>Logging</Text>
                </TouchableOpacity>
              </View>

              {activeTab === "general" ? renderGeneralTab() : renderLoggingTab()}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    padding: 16,
    minWidth: 250,
    maxHeight: "80%",
    borderWidth: 1,
    borderColor: "#333",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 24,
  },
  tabs: {
    flexDirection: "row",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#4CAF50",
  },
  tabText: {
    color: "#888",
    fontSize: 14,
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "bold",
  },
  scrollView: {
    maxHeight: 300,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#333",
    borderRadius: 4,
    marginBottom: 8,
  },
  menuItemActive: {
    backgroundColor: "#4CAF50",
  },
  menuText: {
    color: "#fff",
    fontSize: 16,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  loader: {
    marginLeft: 10,
  },
});
