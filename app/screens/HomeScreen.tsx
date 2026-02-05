import { View, Text, Button, StyleSheet } from "react-native";

export default function HomeScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>EnPlace</Text>
      <Button title="Start cooking" onPress={() => navigation.navigate("Recipe")} />
    </View>
  );
}
