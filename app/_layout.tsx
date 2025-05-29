// app/_layout.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Session } from "@supabase/supabase-js";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, AppState, View } from "react-native";
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";

import { supabase } from "@/constants/supabase";
import { useColorScheme } from "@/hooks/useColorScheme";

const KEEP_ME_SIGNED_IN_KEY = "keepMeSignedInPreference";

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? "dark"; // Default to dark if system preference is null
  const router = useRouter();
  const appState = useRef(AppState.currentState);

  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        // Listener function is now async
        if (
          appState.current === "active" &&
          nextAppState.match(/inactive|background/)
        ) {
          // App has gone to the background
          try {
            const keepSignedInPref = await AsyncStorage.getItem(
              KEEP_ME_SIGNED_IN_KEY
            );
            // Default to true (keep signed in) if preference is not explicitly set to false
            const shouldKeepSignedIn =
              keepSignedInPref !== null ? JSON.parse(keepSignedInPref) : true;

            if (!shouldKeepSignedIn) {
              const {
                data: { session: activeSession },
              } = await supabase.auth.getSession(); // Await the session
              if (activeSession) {
                // Only sign out if there is an active session
                await supabase.auth.signOut();
                // console.log("User signed out due to 'Keep me signed in' preference on backgrounding.");
              }
            }
          } catch (e) {
            console.error(
              "Failed to read or handle keepMeSignedIn preference on backgrounding.",
              e
            );
          }
        }
        appState.current = nextAppState;
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/login-page");
    }
  }, [loading, session, router]);

  if (!fontsLoaded || loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const paperThemeToUse = colorScheme === "dark" ? MD3DarkTheme : MD3LightTheme;
  const navigationThemeToUse =
    colorScheme === "dark" ? NavigationDarkTheme : NavigationDefaultTheme;

  return (
    <PaperProvider theme={paperThemeToUse}>
      <ThemeProvider value={navigationThemeToUse}>
        <Stack>
          {session ? (
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          ) : (
            <>
              <Stack.Screen
                name="login-page"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="register-page"
                options={{ headerShown: false }}
              />
            </>
          )}
          <Stack.Screen name="+not-found" options={{ title: "Oops!" }} />
        </Stack>
      </ThemeProvider>
    </PaperProvider>
  );
}
