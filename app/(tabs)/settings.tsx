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

  const logoutColor = colorScheme === "dark" ? "#FF6B6B" : "#D32F2F";

  // 5. Create a new StyleSheet with 'card' and other styles
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      // Use a slightly off-white/off-black background for contrast with the cards
      backgroundColor: paperTheme.colors.background,
    },
    contentContainer: {
      padding: 16,
    },
    card: {
      borderRadius: 12,
      backgroundColor: paperTheme.colors.surface, // Use surface color from theme for the card
      marginBottom: 16,
      overflow: "hidden", // Important to clip the List.Item ripple effect to the card's border
    },
    subheader: {
      // Style for the section title (e.g., "APPEARANCE")
      textTransform: "uppercase",
      fontWeight: "bold",
      fontSize: 13,
      color: Colors[colorScheme].icon,
      paddingTop: 20,
      paddingBottom: 8,
    },
  });

  return (
    // 1. Change the root view to a ScrollView for better layout control
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* 2. Wrap each settings group in a styled 'card' View */}
      <View style={styles.card}>
        <List.Section>
          {/* 3. Apply specific styles to List.Subheader */}
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

      <View style={styles.card}>
        <List.Section>
          <List.Subheader style={styles.subheader}>Account</List.Subheader>
          <List.Item
            title="Logout"
            titleStyle={{ color: logoutColor }}
            left={({ color, ...props }) => (
              <List.Icon {...props} icon="logout" color={logoutColor} />
            )}
            onPress={handleLogout}
          />
        </List.Section>
      </View>

      {/* Example for a future section */}
      {/* <View style={styles.card}>
        <List.Section>
          <List.Subheader style={styles.subheader}>About</List.Subheader>
          <List.Item
            title="Version"
            right={() => <Text style={{color: Colors[colorScheme].icon}}>1.0.0</Text>}
          />
          <Divider />
          <List.Item
            title="Privacy Policy"
          />
        </List.Section>
      </View>
      */}
    </ScrollView>
  );
}
