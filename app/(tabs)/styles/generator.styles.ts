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
    padding: 20,
    paddingBottom: 40, // Ensure space for the last card
  },
  card: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    // Shadow and elevation are good to keep for card style
    shadowColor: "#000", // Kept from original
    shadowOffset: { width: 0, height: 2 }, // Kept from original
    shadowOpacity: 0.1, // Kept from original
    shadowRadius: 3.84, // Kept from original
    elevation: 5, // Kept from original
  },
  sectionTitle: {
    // This style is now mostly for margin/font, color is dynamic
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  lengthControlContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(128,128,128,0.1)", // Kept for consistency
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  lengthButton: {
    // Border color is dynamic
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  lengthValue: {
    // Color is dynamic
    fontSize: 22,
    fontWeight: "bold",
    minWidth: 40,
    textAlign: "center",
  },
  // optionContainer and optionText are likely not needed anymore
  // as Checkbox.Item handles its own layout.
  // If you need specific styling for the Checkbox.Item container:
  checkboxItemContainer: {
    // Example: add padding or margin if needed
    // paddingVertical: 2, // Checkbox.Item already has some padding
  },
  button: {
    // Background color is dynamic
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 25,
  },
  buttonText: {
    // Color is dynamic
    fontSize: 18,
    fontWeight: "600",
  },
  generatedPasswordContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  generatedPasswordInput: {
    // Border, text, background colors are dynamic
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
