// app/(tabs)/first-tab.tsx
import React from "react";
import { Text, View } from "react-native";

export default function FirstTabScreen() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#000",
      }}
    >
      <Text style={{ color: "#fff", fontSize: 24 }}>First Tab</Text>
    </View>
  );
}
