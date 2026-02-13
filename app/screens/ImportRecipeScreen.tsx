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

export default function ImportRecipeScreen({ navigation }: any) {
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
      const recipeData = parseRecipeFromHtml(html, url);
      
      if (recipeData) {
        navigation.navigate('RecipePreview', { 
          recipe: recipeData,
          source: 'import',
          isNew: true 
        });
      } else {
        Alert.alert(
          'Could not parse recipe',
          'We couldn\'t automatically extract the recipe. Try a different URL or use the photo import.',
          [{ text: 'OK' }]
        );
      }
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
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Import Recipe</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Method Toggle */}
        <View style={styles.methodToggle}>
          <TouchableOpacity 
            style={[styles.methodBtn, method === 'url' && styles.methodBtnActive]}
            onPress={() => setMethod('url')}
          >
            <Text style={[styles.methodText, method === 'url' && styles.methodTextActive]}>
              🔗 From Website
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.methodBtn, method === 'photo' && styles.methodBtnActive]}
            onPress={() => setMethod('photo')}
          >
            <Text style={[styles.methodText, method === 'photo' && styles.methodTextActive]}>
              📷 From Photo
            </Text>
          </TouchableOpacity>
        </View>

        {method === 'url' ? (
          <>
            {/* URL Input */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>Recipe URL</Text>
              <TextInput
                style={styles.input}
                placeholder="Paste recipe link here..."
                value={url}
                onChangeText={setUrl}
                autoCapitalize="none"
                keyboardType="url"
              />
              <Text style={styles.hint}>
                Works with most recipe websites (AllRecipes, Food Network, etc.)
              </Text>
            </View>

            {/* Import Button */}
            <TouchableOpacity 
              style={[styles.importBtn, loading && styles.importBtnDisabled]}
              onPress={handleImportFromUrl}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.importBtnText}>📥 Import Recipe</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Photo Options */}
            <View style={styles.photoSection}>
              <Text style={styles.label}>Choose a method</Text>
              
              <TouchableOpacity 
                style={styles.photoOption}
                onPress={handleTakePhoto}
              >
                <Text style={styles.photoEmoji}>📸</Text>
                <View>
                  <Text style={styles.photoTitle}>Take Photo</Text>
                  <Text style={styles.photoSub}>Snap a photo of a recipe</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.photoOption}
                onPress={handlePickImage}
              >
                <Text style={styles.photoEmoji}>🖼️</Text>
                <View>
                  <Text style={styles.photoTitle}>Choose from Library</Text>
                  <Text style={styles.photoSub}>Select a saved recipe photo</Text>
                </View>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Tips</Text>
          <Text style={styles.tip}>• Make sure photos are well-lit and clear</Text>
          <Text style={styles.tip}>• Website import works best with popular recipe sites</Text>
          <Text style={styles.tip}>• You can edit the imported recipe before saving</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E7',
  },
  scrollView: {
    flex: 1,
    padding: 20,
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
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  methodText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8B7355',
  },
  methodTextActive: {
    color: '#FF8C42',
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5D4E37',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#5D4E37',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  hint: {
    fontSize: 13,
    color: '#999',
    marginTop: 8,
  },
  quickGrid2x2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  importBtn: {
    backgroundColor: '#FF8C42',
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
    color: '#FFF',
  },
  photoSection: {
    marginBottom: 24,
  },
  photoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
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
    color: '#5D4E37',
  },
  photoSub: {
    fontSize: 14,
    color: '#8B7355',
  },
  tipsSection: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
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
});
