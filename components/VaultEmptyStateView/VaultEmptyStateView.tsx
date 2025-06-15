// components/VaultEmptyStateView.tsx
import { ThemedText } from "@/components/ThemedText/ThemedText";
import { useColorScheme } from "@/hooks/useColorScheme";
import React from "react";
import { View } from "react-native";
import { styles } from "./vaultEmptyStateView.styles";

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
