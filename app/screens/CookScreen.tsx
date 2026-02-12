import { View, Button, StyleSheet, SafeAreaView, Text, TouchableOpacity, ScrollView, Platform } from "react-native";
import { Audio } from 'expo-av';
import { useState, useRef, useEffect } from "react";
import LottieView from 'lottie-react-native';
import { recipe, Step } from "../data/recipe";
import { StatusBar } from 'expo-status-bar';
import { setActiveCooking, updateCurrentStep, clearActiveCooking } from '../utils/activeCooking';

// Lazy import speech recognition to avoid crash if not available
let SpeechRecognition: any = null;
try {
  SpeechRecognition = require('expo-speech-recognition');
} catch (e) {
  console.warn('Speech recognition not available');
}

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

// Voice commands we recognize
const VOICE_COMMANDS = {
  NEXT: ['next', 'forward', 'continue', 'go on', 'next step'],
  BACK: ['back', 'previous', 'go back', 'last step', 'before'],
  REPEAT: ['repeat', 'again', 'say again', 'read again', 'what'],
} as const;

export default function CookScreen({ navigation, route }: any) {
  // Get servings from route params (passed from RecipeScreen)
  const servings = route?.params?.servings || recipe.servings;
  const ratio = route?.params?.ratio || 1;
  const resumeStep = route?.params?.resumeStep || 0;
  
  const [stepIndex, setStepIndex] = useState(resumeStep);
  const [isStirring, setIsStirring] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const animationRef = useRef<LottieView>(null);
  const step = allSteps[stepIndex];

  const shouldShowStirring = STIRRING_STEPS.includes(step.id);

  // Request speech recognition permissions on mount
  useEffect(() => {
    (async () => {
      if (!SpeechRecognition) return;
      try {
        const { status } = await SpeechRecognition.requestPermissionsAsync();
        console.log('Speech recognition permission:', status);
      } catch (e) {
        console.warn('Speech permission error:', e);
      }
    })();
  }, []);

  // Save active cooking state when starting or progressing
  useEffect(() => {
    // Only save as "active" if user has made progress (step > 0)
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

  // Update current step when it changes
  useEffect(() => {
    updateCurrentStep(stepIndex);
    // Clear active cooking when done (last step)
    if (stepIndex === allSteps.length - 1) {
      clearActiveCooking();
    }
  }, [stepIndex]);

  const toggleStirring = () => {
    if (isStirring) {
      animationRef.current?.pause();
    } else {
      animationRef.current?.play();
    }
    setIsStirring(!isStirring);
  };

  const goNext = () => {
    if (stepIndex < allSteps.length - 1) {
      setStepIndex(stepIndex + 1);
    }
  };

  const goBack = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  };

  const readStep = async () => {
    const text = [step.title, ...step.instructions].join('. ');

    const TTS_URL = process.env.EXPO_PUBLIC_TTS_URL;
    const ENPLACE_SECRET = process.env.EXPO_PUBLIC_ENPLACE_SECRET;

    if (!TTS_URL || !ENPLACE_SECRET) {
      console.error('TTS env vars missing');
      return;
    }

    try {
      const response = await fetch(TTS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-enplace-secret': ENPLACE_SECRET,
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const err = await response.text();
        console.error('TTS failed', err);
        return;
      }

      const audioData = await response.arrayBuffer();
      const base64 = arrayBufferToBase64(audioData);
      const sound = new Audio.Sound();
      await sound.loadAsync({ uri: `data:audio/mp3;base64,${base64}` });
      await sound.playAsync();
    } catch (e) {
      console.error('TTS error', e);
    }
  };

  // Process voice command
  const processCommand = (transcript: string) => {
    const lower = transcript.toLowerCase().trim();
    console.log('Voice command:', lower);

    // Check for NEXT commands
    if (VOICE_COMMANDS.NEXT.some(cmd => lower.includes(cmd))) {
      setLastCommand('Next step');
      goNext();
      return;
    }

    // Check for BACK commands
    if (VOICE_COMMANDS.BACK.some(cmd => lower.includes(cmd))) {
      setLastCommand('Previous step');
      goBack();
      return;
    }

    // Check for REPEAT commands
    if (VOICE_COMMANDS.REPEAT.some(cmd => lower.includes(cmd))) {
      setLastCommand('Repeat');
      readStep();
      return;
    }

    setLastCommand(`Unknown: "${lower}"`);
  };

  // Start voice recognition (hold to speak)
  const startListening = async () => {
    if (!SpeechRecognition) {
      setLastCommand('Voice not available');
      return;
    }
    try {
      setIsListening(true);
      setLastCommand(null);

      await SpeechRecognition.startAsync({
        lang: 'en-US',
        interimResults: false,
        maxAlternatives: 1,
      });

      // Listen for results
      const subscription = SpeechRecognition.addListener('result', (event: any) => {
        const transcript = event.results?.[0]?.transcript || '';
        if (transcript) {
          processCommand(transcript);
        }
        setIsListening(false);
        subscription.remove();
      });

      // Handle errors
      const errorSub = SpeechRecognition.addListener('error', (error: any) => {
        console.error('Speech recognition error:', error);
        setIsListening(false);
        errorSub.remove();
      });

    } catch (err) {
      console.error('Failed to start listening:', err);
      setIsListening(false);
    }
  };

  // Stop voice recognition
  const stopListening = async () => {
    if (!SpeechRecognition) return;
    try {
      await SpeechRecognition.stopAsync();
      setIsListening(false);
    } catch (err) {
      console.error('Failed to stop listening:', err);
    }
  };

  // Helper to convert ArrayBuffer to base64 (Buffer doesn't exist in React Native)
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
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

      {/* Voice feedback display */}
      {lastCommand && (
        <View style={styles.commandFeedback}>
          <Text style={styles.commandText}>🎙️ {lastCommand}</Text>
        </View>
      )}

      {/* Voice controls */}
      <View style={styles.voiceSection}>
        {/* Hold to speak button */}
        <TouchableOpacity 
          style={[styles.micButton, !SpeechRecognition && styles.micButtonDisabled, isListening && styles.micButtonActive]}
          onPressIn={startListening}
          onPressOut={stopListening}
          activeOpacity={SpeechRecognition ? 0.7 : 1}
          disabled={!SpeechRecognition}
        >
          <Text style={styles.micButtonText}>
            {!SpeechRecognition ? '🚫 Voice Unavailable' : isListening ? '🎤 Listening...' : '🎙️ Hold to speak'}
          </Text>
          <Text style={styles.micHint}>
            {!SpeechRecognition ? 'Needs app rebuild' : 'Say: "next", "back", or "repeat"'}
          </Text>
        </TouchableOpacity>

        {/* Play voice button */}
        <TouchableOpacity style={styles.playButton} onPress={readStep}>
          <Text style={styles.playButtonText}>🔊 Play Voice</Text>
        </TouchableOpacity>
      </View>

      {/* Controls - fixed at bottom */}
      <View style={styles.controls}>
        <View style={styles.buttonGroup}>
          <Button title="🏠 Home" onPress={() => navigation.navigate("Home")} />
          <View style={{ width: 8 }} />
          <Button
            title="← Back"
            disabled={stepIndex === 0}
            onPress={goBack}
          />
        </View>
        <Button
          title={stepIndex === allSteps.length - 1 ? "Done" : "Next →"}
          onPress={goNext}
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
  commandFeedback: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  commandText: {
    color: '#1B5E20',
    fontSize: 14,
    fontWeight: '500',
  },
  voiceSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  micButton: {
    backgroundColor: '#FF4444',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  micButtonActive: {
    backgroundColor: '#00C853',
  },
  micButtonDisabled: {
    backgroundColor: '#999999',
  },
  micButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  micHint: {
    color: '#FFF',
    fontSize: 12,
    marginTop: 4,
    opacity: 0.9,
  },
  playButton: {
    backgroundColor: '#87CEEB',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  playButtonText: {
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
