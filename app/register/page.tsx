// app/register/page.tsx
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";
import { supabase } from "../../constants/supabase";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      return Alert.alert("Erro no cadastro", error.message);
    }
    Alert.alert(
      "Quase lá!",
      "Verifique seu e-mail e clique no link de confirmação antes de entrar."
    );
    router.replace("../login/page");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastrar</Text>
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Cadastrar" onPress={handleSignUp} />
      <Text style={styles.link} onPress={() => router.push("../login/page")}>
        Já tem conta? Faça login
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: "center" },
  title: { fontSize: 24, textAlign: "center", marginBottom: 24 },
  input: { borderBottomWidth: 1, marginBottom: 16, padding: 8 },
  link: { marginTop: 16, textAlign: "center", color: "#0066CC" },
});
