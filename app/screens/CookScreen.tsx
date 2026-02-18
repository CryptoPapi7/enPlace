import { View, StyleSheet, SafeAreaView, Text, TouchableOpacity, ScrollView, Platform } from "react-native";
import { Audio } from 'expo-av';
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { router, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import LottieView from 'lottie-react-native';
import { Step } from "../data/recipe";
import { StatusBar } from 'expo-status-bar';
import { setActiveCooking, updateCurrentStep, clearActiveCooking } from '../utils/activeCooking';
import { spacing, typography, shadows } from '../theme';
import { useTheme } from '@/providers/ThemeProvider';

// Configure audio session for iOS speech
async function setupAudio() {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
    console.log('🔊 Audio session configured');
  } catch (e) {
    console.log('Audio setup error:', e);
  }
}

// ✅ Import all recipes and map by id
import {
  chickenCurryRecipe,
  beefRendangRecipe,
  sourdoughRecipe,
  pepperpotRecipe,
  doublesRecipe,
  fishCurryRecipe,
  dhalPuriRecipe,
  pastaPomodoroRecipe,
  phoBoRecipe,
  jerkChickenRecipe,
  valentineDinnerRecipe,
  cacioEPepeRecipe,
  tonkotsuRamenRecipe,
  birriaTacosRecipe,
} from "../data/recipes";

const RECIPE_MAP: Record<string, any> = {
  'chicken-curry': chickenCurryRecipe,
  'beef-rendang': beefRendangRecipe,
  'sourdough': sourdoughRecipe,
  'pepperpot': pepperpotRecipe,
  'doubles': doublesRecipe,
  'fish-curry': fishCurryRecipe,
  'dhal-puri': dhalPuriRecipe,
  'pasta-pomodoro': pastaPomodoroRecipe,
  'pho-bo': phoBoRecipe,
  'jerk-chicken': jerkChickenRecipe,
  'valentine-dinner': valentineDinnerRecipe,
  'cacio-e-pepe': cacioEPepeRecipe,
  'tonkotsu-ramen': tonkotsuRamenRecipe,
  'birria-tacos': birriaTacosRecipe,
};

// Steps that benefit from stirring animation
const STIRRING_STEPS = ['curry-2', 'curry-4', 'curry-5'];

// ✅ Scale ingredient amount based on servings ratio
function scaleIngredientAmount(amount: string | number, ratio: number): string {
  if (typeof amount === 'number') {
    const scaled = Math.round(amount * ratio * 10) / 10;
    return scaled.toString();
  }
  // For "to taste" or other strings, return as-is
  if (typeof amount === 'string') {
    const num = parseFloat(amount);
    if (isNaN(num)) return amount;
    const scaled = Math.round(num * ratio * 10) / 10;
    return amount.replace(num.toString(), scaled.toString());
  }
  return String(amount);
}

// ✅ Build cook steps dynamically from selected recipe
function buildSteps(recipe: any, effectiveServings: number): Step[] {
  const steps: Step[] = [];
  const ratio = effectiveServings / recipe.servings;

  // 1. MASTER PREP LIST - All ingredients from all sections
  const allIngredients: string[] = [];
  Object.keys(recipe.ingredients || {}).forEach((sectionKey) => {
    const sectionIngredients = recipe.ingredients[sectionKey] || [];
    sectionIngredients.forEach((ing: any) => {
      const scaledAmount = scaleIngredientAmount(ing.amount, ratio);
      allIngredients.push(`${scaledAmount} ${ing.item}`);
    });
  });

  steps.push({
    id: 'prep',
    title: 'Ingredient Prep Checklist',
    instructions: [
      `Gather everything you'll need for ${effectiveServings} servings:`,
      '',
      ...allIngredients,
      '',
      'Tap Next when you\'re ready to start cooking!',
    ],
    durationMinutes: 0,
    active: false,
  });

  // 2. SECTIONS - Each with its ingredients, then cooking steps
  Object.keys(recipe.sections).forEach((sectionKey) => {
    // Section ingredient list
    const sectionIngredients = recipe.ingredients?.[sectionKey] || [];
    const ingredientLines = sectionIngredients.map((ing: any) => {
      const scaledAmount = scaleIngredientAmount(ing.amount, ratio);
      return `• ${scaledAmount} ${ing.item}`;
    });

    steps.push({
      id: `section-${sectionKey}-ingredients`,
      title: `For the ${sectionKey}`,
      instructions: [
        `Ingredients you'll need for this section:`,
        ...ingredientLines,
      ],
      durationMinutes: 0,
      active: false,
    });

    // Cooking steps
    recipe.sections[sectionKey].forEach((s: Step) => steps.push(s));
  });

  steps.push({
    id: 'done',
    title: 'Done',
    instructions: ['Your dish is ready. Enjoy!'],
    durationMinutes: 0,
    active: false,
  });

  return steps;
}

export default function CookScreen() {
  const { colors, isMichelin } = useTheme();
  const dynamicStyles = createStyles(colors, isMichelin);
  const { recipeId, servings, resumeStep } = useLocalSearchParams<{ recipeId?: string; servings?: string; resumeStep?: string }>();
  const recipe = recipeId ? RECIPE_MAP[recipeId] : null;

  // Handle invalid recipe
  if (!recipe) {
    clearActiveCooking();
    
    return (
      <SafeAreaView style={dynamicStyles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🍳</Text>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#5D4E37', marginBottom: 8 }}>Recipe not found</Text>
          <Text style={{ fontSize: 14, color: '#8B7355', textAlign: 'center', marginBottom: 24 }}>
            Please go back and select a recipe.
          </Text>
          <TouchableOpacity 
            style={{ backgroundColor: '#FF8C42', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
            onPress={() => router.back()}
          >
            <Text style={{ color: '#FFF', fontWeight: '700' }}>Go Back →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const effectiveServings = servings ? Number(servings) : recipe.servings;
  const allSteps = useMemo(() => buildSteps(recipe, effectiveServings), [recipeId, effectiveServings]);

  const [stepIndex, setStepIndex] = useState(resumeStep ? Number(resumeStep) : 0);
  const [isStirring, setIsStirring] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const animationRef = useRef<LottieView>(null);
  const step = allSteps[stepIndex];

  // Setup audio on mount
  useEffect(() => {
    setupAudio();
  }, []);

  const shouldShowStirring = STIRRING_STEPS.includes(step.id);

  // Configure audio session for speech (iOS needs this)
  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          interruptionModeIOS: Audio.InterruptionModeIOS.DoNotMix,
          playsInSilentModeIOS: true,
          interruptionModeAndroid: Audio.InterruptionModeAndroid.DoNotMix,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        console.log('🔊 Audio mode set');
      } catch (error) {
        console.log('🔊 Audio setup error:', error);
      }
    };
    setupAudio();
  }, []);

  // Persist cooking state (start immediately)
  useEffect(() => {
    setActiveCooking({
      recipeId: recipe.id,
      recipeName: recipe.title,
      currentStep: stepIndex,
      totalSteps: allSteps.length,
      startedAt: new Date().toISOString(),
    });
  }, [stepIndex, recipe, allSteps.length]);

  // Speak step using GPT TTS server
  const speakStep = useCallback(async () => {
    if (isSpeaking) {
      // Stop current playback
      Speech?.stop();
      setIsSpeaking(false);
      return;
    }

    const TTS_URL = process.env.EXPO_PUBLIC_TTS_URL;
    const ENPLACE_SECRET = process.env.EXPO_PUBLIC_ENPLACE_SECRET;

    // Build clean text without dashes
    const cleanInstructions = step.instructions
      .filter(i => i !== '---')
      .join('. ');
    const textToSpeak = `${step.title}. ${cleanInstructions}`;

    if (!TTS_URL || !ENPLACE_SECRET) {
      console.log('TTS env vars missing, using fallback');
      Speech.speak(textToSpeak, { language: 'en' });
      return;
    }

    console.log('🔊 Speaking via GPT TTS:', textToSpeak);
    setIsSpeaking(true);

    try {
      const response = await fetch(TTS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-enplace-secret': ENPLACE_SECRET,
        },
        body: JSON.stringify({ text: textToSpeak }),
      });

      if (!response.ok) {
        const err = await response.text();
        console.error('TTS failed:', err);
        Speech.speak(textToSpeak, { language: 'en' });
        setIsSpeaking(false);
        return;
      }

      const audioData = await response.arrayBuffer();
      const bytes = new Uint8Array(audioData);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = global.btoa ? global.btoa(binary) : binary;
      const sound = new Audio.Sound();
      
      await sound.loadAsync({ uri: `data:audio/mp3;base64,${base64}` });
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsSpeaking(false);
          sound.unloadAsync();
        }
      });
      
      await sound.playAsync();
    } catch (e) {
      console.error('TTS error', e);
      Speech.speak(textToSpeak, { language: 'en' });
      setIsSpeaking(false);
    }
  }, [step, isSpeaking]);

  // Stop speech on unmount or step change
  useEffect(() => {
    return () => {
      Speech.stop();
      setIsSpeaking(false);
    };
  }, [stepIndex]);

  const goNext = () => {
    Speech.stop();
    setIsSpeaking(false);
    
    if (stepIndex < allSteps.length - 1) {
      setStepIndex(stepIndex + 1);
      updateCurrentStep(stepIndex + 1);
    } else {
      clearActiveCooking();
      router.back();
    }
  };

  const goBack = () => {
    Speech.stop();
    setIsSpeaking(false);
    
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
      updateCurrentStep(stepIndex - 1);
    }
  };

  const exitCooking = () => {
    Speech.stop();
    // DON'T clear active cooking — let user resume later
    router.push('/(tabs)/cook');
  };

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <StatusBar style={isMichelin ? 'light' : 'dark'} />

      {/* Header with Exit and Voice */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity style={dynamicStyles.exitButton} onPress={exitCooking}>
          <Text style={dynamicStyles.exitButtonText}>✕</Text>
        </TouchableOpacity>
        
        <View style={dynamicStyles.progressContainer}>
          <View style={dynamicStyles.progressBar}>
            <View 
              style={[
                dynamicStyles.progressFill, 
                { width: `${((stepIndex + 1) / allSteps.length) * 100}%` }
              ]} 
            />
          </View>
          <Text style={dynamicStyles.progressText}>
            Step {stepIndex + 1} of {allSteps.length}
          </Text>
        </View>
        
        <View style={[dynamicStyles.voiceGlow, isSpeaking && dynamicStyles.voiceGlowActive]}>
          <TouchableOpacity 
            style={[dynamicStyles.voiceButton, isSpeaking && dynamicStyles.voiceButtonActive]} 
            onPress={speakStep}
          >
            <Text style={dynamicStyles.voiceButtonText}>
              {isSpeaking ? '⏹' : '🔊'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={dynamicStyles.scrollView} contentContainerStyle={dynamicStyles.scrollContent}>
        <Text style={dynamicStyles.stepTitle}>{step.title}</Text>
        
        {step.instructions.map((instruction, idx) => (
          <View key={idx} style={dynamicStyles.prepRow}>
            <Text style={dynamicStyles.prepText}>{instruction}</Text>
          </View>
        ))}

        {step.durationMinutes > 0 && (
          <View style={dynamicStyles.durationBadge}>
            <Text style={dynamicStyles.durationText}>⏱️ {step.durationMinutes} min</Text>
          </View>
        )}
      </ScrollView>

      {/* Navigation Bar */}
      <View style={dynamicStyles.navBar}>
        <TouchableOpacity 
          style={[dynamicStyles.navButton, stepIndex === 0 && dynamicStyles.navButtonDisabled]} 
          onPress={goBack}
          disabled={stepIndex === 0}
        >
          <Text style={[dynamicStyles.navButtonText, stepIndex === 0 && dynamicStyles.navButtonTextDisabled]}>
            ← Back
          </Text>
        </TouchableOpacity>
        
        <View style={dynamicStyles.stepDots}>
          {allSteps.map((_, idx) => (
            <View 
              key={idx} 
              style={[
                dynamicStyles.dot, 
                idx === stepIndex && dynamicStyles.dotActive,
                idx < stepIndex && dynamicStyles.dotCompleted
              ]} 
            />
          ))}
        </View>
        
        <TouchableOpacity style={dynamicStyles.navButton} onPress={goNext}>
          <Text style={dynamicStyles.navButtonText}>
            {stepIndex === allSteps.length - 1 ? 'Finish ✓' : 'Next →'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: any, isMichelin: boolean) => StyleSheet.create({
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    color: isMichelin ? colors.white : colors.neutral[900],
    marginBottom: spacing.md,
  },
  stepInstruction: {
    fontSize: 18,
    lineHeight: 26,
    color: isMichelin ? '#E5E5E5' : colors.neutral[800],
    marginBottom: spacing.lg,
  },

  container: { 
    flex: 1, 
    backgroundColor: isMichelin ? colors.background?.primary : colors.cream[50]
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  exitButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  exitButtonText: {
    fontSize: 20,
    color: '#5D4E37',
    fontWeight: '600',
  },
  
  // Progress
  progressContainer: {
    flex: 1,
    marginHorizontal: 16,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: colors.neutral[200],
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF8C42',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#8B7355',
    marginTop: 6,
    fontWeight: '500',
  },
  
  // Voice Button
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceButtonActive: {
    backgroundColor: colors.primary[500],
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 24,
    elevation: 16,
  },
  voiceButtonText: {
    fontSize: 20,
  },
  
  // Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 16,
  },
  instructionRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 18,
    color: '#FF8C42',
    marginRight: 12,
    marginTop: 2,
  },

  // ✅ Medium-dense prep checklist (no bullets)
  prepRow: {
    marginBottom: 6,
  },
  prepText: {
    fontSize: 17,
    lineHeight: 22,
    color: isMichelin ? '#E5E5E5' : colors.neutral[800],
  },

  instruction: {
    fontSize: 22,
    color: '#5D4E37',
    lineHeight: 32,
    flex: 1,
  },
  durationBadge: {
    backgroundColor: colors.primary[500] + '20',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary[400] + '40',
  },
  durationText: {
    fontSize: 15,
    color: colors.primary[600],
    fontWeight: '700',
  },
  
  // Navigation Bar
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: isMichelin ? colors.background?.primary : colors.white,
    borderTopWidth: 1,
    borderTopColor: isMichelin ? colors.neutral[700] : colors.neutral[200],
  },
  navButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FF8C42',
    borderRadius: 12,
    minWidth: 90,
  },
  navButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  navButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  navButtonTextDisabled: {
    color: '#999',
  },
  
  // Voice Button
  voiceGlow: {
    padding: 4,
  },
  voiceGlowActive: {
    backgroundColor: colors.primary[500] + '30',
    borderRadius: 26,
    padding: 4,
  },
  voiceButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  voiceButtonActive: {
    backgroundColor: colors.primary[500],
  },
  voiceButtonText: {
    fontSize: 20,
  },
  
  // Step Dots
  stepDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginHorizontal: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 120,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.neutral[200],
  },
  dotActive: {
    backgroundColor: colors.primary[500],
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotCompleted: {
    backgroundColor: colors.primary[400],
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});