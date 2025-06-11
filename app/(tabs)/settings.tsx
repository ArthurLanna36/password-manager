// app/(tabs)/settings.tsx
import { useRouter } from "expo-router";
import React from "react";
import { Appearance, ScrollView, StyleSheet, View } from "react-native";
import { List, useTheme } from "react-native-paper";

import { Colors } from "@/constants/Colors";
import { supabase } from "@/constants/supabase";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const paperTheme = useTheme();

  // Logic for logging out the user
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login-page");
  };

  // Logic for toggling the theme
  const toggleTheme = () => {
    const nextColorScheme = colorScheme === "dark" ? "light" : "dark";
    Appearance.setColorScheme(nextColorScheme);
  };

  // Use the notification color from our updated Colors constant
  const logoutColor =
    colorScheme === "dark"
      ? Colors.dark.notification
      : Colors.light.notification;

  // 5. Create a new StyleSheet with 'card' and other styles to match the reference
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      // Use a slightly different background to make cards stand out
      backgroundColor:
        colorScheme === "dark" ? "#000" : paperTheme.colors.background,
    },
    contentContainer: {
      paddingVertical: 24,
      paddingHorizontal: 16,
    },
    card: {
      borderRadius: 12,
      backgroundColor: paperTheme.colors.surface, // Use surface color for the card
      marginBottom: 24,
      overflow: "hidden", // Clip List.Item ripple effect to the card's border
    },
    subheader: {
      textTransform: "uppercase",
      paddingTop: 20,
      paddingBottom: 8,
      paddingHorizontal: 16,
      letterSpacing: 0.5,
    },
    // The List.Item itself doesn't need much custom styling
    // as Paper's component handles it well.
  });

  return (
    // 1. Use a ScrollView for the main container
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* 2. Wrap the "Appearance" section in a styled card View */}
      <View style={styles.card}>
        <List.Section>
          <List.Subheader style={styles.subheader}>Appearance</List.Subheader>
          <List.Item
            title={`Switch to ${
              colorScheme === "dark" ? "Light" : "Dark"
            } Mode`}
            left={(props) => (
              <List.Icon
                {...props}
                icon={
                  colorScheme === "dark" ? "weather-sunny" : "weather-night"
                }
              />
            )}
            onPress={toggleTheme}
          />
        </List.Section>
      </View>

      {/* 3. Wrap the "Account" section in another card View */}
      <View style={styles.card}>
        <List.Section>
          <List.Subheader style={styles.subheader}>Account</List.Subheader>
          <List.Item
            title="Logout"
            titleStyle={{ color: logoutColor }}
            left={(props) => (
              <List.Icon {...props} icon="logout" color={logoutColor} />
            )}
            onPress={handleLogout}
          />
        </List.Section>
      </View>

      {/* You can continue this pattern for other sections */}
    </ScrollView>
  );
}
