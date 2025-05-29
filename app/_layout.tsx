// app/_layout.tsx
import {
  DarkTheme as NavigationDarkTheme, // Renomeado para clareza
  DefaultTheme as NavigationDefaultTheme, // Renomeado para clareza
  ThemeProvider,
} from "@react-navigation/native";
import { Session } from "@supabase/supabase-js";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import {
  MD3DarkTheme, // Importe o tema escuro MD3 do Paper
  MD3LightTheme, // Importe o tema claro MD3 do Paper
  PaperProvider,
} from "react-native-paper"; // PaperProvider já estava importado

import { supabase } from "@/constants/supabase"; //
import { useColorScheme } from "@/hooks/useColorScheme"; //

export default function RootLayout() {
  const colorScheme = useColorScheme(); //
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      //
      setSession(session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_, s) => {
      //
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/login-page"); //
    }
  }, [loading, session]);

  if (!fontsLoaded || loading) {
    //
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Seleciona o tema correto para o PaperProvider
  const paperTheme = colorScheme === "dark" ? MD3DarkTheme : MD3LightTheme;

  // Seleciona o tema correto para o ThemeProvider do React Navigation
  const navigationTheme =
    colorScheme === "dark" ? NavigationDarkTheme : NavigationDefaultTheme;

  return (
    <PaperProvider theme={paperTheme}>
      {" "}
      {/* Use o tema do Paper aqui */}
      <ThemeProvider value={navigationTheme}>
        {" "}
        {/* Use o tema do Navigation aqui */}
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
