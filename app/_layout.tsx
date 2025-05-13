// app/_layout.tsx
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Session } from "@supabase/supabase-js";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";

import { supabase } from "@/constants/supabase";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // 1) Font and navigation hooks
  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // 2) Session and loading state
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // 3) In useEffect, resolve the promise before disabling loading
  useEffect(() => {
    // fetch the current session from storage
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // and listen for sign-in / sign-out events
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // 4) While fonts or session are loading, display a spinner
  if (!fontsLoaded || loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 5) Once ready, render the Stack depending on whether the user has a session
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        {session ? (
          <Stack.Screen name="Menu" options={{ headerShown: false }} />
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
