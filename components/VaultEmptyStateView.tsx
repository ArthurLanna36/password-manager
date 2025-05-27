// components/VaultEmptyStateView.tsx
import { ThemedText } from "@/components/ThemedText";
import { useColorScheme } from "@/hooks/useColorScheme";
import React from "react";
import { StyleSheet, View } from "react-native";

export function VaultEmptyStateView() {
  const colorScheme = useColorScheme() ?? "light";

  return (
    <View style={styles.emptyStateContainer}>
      <ThemedText style={styles.emptyText}>No passwords saved yet.</ThemedText>
      <ThemedText
        style={[
          styles.emptySubText,
          { color: colorScheme === "light" ? "#666" : "#999" },
        ]}
      >
        Tap '+' to add one.
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 18,
    opacity: 0.8,
  },
  emptySubText: {
    textAlign: "center",
    fontSize: 15,
    opacity: 0.6,
    marginTop: 8,
  },
});
