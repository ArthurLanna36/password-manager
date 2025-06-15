// app/(tabs)/styles/generator.styles.ts
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonContainer: {
    marginTop: 24,
    alignItems: "center",
    justifyContent: "center",
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
  checkboxItemContainer: {},
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
