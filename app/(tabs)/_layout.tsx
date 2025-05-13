// app/_layout.tsx
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Session } from "@supabase/supabase-js";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";

import { supabase } from "@/constants/supabase";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function RootLayout() {
  // Get the current color scheme (dark/light)
  const colorScheme = useColorScheme();
  const router = useRouter();

  // 1) Font loading hook
  const [fontsLoaded] = useFonts({
    SpaceMono: require("../../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // 2) Session & loading state
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // 3) On mount, resolve the current session and subscribe to changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_, newSession) => {
        setSession(newSession);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // 4) Redirect to /login as soon as we know there's no session
  useEffect(() => {
    if (!loading && !session) {
      // Move to the login screen
      router.replace("../login/page");
    }
  }, [loading, session]);

  // 5) While fonts or session are loading, show a spinner
  if (!fontsLoaded || loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 6) Render either the tabs (if logged in) or the auth screens
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        {session ? (
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen
              name="login"
              options={{ headerShown: false, presentation: "modal" }}
            />
            <Stack.Screen
              name="register"
              options={{ headerShown: false, presentation: "modal" }}
            />
          </>
        )}
        <Stack.Screen name="+not-found" options={{ title: "Oops!" }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
