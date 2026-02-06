import { View, Text, Button, StyleSheet } from "react-native";
import { recipe } from "../data/recipe";

export default function RecipeScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{recipe.title}</Text>
      <Button title="Begin" onPress={() => navigation.navigate("Cook")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  title: {
    fontSize: 28,
    marginBottom: 24
  }
});
