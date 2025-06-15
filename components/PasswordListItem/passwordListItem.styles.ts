import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  favicon: {
    width: 24,
    height: 24,
    marginRight: 16,
    borderRadius: 4,
  },
  textContainer: {
    flex: 1,
  },
  itemText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  itemUsernameText: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 3,
  },
});
