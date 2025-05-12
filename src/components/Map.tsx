import { View } from "react-native";

export interface MapProps {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const Map: React.FC<MapProps> = ({ x, y, width, height }) => {
  return (
    <View
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        height,
        backgroundColor: "#7cad6c",
      }}
    >
      {Array(20)
        .fill(0)
        .map((_, i) => (
          <View
            key={`tree-${i}`}
            style={{
              position: "absolute",
              width: 48,
              height: 48,
              backgroundColor: "#2e5e1b",
              left: 100 + (i % 5) * 150,
              top: 100 + Math.floor(i / 5) * 150,
              borderRadius: 24,
            }}
          />
        ))}
      <View
        style={{
          position: "absolute",
          width: 200,
          height: 200,
          backgroundColor: "#3498db",
          left: 400,
          top: 300,
        }}
      />
      {Array(8)
        .fill(0)
        .map((_, i) => (
          <View
            key={`rock-${i}`}
            style={{
              position: "absolute",
              width: 30,
              height: 30,
              backgroundColor: "#7f8c8d",
              left: 250 + (i % 4) * 100,
              top: 200 + Math.floor(i / 4) * 100,
              borderRadius: 5,
            }}
          />
        ))}
      <View
        style={{
          position: "absolute",
          width: 60,
          height: 40,
          backgroundColor: "#34495e",
          left: 700,
          top: 500,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
        }}
      />
    </View>
  );
};
