// app/login-page.tsx
import { Colors } from "@/constants/Colors";
import { supabase } from "@/constants/supabase";
import { useColorScheme } from "@/hooks/useColorScheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextStyle, // Import TextStyle
  TouchableOpacity,
  View,
  ViewStyle, // Import ViewStyle
} from "react-native";
import { Checkbox } from "react-native-paper";

const KEEP_ME_SIGNED_IN_KEY = "keepMeSignedInPreference";

// Define the Styles type for your StyleSheet
type Styles = {
  safe: ViewStyle;
  flex: ViewStyle;
  container: ViewStyle;
  title: TextStyle;
  input: TextStyle;
  button: ViewStyle;
  buttonDisabled: ViewStyle;
  buttonText: TextStyle;
  linkWrapper: ViewStyle;
  link: TextStyle;
  // checkboxContainer can be part of this or defined separately if it's deeply nested
};

const styles = StyleSheet.create<Styles & { checkboxContainer: ViewStyle }>({
  safe: { flex: 1, backgroundColor: "#000" },
  flex: { flex: 1 },
  container: {
    flex: 1,
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#000",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 32,
  },
  input: {
    backgroundColor: "#111",
    color: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 10, // Adjusted padding for Android
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#0047AB",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  linkWrapper: { marginTop: 16, alignItems: "center" },
  link: { color: "#0047AB", fontSize: 14 },
  checkboxContainer: {
    // Ensure this matches the usage in Checkbox.Item
    // If Checkbox.Item is used, it often handles its own container styling.
    // This style might be for a <View> wrapping the Checkbox if not using Checkbox.Item
    // For Checkbox.Item, you might not need a dedicated container style here,
    // but can apply margin directly to Checkbox.Item's style prop.
    marginBottom: 10, // Reduced margin slightly
  },
});

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [keepMeSignedIn, setKeepMeSignedIn] = useState(true);
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";

  // Optional: Load the checkbox preference when the component mounts
  useEffect(() => {
    const loadPreference = async () => {
      try {
        const value = await AsyncStorage.getItem(KEEP_ME_SIGNED_IN_KEY);
        if (value !== null) {
          setKeepMeSignedIn(JSON.parse(value));
        }
      } catch (e) {
        console.error("Failed to load keepMeSignedIn preference.", e);
      }
    };
    loadPreference();
  }, []);

  const handleSignIn = async () => {
    if (loading) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      Alert.alert("Login failed", error.message);
    } else {
      try {
        await AsyncStorage.setItem(
          KEEP_ME_SIGNED_IN_KEY,
          JSON.stringify(keepMeSignedIn)
        );
      } catch (e) {
        console.error("Failed to save keepMeSignedIn preference.", e);
      }
      setLoading(false);
      router.replace("/");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.select({ ios: "padding", android: undefined })}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Welcome Back</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#888"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#888"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Checkbox.Item
            label="Keep me signed in"
            status={keepMeSignedIn ? "checked" : "unchecked"}
            onPress={() => setKeepMeSignedIn(!keepMeSignedIn)}
            color={Colors[colorScheme].tint}
            uncheckedColor={Colors[colorScheme].icon}
            labelStyle={{ color: Colors[colorScheme].text, fontSize: 16 }}
            style={styles.checkboxContainer}
            position="trailing" // <--- ALTERADO PARA "trailing"
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Log In</Text>
            )}
          </TouchableOpacity>
          <View style={styles.linkWrapper}>
            <TouchableOpacity onPress={() => router.push("/register-page")}>
              <Text style={styles.link}>Don’t have an account? Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
