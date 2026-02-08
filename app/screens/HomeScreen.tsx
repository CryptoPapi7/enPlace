import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function HomeScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>enPlace</Text>
      <Text style={styles.subtitle}>one dish, perfectly</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Recipe")}>
        <Text style={styles.buttonText}>Start cooking</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF8E7"
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#5D4E37"
  },
  subtitle: {
    fontSize: 16,
    color: "#87CEEB",
    marginBottom: 32,
    fontWeight: "600"
  },
  button: {
    backgroundColor: "#FF8C42",
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
    shadowColor: "#FF8C42",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  buttonText: {
    color: "#FFF8E7",
    fontSize: 18,
    fontWeight: "600"
  }
});
