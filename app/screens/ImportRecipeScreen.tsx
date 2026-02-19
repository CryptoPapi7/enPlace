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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { parseImportedRecipe } from '../schemas/recipe';
import { useTheme } from '@/providers/ThemeProvider';
import { layout } from '../theme/spacing';

export default function ImportRecipeScreen() {
  const { colors, isMichelin } = useTheme();
  const dynamicStyles = createStyles(colors, isMichelin);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<'url' | 'photo'>('url');

  const handleImportFromUrl = async () => {
    if (!url.trim()) {
      Alert.alert('Error', 'Please enter a recipe URL');
      return;
    }

    setLoading(true);
    try {
      // Fetch and parse the webpage
      const response = await fetch(url);
      const html = await response.text();
      
      // Extract recipe data (basic parsing - can be improved)
      const rawRecipeData = parseRecipeFromHtml(html, url);
      
      if (!rawRecipeData) {
        Alert.alert(
          'Could not parse recipe',
          'We couldn\'t automatically extract the recipe. Try a different URL or use the photo import.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Validate with Zod before passing to preview
      const validation = parseImportedRecipe(rawRecipeData);
      
      if (!validation.success) {
        Alert.alert(
          'Recipe validation failed',
          `Extracted recipe had issues:\n${validation.errors.join('\n')}`,
          [{ text: 'OK' }]
        );
        return;
      }
      
      navigation.navigate('RecipePreview', { 
        recipe: validation.data,
        source: 'import',
        isNew: true 
      });
    } catch (error) {
      Alert.alert(
        'Import failed',
        'Could not fetch the recipe. Check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      navigation.navigate('PhotoRecipe', { 
        imageUri: result.assets[0].uri 
      });
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      navigation.navigate('PhotoRecipe', { 
        imageUri: result.assets[0].uri 
      });
    }
  };

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <StatusBar style={isMichelin ? 'light' : 'dark'} />
      <ScrollView style={dynamicStyles.scrollView}>
        {/* Header */}
        <View style={dynamicStyles.header}>
          <TouchableOpacity 
            style={dynamicStyles.backButton}
            onPress={() => router.back()}
          >
            <Text style={dynamicStyles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={dynamicStyles.title}>Import Recipe</Text>
          <View style={dynamicStyles.placeholder} />
        </View>

        {/* Method Toggle */}
        <View style={dynamicStyles.methodToggle}>
          <TouchableOpacity 
            style={[dynamicStyles.methodBtn, method === 'url' && dynamicStyles.methodBtnActive]}
            onPress={() => setMethod('url')}
          >
            <Text style={[dynamicStyles.methodText, method === 'url' && dynamicStyles.methodTextActive]}>
              🔗 From Website
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[dynamicStyles.methodBtn, method === 'photo' && dynamicStyles.methodBtnActive]}
            onPress={() => setMethod('photo')}
          >
            <Text style={[dynamicStyles.methodText, method === 'photo' && dynamicStyles.methodTextActive]}>
              📷 From Photo
            </Text>
          </TouchableOpacity>
        </View>

        {method === 'url' ? (
          <>
            {/* URL Input */}
            <View style={dynamicStyles.inputSection}>
              <Text style={dynamicStyles.label}>Recipe URL</Text>
              <TextInput
                style={dynamicStyles.input}
                placeholder="Paste recipe link here..."
                value={url}
                onChangeText={setUrl}
                autoCapitalize="none"
                keyboardType="url"
              />
              <Text style={dynamicStyles.hint}>
                Works with most recipe websites (AllRecipes, Food Network, etc.)
              </Text>
            </View>

            {/* Import Button */}
            <TouchableOpacity 
              style={[dynamicStyles.importBtn, loading && dynamicStyles.importBtnDisabled]}
              onPress={handleImportFromUrl}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={dynamicStyles.importBtnText}>📥 Import Recipe</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Photo Options */}
            <View style={dynamicStyles.photoSection}>
              <Text style={dynamicStyles.label}>Choose a method</Text>
              
              <TouchableOpacity 
                style={dynamicStyles.photoOption}
                onPress={handleTakePhoto}
              >
                <Text style={dynamicStyles.photoEmoji}>📸</Text>
                <View>
                  <Text style={dynamicStyles.photoTitle}>Take Photo</Text>
                  <Text style={dynamicStyles.photoSub}>Snap a photo of a recipe</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={dynamicStyles.photoOption}
                onPress={handlePickImage}
              >
                <Text style={dynamicStyles.photoEmoji}>🖼️</Text>
                <View>
                  <Text style={dynamicStyles.photoTitle}>Choose from Library</Text>
                  <Text style={dynamicStyles.photoSub}>Select a saved recipe photo</Text>
                </View>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Tips */}
        <View style={dynamicStyles.tipsSection}>
          <Text style={dynamicStyles.tipsTitle}>💡 Tips</Text>
          <Text style={dynamicStyles.tip}>• Make sure photos are well-lit and clear</Text>
          <Text style={dynamicStyles.tip}>• Website import works best with popular recipe sites</Text>
          <Text style={dynamicStyles.tip}>• You can edit the imported recipe before saving</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Basic HTML parser for recipes
function parseRecipeFromHtml(html: string, url: string): any {
  // Try to find JSON-LD recipe data (most common)
  const jsonLdMatch = html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/g);
  
  if (jsonLdMatch) {
    for (const script of jsonLdMatch) {
      try {
        const jsonStr = script.replace(/<script type="application\/ld\+json">/, '').replace(/<\/script>/, '');
        const data = JSON.parse(jsonStr);
        
        // Check if it's a recipe
        if (data['@type'] === 'Recipe' || (Array.isArray(data['@graph']) && data['@graph'].some((g: any) => g['@type'] === 'Recipe'))) {
          const recipe = data['@type'] === 'Recipe' ? data : data['@graph'].find((g: any) => g['@type'] === 'Recipe');
          
          return {
            title: recipe.name || 'Untitled Recipe',
            description: recipe.description || '',
            ingredients: Array.isArray(recipe.recipeIngredient) ? recipe.recipeIngredient : [recipe.recipeIngredient],
            instructions: Array.isArray(recipe.recipeInstructions) 
              ? recipe.recipeInstructions.map((s: any) => s.text || s)
              : [recipe.recipeInstructions],
            totalTime: recipe.totalTime || '30 minutes',
            servings: recipe.recipeYield || '4 servings',
            image: recipe.image?.url || recipe.image,
            source: url,
          };
        }
      } catch (e) {
        // Continue to next script
      }
    }
  }
  
  // Fallback: try regex parsing for basic sites
  const title = html.match(/<h1[^>]*>([^<]+)<\/h1>/)?.[1]?.trim();
  const ingredients = html.match(/ingredient[^>]*>([^<]+)</gi)?.map(m => m.replace(/<[^>]+>/g, ''));
  
  if (title && ingredients?.length > 0) {
    return {
      title,
      description: '',
      ingredients: ingredients.slice(0, 10),
      instructions: [],
      totalTime: '30 minutes',
      servings: '4 servings',
      source: url,
    };
  }
  
  return null;
}

const createStyles = (colors: any, isMichelin: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isMichelin ? colors.background?.primary : colors.cream[50],
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: layout.screenGutter,
    paddingVertical: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: isMichelin ? colors.background?.secondary : '#FFF',
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
    color: isMichelin ? colors.neutral[300] : colors.neutral[700],
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: isMichelin ? colors.neutral[300] : colors.neutral[700],
  },
  placeholder: {
    width: 44,
  },
  methodToggle: {
    flexDirection: 'row',
    backgroundColor: '#E8E8E8',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  methodBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  methodBtnActive: {
    backgroundColor: isMichelin ? colors.background?.secondary : '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  methodText: {
    fontSize: 15,
    fontWeight: '600',
    color: isMichelin ? colors.neutral[400] : colors.neutral[600],
  },
  methodTextActive: {
    color: colors.primary[500],
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: isMichelin ? colors.neutral[300] : colors.neutral[700],
    marginBottom: 8,
  },
  input: {
    backgroundColor: isMichelin ? colors.background?.secondary : '#FFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: isMichelin ? colors.neutral[300] : colors.neutral[700],
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  hint: {
    fontSize: 13,
    color: isMichelin ? colors.neutral[500] : colors.neutral[500],
    marginTop: 8,
  },
  quickGrid2x2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  importBtn: {
    backgroundColor: colors.primary[500],
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  importBtnDisabled: {
    opacity: 0.6,
  },
  importBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: isMichelin ? colors.background?.secondary : '#FFF',
  },
  photoSection: {
    marginBottom: 24,
  },
  photoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isMichelin ? colors.background?.secondary : '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  photoEmoji: {
    fontSize: 40,
    marginRight: 16,
  },
  photoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: isMichelin ? colors.neutral[300] : colors.neutral[700],
  },
  photoSub: {
    fontSize: 14,
    color: isMichelin ? colors.neutral[400] : colors.neutral[600],
  },
  tipsSection: {
    backgroundColor: isMichelin ? colors.background?.secondary : '#FFF',
    borderRadius: 16,
    padding: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: isMichelin ? colors.neutral[300] : colors.neutral[700],
    marginBottom: 12,
  },
  tip: {
    fontSize: 14,
    color: isMichelin ? colors.neutral[400] : colors.neutral[600],
    marginBottom: 8,
  },
});
