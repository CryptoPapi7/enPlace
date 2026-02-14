import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

// Get API key from environment or config
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || 'your-api-key-here';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';

interface AIRecipe {
  title: string;
  description: string;
  emoji: string;
  cuisine: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  totalTime: string;
  servings: string;
  ingredients: string[];
  instructions: string[];
  tags: string[];
}

export default function CreateRecipeScreen() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Call GPT API to generate custom recipe
  const generateRecipe = async (): Promise<AIRecipe | null> => {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful chef assistant. Generate a complete recipe based on the user\'s request. Return ONLY a valid JSON object with these exact fields: title (string), description (string), emoji (single emoji character), cuisine (string), difficulty (Easy/Medium/Hard), totalTime (string like "25 minutes"), servings (string like "4 servings"), ingredients (array of strings), instructions (array of strings), tags (array of strings). Make the recipe detailed, accurate, and specifically tailored to what the user asked for.'
            },
            {
              role: 'user',
              content: `Create a recipe for: ${prompt}`
            }
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Parse the JSON response
      const recipeData = JSON.parse(content);
      
      return {
        title: recipeData.title,
        description: recipeData.description,
        emoji: recipeData.emoji,
        cuisine: recipeData.cuisine,
        difficulty: recipeData.difficulty,
        totalTime: recipeData.totalTime,
        servings: recipeData.servings,
        ingredients: recipeData.ingredients,
        instructions: recipeData.instructions,
        tags: recipeData.tags,
      };
    } catch (error) {
      console.error('GPT API Error:', error);
      // Fallback to generic error
      Alert.alert(
        'AI Generation Failed',
        'Please make sure OpenAI API key is configured. Using demo mode for now.',
        [{ text: 'OK' }]
      );
      return null;
    }
  };

  const validatePrompt = (): boolean => {
    if (!prompt.trim()) {
      setError('Please describe what you want to cook');
      return false;
    }
    
    if (prompt.length < 5) {
      setError('Please provide more details (at least 5 characters)');
      return false;
    }
    
    if (prompt.length > 200) {
      setError('Please keep your description under 200 characters');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleGenerate = async () => {
    if (!validatePrompt()) return;
    
    setLoading(true);
    
    try {
      const recipe = await generateRecipe();
      
      if (recipe) {
        navigation.navigate('RecipePreview', {
          recipe: recipe,
          source: 'ai',
          isNew: true,
        });
      } else {
        Alert.alert(
          'Generation failed',
          'Could not generate a recipe. Try a different description.',
          [{ text: 'OK' }]
        );
      }
    } catch (err) {
      Alert.alert(
        'Something went wrong',
        'Please try again in a moment.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    '🍝 Creamy pasta with garlic',
    '🍛 Spicy chicken curry',
    '🥗 Healthy quinoa salad',
    '🥘 Mediterranean one-pot dinner',
    '🍲 Comforting soup',
    '🌮 Easy tacos',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Create Recipe</Text>
            <View style={styles.placeholder} />
          </View>

          {/* AI Badge */}
          <View style={styles.aiBadge}>
            <Text style={styles.aiBadgeText}>✨ Powered by AI</Text>
          </View>

          {/* Prompt Input */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>What do you want to cook?</Text>
            <TextInput
              style={styles.input}
              placeholder="Describe your dish..."
              value={prompt}
              onChangeText={(text) => {
                setPrompt(text);
                if (error) setError('');
              }}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={200}
            />
            <Text style={styles.charCount}>{prompt.length}/200</Text>
            
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}
          </View>

          {/* Suggestions */}
          <View style={styles.suggestionsSection}>
            <Text style={styles.suggestionsTitle}>💡 Try asking for:</Text>
            <View style={styles.suggestionsGrid}>
              {suggestions.map((suggestion, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.suggestionChip}
                  onPress={() => setPrompt(suggestion.replace(/^[^\s]+\s/, ''))}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Tips */}
          <View style={styles.tipsSection}>
            <Text style={styles.tipsTitle}>📝 Tips for better results:</Text>
            <Text style={styles.tip}>• Mention dietary preferences (vegetarian, gluten-free, etc.)</Text>
            <Text style={styles.tip}>• Include cuisine type (Italian, Asian, Mexican...)</Text>
            <Text style={styles.tip}>• Specify cooking time (quick, 30 min, slow-cook...)</Text>
            <Text style={styles.tip}>• Describe flavors (spicy, sweet, savory, fresh...)</Text>
          </View>

          {/* Generate Button */}
          <TouchableOpacity 
            style={[styles.generateBtn, loading && styles.generateBtnDisabled]}
            onPress={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <>
                <ActivityIndicator color="#FFF" style={styles.loader} />
                <Text style={styles.generateBtnText}>Creating your recipe...</Text>
              </>
            ) : (
              <Text style={styles.generateBtnText}>✨ Generate Recipe</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E7',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
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
  backButtonText: {
    fontSize: 20,
    color: '#5D4E37',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#5D4E37',
  },
  placeholder: {
    width: 44,
  },
  aiBadge: {
    alignSelf: 'center',
    backgroundColor: '#87CEEB',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 24,
  },
  aiBadgeText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5D4E37',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#5D4E37',
    borderWidth: 2,
    borderColor: '#E8E8E8',
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#FF6B6B',
    marginTop: 8,
  },
  suggestionsSection: {
    marginBottom: 24,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B7355',
    marginBottom: 12,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  suggestionText: {
    fontSize: 13,
    color: '#5D4E37',
  },
  tipsSection: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5D4E37',
    marginBottom: 12,
  },
  tip: {
    fontSize: 14,
    color: '#8B7355',
    marginBottom: 8,
  },
  generateBtn: {
    backgroundColor: '#FF8C42',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  generateBtnDisabled: {
    opacity: 0.7,
  },
  generateBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  loader: {
    marginRight: 10,
  },
});
