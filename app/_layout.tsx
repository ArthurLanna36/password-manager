// app/_layout.tsx
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Session } from "@supabase/supabase-js";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { supabase } from "@/constants/supabase";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // 1) on mount, fetch current session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2) subscribe to auth state changes
    const { data: sub } = supabase.auth.onAuthStateChange((_, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // 3) as soon as we know session=null, redirect to /login
  useEffect(() => {
    if (!loading && !session) {
      router.replace("/login-page");
    }
  }, [loading, session]);

  // 4) loading spinner while checking session or fonts
  if (!fontsLoaded || loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 5) render auth stack or app stack
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        {session ? (
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="login-page" options={{ headerShown: false }} />
            <Stack.Screen
              name="register-page"
              options={{ headerShown: false }}
            />
          </>
        )}
        <Stack.Screen name="+not-found" options={{ title: "Oops!" }} />
      </Stack>
    </ThemeProvider>
  );
}
