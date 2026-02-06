import { View, Button, StyleSheet, SafeAreaView } from "react-native";
import { useState } from "react";
import { recipe } from "../data/recipe";
import StepView from "../components/StepView";

export default function CookScreen() {
  const [stepIndex, setStepIndex] = useState(0);

  const step = recipe.steps[stepIndex];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <StepView text={step} />
      </View>
      <View style={styles.controls}>
        <Button
          title="Back"
          disabled={stepIndex === 0}
          onPress={() => setStepIndex(stepIndex - 1)}
        />
        <Button
          title="Next"
          disabled={stepIndex === recipe.steps.length - 1}
          onPress={() => setStepIndex(stepIndex + 1)}
        />
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
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16
  }
});
