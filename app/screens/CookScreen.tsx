import { View, Button, StyleSheet, SafeAreaView, Text, TouchableOpacity, ScrollView, Platform } from "react-native";
import { Audio } from 'expo-av';
import { useState, useRef, useEffect, useMemo } from "react";
import LottieView from 'lottie-react-native';
import { Step } from "../data/recipe";
import { StatusBar } from 'expo-status-bar';
import { setActiveCooking, updateCurrentStep, clearActiveCooking } from '../utils/activeCooking';

// ✅ Import all recipes and map by id
import {
  chickenCurryRecipe,
  beefRendangRecipe,
  freshPastaRecipe,
  sourdoughRecipe,
  pepperpotRecipe,
  doublesRecipe,
  fishCurryRecipe,
  dhalPuriRecipe,
  pastaPomodoroRecipe,
  rotiCurryChannaRecipe,
  phoBoRecipe,
  jerkChickenRecipe,
} from "../data/recipes";

const RECIPE_MAP: Record<string, any> = {
  'chicken-curry': chickenCurryRecipe,
  'beef-rendang': beefRendangRecipe,
  'fresh-pasta': freshPastaRecipe,
  'sourdough': sourdoughRecipe,
  'pepperpot': pepperpotRecipe,
  'doubles': doublesRecipe,
  'fish-curry': fishCurryRecipe,
  'dhal-puri': dhalPuriRecipe,
  'pasta-pomodoro': pastaPomodoroRecipe,
  'roti-curry-channa': rotiCurryChannaRecipe,
  'pho-bo': phoBoRecipe,
  'jerk-chicken': jerkChickenRecipe,
};

// Lazy import speech recognition to avoid crash if not available
let SpeechRecognition: any = null;
try {
  SpeechRecognition = require('expo-speech-recognition');
} catch (e) {
  console.warn('Speech recognition not available');
}

// Steps that benefit from stirring animation
const STIRRING_STEPS = ['curry-2', 'curry-4', 'curry-5'];

// Voice commands we recognize
const VOICE_COMMANDS = {
  NEXT: ['next', 'forward', 'continue', 'go on', 'next step'],
  BACK: ['back', 'previous', 'go back', 'last step', 'before'],
  REPEAT: ['repeat', 'again', 'say again', 'read again', 'what'],
} as const;

// ✅ Build cook steps dynamically from selected recipe
function buildSteps(recipe: any): Step[] {
  const steps: Step[] = [];

  steps.push({
    id: 'intro',
    title: 'Ready to cook?',
    instructions: [recipe.title, `Total time: ${recipe.totalTimeMinutes} minutes`, `${recipe.servings} servings`],
    durationMinutes: 0,
    active: false,
  });

  Object.keys(recipe.sections).forEach((sectionKey) => {
    steps.push({
      id: `section-${sectionKey}`,
      title: sectionKey.toUpperCase(),
      instructions: ['---'],
      durationMinutes: 0,
      active: false,
    });

    recipe.sections[sectionKey].forEach((s: Step) => steps.push(s));
  });

  steps.push({
    id: 'done',
    title: 'Done!',
    instructions: ['Your dish is ready. Enjoy!'],
    durationMinutes: 0,
    active: false,
  });

  return steps;
}

export default function CookScreen({ navigation, route }: any) {
  const recipeId = route?.params?.recipeId;
  const recipe = RECIPE_MAP[recipeId];

  // Handle invalid recipe (backward compatibility for old saved states)
  if (!recipe) {
    // Clear invalid active cooking state
    clearActiveCooking();
    
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🍳</Text>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#5D4E37', marginBottom: 8 }}>Recipe not found</Text>
          <Text style={{ fontSize: 14, color: '#8B7355', textAlign: 'center', marginBottom: 24 }}>
            This recipe may have been moved or updated.{'\n'}Please select a recipe from your library.
          </Text>
          <TouchableOpacity 
            style={{ backgroundColor: '#FF8C42', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
            onPress={() => navigation.navigate('RecipeLibrary')}
          >
            <Text style={{ color: '#FFF', fontWeight: '700' }}>Browse Recipes →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const servings = route?.params?.servings || recipe.servings;
  const resumeStep = route?.params?.resumeStep || 0;

  const allSteps = useMemo(() => buildSteps(recipe), [recipeId]);

  const [stepIndex, setStepIndex] = useState(resumeStep);
  const [isStirring, setIsStirring] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const animationRef = useRef<LottieView>(null);
  const step = allSteps[stepIndex];

  const shouldShowStirring = STIRRING_STEPS.includes(step.id);

  useEffect(() => {
    if (stepIndex > 0) {
      setActiveCooking({
        recipeId: recipe.id,
        recipeName: recipe.title,
        currentStep: stepIndex,
        totalSteps: allSteps.length,
        startedAt: new Date().toISOString(),
      });
    }
  }, [stepIndex]);

  const goNext = () => {
    if (stepIndex < allSteps.length - 1) {
      setStepIndex(stepIndex + 1);
      updateCurrentStep(stepIndex + 1);
    } else {
      clearActiveCooking();
      navigation.goBack();
    }
  };

  const goBack = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.stepNumber}>Step {stepIndex + 1} of {allSteps.length}</Text>
        <Text style={styles.title}>{step.title}</Text>
        {step.instructions.map((i, idx) => (
          <Text key={idx} style={styles.instruction}>• {i}</Text>
        ))}
      </ScrollView>

      {/* ✅ Home button removed — bottom tab already exists */}
      <View style={styles.controls}>
        <View style={styles.buttonGroup}>
          <Button title="← Back" disabled={stepIndex === 0} onPress={goBack} />
        </View>
        <Button title={stepIndex === allSteps.length - 1 ? 'Done' : 'Next →'} onPress={goNext} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8E7' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 24 },
  stepNumber: { fontSize: 14, color: '#87CEEB', marginBottom: 8, fontWeight: '600' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
  instruction: { fontSize: 18, marginBottom: 8 },
  controls: { padding: 16, borderTopWidth: 1, borderColor: '#eee' },
  buttonGroup: { marginBottom: 8 },
});
