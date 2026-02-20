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
  const { colors } = useTheme();
  const styles = createStyles(colors);

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
      const response = await fetch(url);
      const html = await response.text();
      const rawRecipeData = parseRecipeFromHtml(html, url);

      if (!rawRecipeData) {
        Alert.alert(
          'Could not parse recipe',
          'We couldn\'t automatically extract the recipe. Try a different URL or use the photo import.',
          [{ text: 'OK' }]
        );
        return;
      }

      const validation = parseImportedRecipe(rawRecipeData);

      if (!validation.success) {
        Alert.alert(
          'Recipe validation failed',
          `Extracted recipe had issues:\n${validation.errors.join('\n')}`,
          [{ text: 'OK' }]
        );
        return;
      }

      router.push({
        pathname: '/recipe-preview',
        params: { recipe: JSON.stringify(validation.data), source: 'import', isNew: 'true' },
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
      router.push({ pathname: '/photo-recipe', params: { imageUri: result.assets[0].uri } });
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 1 });

    if (!result.canceled) {
      router.push({ pathname: '/photo-recipe', params: { imageUri: result.assets[0].uri } });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Import Recipe</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.methodToggle}>
          <TouchableOpacity
            style={[styles.methodBtn, method === 'url' && styles.methodBtnActive]}
            onPress={() => setMethod('url')}
          >
            <Text style={[styles.methodText, method === 'url' && styles.methodTextActive]}>
              From Website
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.methodBtn, method === 'photo' && styles.methodBtnActive]}
            onPress={() => setMethod('photo')}
          >
            <Text style={[styles.methodText, method === 'photo' && styles.methodTextActive]}>
              From Photo
            </Text>
          </TouchableOpacity>
        </View>

        {method === 'url' ? (
          <>
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
              <Text style={styles.hint}>Works with most recipe websites</Text>
            </View>

            <TouchableOpacity
              style={[styles.importBtn, loading && styles.importBtnDisabled]}
              onPress={handleImportFromUrl}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color={colors.text.inverse} /> : <Text style={styles.importBtnText}>Import Recipe</Text>}
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.photoSection}>
            <Text style={styles.label}>Choose a method</Text>
            <TouchableOpacity style={styles.photoOption} onPress={handleTakePhoto}>
              <View>
                <Text style={styles.photoTitle}>Take Photo</Text>
                <Text style={styles.photoSub}>Snap a photo of a recipe</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoOption} onPress={handlePickImage}>
              <View>
                <Text style={styles.photoTitle}>Choose from Library</Text>
                <Text style={styles.photoSub}>Select a saved recipe photo</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>Tips</Text>
          <Text style={styles.tip}>• Make sure photos are well-lit and clear</Text>
          <Text style={styles.tip}>• Website import works best with popular recipe sites</Text>
          <Text style={styles.tip}>• You can edit the imported recipe before saving</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function parseRecipeFromHtml(html: string, url: string): any {
  const jsonLdMatch = html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/g);

  if (jsonLdMatch) {
    for (const script of jsonLdMatch) {
      try {
        const jsonStr = script
          .replace(/<script type="application\/ld\+json">/, '')
          .replace(/<\/script>/, '');
        const data = JSON.parse(jsonStr);

        if (
          data['@type'] === 'Recipe' ||
          (Array.isArray(data['@graph']) && data['@graph'].some((g: any) => g['@type'] === 'Recipe'))
        ) {
          const recipe = data['@type'] === 'Recipe' ? data : data['@graph'].find((g: any) => g['@type'] === 'Recipe');

          return {
            title: recipe.name || 'Untitled Recipe',
            description: recipe.description || '',
            ingredients: Array.isArray(recipe.recipeIngredient)
              ? recipe.recipeIngredient
              : [recipe.recipeIngredient],
            instructions: Array.isArray(recipe.recipeInstructions)
              ? recipe.recipeInstructions.map((s: any) => s.text || s)
              : [recipe.recipeInstructions],
            totalTime: recipe.totalTime || '30 minutes',
            servings: recipe.recipeYield || '4 servings',
            source: url,
          };
        }
      } catch {
        // ignore
      }
    }
  }

  const title = html.match(/<h1[^>]*>([^<]+)<\/h1>/)?.[1]?.trim();
  const ingredients = html.match(/ingredient[^>]*>([^<]+)</gi)?.map(m => m.replace(/<[^>]+>/g, ''));

  if (title && ingredients?.length) {
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

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface.primary,
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
      backgroundColor: colors.surface.secondary,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 2,
    },
    backButtonText: {
      fontSize: 20,
      color: colors.text.secondary,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text.primary,
    },
    placeholder: {
      width: 44,
    },
    methodToggle: {
      flexDirection: 'row',
      backgroundColor: colors.surface.secondary,
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
      backgroundColor: colors.surface.raised,
    },
    methodText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text.secondary,
    },
    methodTextActive: {
      color: colors.accent.primary,
    },
    inputSection: {
      marginBottom: 24,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.secondary,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.surface.secondary,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: colors.text.primary,
      borderWidth: 1,
      borderColor: colors.border.subtle,
    },
    hint: {
      fontSize: 13,
      color: colors.text.muted,
      marginTop: 8,
    },
    importBtn: {
      backgroundColor: colors.accent.primary,
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
      color: colors.text.inverse,
    },
    photoSection: {
      marginBottom: 24,
    },
    photoOption: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface.secondary,
      borderRadius: 16,
      padding: 20,
      marginBottom: 12,
      elevation: 2,
    },
    photoTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.primary,
    },
    photoSub: {
      fontSize: 14,
      color: colors.text.muted,
    },
    tipsSection: {
      backgroundColor: colors.surface.secondary,
      borderRadius: 16,
      padding: 20,
    },
    tipsTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text.primary,
      marginBottom: 12,
    },
    tip: {
      fontSize: 14,
      color: colors.text.muted,
      marginBottom: 8,
    },
  });