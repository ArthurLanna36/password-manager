import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 5,
  },
  scrollContainer: {
    padding: 20,
  },
  input: {
    marginBottom: 16,
  },
  divider: {
    marginVertical: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ccc",
  },
  button: {
    flex: 1,
  },
  cancelButton: {
    marginRight: 8,
  },
  submitButton: {
    marginLeft: 8,
  },
  actionButton: {
    marginBottom: 16,
  },
});
