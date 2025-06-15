import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  formContainer: {
    padding: 20,
    width: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  instructions: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    opacity: 0.9,
    paddingHorizontal: 10,
  },
  input: {
    marginBottom: 15,
    width: "90%",
    alignSelf: "center",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "90%",
    alignSelf: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
