// app/(tabs)/generator.tsx
import { ThemedText } from "@/components/ThemedText"; //
import { ThemedView } from "@/components/ThemedView"; //
import { Colors } from "@/constants/Colors"; //
import { useColorScheme } from "@/hooks/useColorScheme"; //
import { Feather } from "@expo/vector-icons"; //
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  // Alert, // Alert não é mais necessário para este caso específico
  Clipboard,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
// Importações do react-native-paper
import {
  Dialog,
  Button as PaperButton,
  Text as PaperText,
  Portal,
} from "react-native-paper";

export default function GeneratorScreen() {
  const colorScheme = useColorScheme() ?? "light"; //
  const [passwordLength, setPasswordLength] = useState(12); //
  const [includeUppercase, setIncludeUppercase] = useState(true); //
  const [includeLowercase, setIncludeLowercase] = useState(true); //
  const [includeNumbers, setIncludeNumbers] = useState(true); //
  const [includeSpecialChars, setIncludeSpecialChars] = useState(true); //
  const [generatedPassword, setGeneratedPassword] = useState(""); //
  const [isDialogVisible, setIsDialogVisible] = useState(false); // Novo estado para o Dialog

  useFocusEffect(
    useCallback(() => {
      setGeneratedPassword(""); //
      return () => {};
    }, [])
  );

  const handleGeneratePassword = () => {
    //
    const charset = [];
    if (includeUppercase) charset.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ"); //
    if (includeLowercase) charset.push("abcdefghijklmnopqrstuvwxyz"); //
    if (includeNumbers) charset.push("0123456789"); //
    if (includeSpecialChars) charset.push("!@#$%^&*()_+-=[]{}|;:',.<>?"); //

    if (charset.length === 0) {
      // Em vez de Alert.alert, mostramos o Dialog
      setIsDialogVisible(true); //
      setGeneratedPassword(""); //
      return;
    }

    let newPassword = ""; //
    const fullCharset = charset.join(""); //

    for (let i = 0; i < passwordLength; i++) {
      const randomIndex = Math.floor(Math.random() * fullCharset.length); //
      newPassword += fullCharset[randomIndex]; //
    }
    setGeneratedPassword(newPassword); //
  };

  const hideDialog = () => setIsDialogVisible(false);

  const copyToClipboard = async () => {
    //
    if (generatedPassword) {
      Clipboard.setString(generatedPassword); //
      // Alert.alert("Copiado!", "Senha copiada para a área de transferência."); // Você pode querer mudar isso também
      // Por exemplo, para um Snackbar do react-native-paper ou manter o Alert por enquanto
      // Para manter simples por agora, vamos manter o Alert para o feedback de cópia.
      Alert.alert("Copiado!", "Senha copiada para a área de transferência.");
    }
  };

  const incrementLength = () =>
    setPasswordLength((prev) => Math.min(prev + 1, 128)); //
  const decrementLength = () =>
    setPasswordLength((prev) => Math.max(prev - 1, 4)); //

  const dynamicStyles = {
    //
    container: {
      backgroundColor: Colors[colorScheme].background, //
    },
    sectionTitle: {
      color: Colors[colorScheme].text, //
    },
    optionText: {
      color: Colors[colorScheme].text, //
    },
    lengthValueText: {
      color: Colors[colorScheme].text, //
    },
    generatedPasswordInput: {
      borderColor: Colors[colorScheme].icon, //
      color: Colors[colorScheme].text, //
      backgroundColor: Colors[colorScheme].background, //
    },
    button: {
      backgroundColor: Colors[colorScheme].tint, //
    },
    buttonText: {
      color: Colors[colorScheme].background, //
    },
    iconColor: Colors[colorScheme].tint, //
    switchThumbColor:
      Platform.OS === "android" ? Colors[colorScheme].tint : undefined, //
    switchTrackColor: {
      //
      false: Colors[colorScheme].icon, //
      true: Colors[colorScheme].tint, //
    },
    lengthButton: {
      borderColor: Colors[colorScheme].tint, //
    },
  };

  return (
    <SafeAreaView style={[styles.safeArea, dynamicStyles.container]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* ... (conteúdo existente do ScrollView, como os cards e opções) ... */}
        <ThemedView style={styles.card}>
          <ThemedText style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
            Comprimento da senha
          </ThemedText>
          <View style={styles.lengthControlContainer}>
            <TouchableOpacity
              onPress={decrementLength}
              style={[styles.lengthButton, dynamicStyles.lengthButton]}
            >
              <Feather name="minus" size={24} color={dynamicStyles.iconColor} />
            </TouchableOpacity>
            <Text style={[styles.lengthValue, dynamicStyles.lengthValueText]}>
              {passwordLength}
            </Text>
            <TouchableOpacity
              onPress={incrementLength}
              style={[styles.lengthButton, dynamicStyles.lengthButton]}
            >
              <Feather name="plus" size={24} color={dynamicStyles.iconColor} />
            </TouchableOpacity>
          </View>

          <ThemedText
            style={[
              styles.sectionTitle,
              dynamicStyles.sectionTitle,
              { marginTop: 20 },
            ]}
          >
            Aumente a segurança da sua senha
          </ThemedText>
          {[
            {
              label: "Letras Maiúsculas",
              value: includeUppercase,
              setter: setIncludeUppercase,
            },
            {
              label: "Letras minúsculas",
              value: includeLowercase,
              setter: setIncludeLowercase,
            },
            {
              label: "Números",
              value: includeNumbers,
              setter: setIncludeNumbers,
            },
            {
              label: "Caracteres especiais",
              value: includeSpecialChars,
              setter: setIncludeSpecialChars,
            },
          ].map((option, index) => (
            <View key={index} style={styles.optionContainer}>
              <Text style={[styles.optionText, dynamicStyles.optionText]}>
                {option.label}
              </Text>
              <Switch
                trackColor={dynamicStyles.switchTrackColor}
                thumbColor={dynamicStyles.switchThumbColor}
                ios_backgroundColor={dynamicStyles.switchTrackColor.false}
                onValueChange={option.setter}
                value={option.value}
              />
            </View>
          ))}

          <TouchableOpacity
            style={[styles.button, dynamicStyles.button]}
            onPress={handleGeneratePassword}
          >
            <Text style={[styles.buttonText, dynamicStyles.buttonText]}>
              Gerar senha
            </Text>
            <Feather
              name="arrow-right"
              size={20}
              color={dynamicStyles.buttonText.color}
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>
        </ThemedView>

        {generatedPassword ? (
          <ThemedView style={styles.card}>
            <ThemedText
              style={[styles.sectionTitle, dynamicStyles.sectionTitle]}
            >
              Senha gerada
            </ThemedText>
            <View style={styles.generatedPasswordContainer}>
              <TextInput
                style={[
                  styles.generatedPasswordInput,
                  dynamicStyles.generatedPasswordInput,
                ]}
                value={generatedPassword}
                editable={false}
              />
              <TouchableOpacity
                onPress={copyToClipboard}
                style={styles.copyButton}
              >
                <Feather
                  name="copy"
                  size={24}
                  color={dynamicStyles.iconColor}
                />
              </TouchableOpacity>
            </View>
          </ThemedView>
        ) : null}
      </ScrollView>

      <Portal>
        <Dialog visible={isDialogVisible} onDismiss={hideDialog}>
          <Dialog.Title style={{ color: Colors[colorScheme].text }}>
            Erro
          </Dialog.Title>
          <Dialog.Content>
            <PaperText style={{ color: Colors[colorScheme].text }}>
              Selecione ao menos um tipo de caractere para gerar a senha.
            </PaperText>
          </Dialog.Content>
          <Dialog.Actions>
            <PaperButton
              onPress={hideDialog}
              textColor={Colors[colorScheme].tint}
            >
              OK
            </PaperButton>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  //
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  lengthControlContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(128,128,128,0.1)",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  lengthButton: {
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  lengthValue: {
    fontSize: 22,
    fontWeight: "bold",
    minWidth: 40,
    textAlign: "center",
  },
  optionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128,128,128,0.1)",
  },
  optionText: {
    fontSize: 16,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 25,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
  },
  generatedPasswordContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  generatedPasswordInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 10,
  },
  copyButton: {
    padding: 10,
  },
});
