import { View, Text, StyleSheet } from "react-native";

export default function StepView({ text }: { text: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}
