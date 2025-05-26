import React from "react";
import { StyleSheet, View, Modal, TouchableOpacity, Text, TouchableWithoutFeedback } from "react-native";

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
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#333",
    borderRadius: 4,
    marginBottom: 8,
  },
  menuText: {
    color: "#fff",
    fontSize: 16,
  },
});
