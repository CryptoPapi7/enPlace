import { View, Text, Button, StyleSheet, SafeAreaView } from "react-native";
import { recipe } from "../data/recipe";

export default function RecipeScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{recipe.title}</Text>
        <Button title="Begin" onPress={() => navigation.navigate("Cook")} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24
  },
  title: {
    fontSize: 28,
    marginBottom: 24,
    textAlign: "center"
  }
});
