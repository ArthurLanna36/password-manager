import { useRouter } from "expo-router";
import React from "react";
import { Appearance, ScrollView } from "react-native";
import { Card, List, useTheme } from "react-native-paper";

import { Colors } from "@/constants/Colors";
import { supabase } from "@/constants/supabase";
import { useColorScheme } from "@/hooks/useColorScheme";
import { logAuditEvent } from "@/utils/auditLogService";
import { styles } from "./styles/settings.styles";
export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const paperTheme = useTheme();

  const handleLogout = async () => {
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      logAuditEvent('LOGOUT', user);
    }

    await supabase.auth.signOut();
    router.replace("/login-page");
  };

  const toggleTheme = () => {
    const nextColorScheme = colorScheme === "dark" ? "light" : "dark";
    Appearance.setColorScheme(nextColorScheme);
  };

  const logoutColor =
    colorScheme === "dark"
      ? Colors.dark.notification
      : Colors.light.notification;

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: paperTheme.colors.background },
      ]}
      contentContainerStyle={styles.contentContainer}
    >
      <Card style={styles.card}>
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
      </Card>

      <Card style={styles.card}>
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
      </Card>
    </ScrollView>
  );
}
