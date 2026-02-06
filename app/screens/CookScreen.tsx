import { View, Button, StyleSheet } from "react-native";
import { useState } from "react";
import { recipe } from "../data/recipe";
import StepView from "../components/StepView";

export default function CookScreen() {
  const [stepIndex, setStepIndex] = useState(0);

  const step = recipe.steps[stepIndex];

  return (
    <View style={styles.container}>
      <StepView text={step} />
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
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16
  }
});
