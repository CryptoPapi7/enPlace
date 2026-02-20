import { View, StyleSheet, SafeAreaView, Text, TouchableOpacity, ScrollView, Platform } from "react-native";
import { Audio } from 'expo-av';
import { useState, useEffect, useMemo, useCallback } from "react";
import { router, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import { Step } from "../data/recipe";
import { StatusBar } from 'expo-status-bar';
import { setActiveCooking, updateCurrentStep, clearActiveCooking } from '../utils/activeCooking';
import { spacing, layout, typography, shadows, fonts } from '../theme';
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
  const { colors } = useTheme();
  const dynamicStyles = createStyles(colors);
  const { recipeId, servings, resumeStep } = useLocalSearchParams<{ recipeId?: string; servings?: string; resumeStep?: string }>();
  const recipe = recipeId ? RECIPE_MAP[recipeId] : null;

  // Handle invalid recipe
  if (!recipe) {
    clearActiveCooking();
    
    return (
      <SafeAreaView style={dynamicStyles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🍳</Text>
          <Text style={[typography.h2, { color: colors.neutral[700], marginBottom: 8 }]}>Recipe not found</Text>
          <Text style={{ fontSize: 14, color: colors.neutral[500], textAlign: 'center', marginBottom: 24 }}>
            Please go back and select a recipe.
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: colors.primary[500], paddingHorizontal: layout.screenGutter, paddingVertical: 12, borderRadius: 12 }}
            onPress={() => router.back()}
          >
            <Text style={[typography.bodyMedium, { color: colors.white }]}>Go Back →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const effectiveServings = servings ? Number(servings) : recipe.servings;
  const allSteps = useMemo(() => buildSteps(recipe, effectiveServings), [recipeId, effectiveServings]);

  const [stepIndex, setStepIndex] = useState(resumeStep ? Number(resumeStep) : 0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const step = allSteps[stepIndex];

  // Setup audio on mount
  useEffect(() => {
    setupAudio();
  }, []);

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
      <StatusBar style="dark" />

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
              {isSpeaking ? '⏹' : '🗣️'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={dynamicStyles.scrollView} contentContainerStyle={dynamicStyles.scrollContent}>
        <Text style={[dynamicStyles.stepTitle, { fontSize: 22 }]}>{step.title}</Text>
        
        {step.instructions.map((instruction, idx) => {
          // Align ingredient amounts + items (prep-style lines)
          const line = instruction.startsWith('• ') ? instruction.slice(2) : instruction;
          // Parse amount with optional unit (match RecipeScreen behavior)
          const UNIT_WORDS = ['kg','g','lb','lbs','oz','ml','l','tsp','tbsp','cup','cups'];
          const parts = line.split(/\s+/);
          let amount = '';
          let item = line;

          if (/^\d+[\d./]*$/.test(parts[0])) {
            if (parts[1] && UNIT_WORDS.includes(parts[1].toLowerCase())) {
              amount = `${parts[0]} ${parts[1]}`;
              item = parts.slice(2).join(' ');
            } else {
              amount = parts[0];
              item = parts.slice(1).join(' ');
            }
          }

          // Align numeric amounts OR known non-numeric amount phrases
          const NON_NUMERIC_AMOUNTS = ['to taste', 'optional', 'as needed'];
          const lowerLine = line.toLowerCase();
          const nonNumericMatch = NON_NUMERIC_AMOUNTS.find(p => lowerLine.startsWith(p));

          if (amount || nonNumericMatch) {
            const finalAmount = amount || nonNumericMatch;
            const finalItem = amount ? item : line.slice(nonNumericMatch.length).trim();
            return (
              <View key={idx} style={dynamicStyles.prepRow}>
                <Text style={dynamicStyles.prepAmount}>{finalAmount}</Text>
                <Text style={dynamicStyles.prepItem}>{finalItem}</Text>
              </View>
            );
          }

          return (
            <View key={idx} style={dynamicStyles.prepRow}>
              <Text style={dynamicStyles.prepText}>{instruction}</Text>
            </View>
          );
        })}

        {step.durationMinutes > 0 && (
          <View style={dynamicStyles.durationBadge}>
            <Text style={dynamicStyles.durationText}>{step.durationMinutes} min</Text>
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

const createStyles = (colors: any) => StyleSheet.create({
  stepTitle: {
    ...typography.h2,
    fontSize: typography.h2.fontSize - 4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  stepInstruction: {
    ...typography.body,
    lineHeight: 28,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },

  container: {
    flex: 1,
    backgroundColor: colors.surface.primary,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenGutter,
    paddingTop: 12,
    paddingBottom: 8,
  },
  exitButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background?.secondary ?? colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  exitButtonText: {
    ...typography.bodyMedium,
    color: colors.neutral[700],
  },
  
  // Progress
  progressContainer: {
    flex: 1,
    marginHorizontal: 16,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 3,
    backgroundColor: colors.border.subtle,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.text.muted,
    borderRadius: 2,
  },
  progressText: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: 6,
  },
  
  // Voice Button
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceButtonActive: {
    backgroundColor: colors.accent.primary,
    shadowColor: colors.accent.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 24,
    elevation: 16,
  },
  voiceButtonText: {
    ...typography.label,
    color: colors.text.secondary,
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
    color: colors.primary[500],
    marginRight: 12,
    marginTop: 2,
  },

  // ✅ Medium-dense prep checklist (no bullets)
  prepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  prepAmount: {
    ...typography.body,
    fontSize: 18,
    lineHeight: 30,
    color: colors.text.secondary,
    minWidth: 96,
    marginRight: 12,
  },
  prepItem: {
    ...typography.body,
    fontSize: 18,
    lineHeight: 30,
    color: colors.text.primary,
    flex: 1,
  },
  prepText: {
    ...typography.body,
    fontSize: 18,
    lineHeight: 30,
    color: colors.text.primary,
  },

  instruction: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 32,
    flex: 1,
  },
  durationBadge: {
    backgroundColor: colors.surface.raised,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  durationText: {
    fontFamily: fonts.mono,
    fontSize: 16,
    color: colors.accent.primary,
  },
  
  // Navigation Bar
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenGutter,
    paddingVertical: 12,
    backgroundColor: colors.surface.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  navButton: {
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 10,
    backgroundColor: colors.surface.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  navButtonDisabled: {
    backgroundColor: colors.surface.secondary,
    borderColor: colors.border.subtle,
    opacity: 0.5,
  },
  navButtonText: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    textAlign: 'center',
  },
  navButtonTextDisabled: {
    color: colors.text.muted,
  },
  
  // Voice Button
  voiceGlow: {
    padding: 4,
  },
  voiceGlowActive: {
    backgroundColor: colors.primaryAlpha?.glow ?? colors.primary[500] + '30',
    borderRadius: 26,
    padding: 4,
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceButtonActive: {
    backgroundColor: colors.surface.secondary,
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
    backgroundColor: colors.border.subtle,
  },
  dotActive: {
    backgroundColor: colors.accent.primary,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotCompleted: {
    backgroundColor: colors.accent.primary,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});