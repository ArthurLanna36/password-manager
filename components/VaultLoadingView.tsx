// components/VaultLoadingView.tsx
import { styles } from "@/components/styles/vaultLoadingView.styles";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import React from "react";
import { ActivityIndicator } from "react-native";

interface VaultLoadingViewProps {
  message?: string; // Optional message to display below the spinner
}

export function VaultLoadingView({ message }: VaultLoadingViewProps) {
  const colorScheme = useColorScheme() ?? "light";

  return (
    <ThemedView style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
      {message && (
        <ThemedText style={{ marginTop: 10, color: Colors[colorScheme].text }}>
          {message}
        </ThemedText>
      )}
    </ThemedView>
  );
}
