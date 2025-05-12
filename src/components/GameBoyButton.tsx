import { TouchableOpacity, Text, StyleSheet } from "react-native";

export interface GameBoyButtonProps {
  onPressIn: () => void;
  onPressOut: () => void;
  label: string;
  style: object;
}

export const GameBoyButton: React.FC<GameBoyButtonProps> = ({
  onPressIn,
  onPressOut,
  label,
  style,
}) => (
  <TouchableOpacity
    onPressIn={onPressIn}
    onPressOut={onPressOut}
    style={[styles.button, style]}
  >
    <Text style={styles.buttonText}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    backgroundColor: "#444",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 18,
  },
  buttonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});
