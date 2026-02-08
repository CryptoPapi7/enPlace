import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import { recipe } from "../data/recipe";

export default function RecipeScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{recipe.title}</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Cook")}>
          <Text style={styles.buttonText}>Begin</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8E7"
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 32,
    textAlign: "center",
    color: "#5D4E37"
  },
  button: {
    backgroundColor: "#FF8C42",
    paddingHorizontal: 48,
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
