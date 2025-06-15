// components/VaultLoadingView.tsx
import { ThemedText } from "@/components/ThemedText/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import React from "react";
import { ActivityIndicator } from "react-native";
import { styles } from "./vaultLoadingView.styles";

interface VaultLoadingViewProps {
  message?: string;
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
