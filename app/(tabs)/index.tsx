// app/(tabs)/index.tsx
import React from "react";
import { Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#000",
      }}
    >
      <Text style={{ color: "#fff", fontSize: 24 }}>Password Manager</Text>
    </View>
  );
}
