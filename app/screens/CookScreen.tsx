import { View, Button, StyleSheet, SafeAreaView, Text, TouchableOpacity, ScrollView } from "react-native";
import { useState, useRef } from "react";
import LottieView from 'lottie-react-native';
import { recipe, Step } from "../data/recipe";

// Flatten all steps into a single array for cook mode
const allSteps: Step[] = [
  { id: "intro", title: "Ready to cook?", instructions: [recipe.title, `Total time: ${recipe.totalTimeMinutes} minutes`, `${recipe.servings} servings`], durationMinutes: 0, active: false },
  { id: "section-curry", title: "CHICKEN CURRY", instructions: ["---"], durationMinutes: 0, active: false },
  ...recipe.sections.curry,
  { id: "section-roti", title: "PARATHA ROTI", instructions: ["---"], durationMinutes: 0, active: false },
  ...recipe.sections.roti,
  { id: "done", title: "Done!", instructions: ["Your chicken curry with roti is ready.", "Serve curry in center with torn roti around it.", "Eat with your hands!"], durationMinutes: 0, active: false },
];

// Steps that benefit from stirring animation
const STIRRING_STEPS = ['curry-2', 'curry-4', 'curry-5'];

export default function CookScreen({ navigation }: any) {
  const [stepIndex, setStepIndex] = useState(0);
  const [isStirring, setIsStirring] = useState(false);
  const animationRef = useRef<LottieView>(null);
  const step = allSteps[stepIndex];

  const shouldShowStirring = STIRRING_STEPS.includes(step.id);

  const toggleStirring = () => {
    if (isStirring) {
      animationRef.current?.pause();
    } else {
      animationRef.current?.play();
    }
    setIsStirring(!isStirring);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Scrollable content area */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.stepNumber}>
          Step {stepIndex} of {allSteps.length - 1}
        </Text>
        <Text style={styles.title}>{step.title}</Text>
        <View style={styles.instructions}>
          {step.instructions.map((inst, i) => (
            <Text key={i} style={styles.instruction}>{inst}</Text>
          ))}
        </View>
        
        {step.durationMinutes > 0 && (
          <Text style={styles.timer}>⏱️ {step.durationMinutes} min{step.durationMinutes !== 1 ? 's' : ''}</Text>
        )}
        {step.active && (
          <Text style={styles.activeBadge}>Active cooking</Text>
        )}
      </ScrollView>

      {/* Animation section - separate from scroll */}
      {shouldShowStirring && (
        <View style={styles.animationSection}>
          <LottieView
            ref={animationRef}
            source={require('../assets/stirring.json')}
            style={styles.animation}
            loop
            autoPlay={false}
            resizeMode="cover"
          />
          <TouchableOpacity style={styles.stirButton} onPress={toggleStirring}>
            <Text style={styles.stirButtonText}>
              {isStirring ? '⏸ Pause' : '🥄 Stir'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Controls - fixed at bottom */}
      <View style={styles.controls}>
        <View style={styles.buttonGroup}>
          <Button title="🏠 Home" onPress={() => navigation.navigate("Home")} />
          <View style={{ width: 8 }} />
          <Button
            title="← Back"
            disabled={stepIndex === 0}
            onPress={() => setStepIndex(stepIndex - 1)}
          />
        </View>
        <Button
          title={stepIndex === allSteps.length - 1 ? "Done" : "Next →"}
          onPress={() => stepIndex < allSteps.length - 1 && setStepIndex(stepIndex + 1)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E7'
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 16,
  },
  stepNumber: {
    fontSize: 14,
    color: '#87CEEB',
    marginBottom: 8,
    fontWeight: '600'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#5D4E37'
  },
  instructions: {
    marginBottom: 16
  },
  instruction: {
    fontSize: 18,
    lineHeight: 28,
    marginBottom: 12,
    color: '#333'
  },
  timer: {
    fontSize: 20,
    color: '#FF8C42',
    marginBottom: 12,
    fontWeight: '600'
  },
  activeBadge: {
    fontSize: 14,
    color: '#5D4E37',
    backgroundColor: '#A8DADC',
    padding: 8,
    borderRadius: 8,
    alignSelf: 'flex-start'
  },
  animationSection: {
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: '#A8DADC',
    borderTopWidth: 2,
    borderTopColor: '#87CEEB',
    minHeight: 180,
  },
  animation: {
    width: 200,
    height: 150,
  },
  stirButton: {
    backgroundColor: '#FF8C42',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 8,
  },
  stirButtonText: {
    color: '#FFF8E7',
    fontSize: 16,
    fontWeight: '600',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#FFF8E7',
    borderTopWidth: 2,
    borderTopColor: '#87CEEB',
  },
  buttonGroup: {
    flexDirection: 'row'
  },
});
