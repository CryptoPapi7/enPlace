import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { saveRecipe } from '../database/db';
import { Alert } from 'react-native';

export default function RecipePreviewScreen({ route, navigation }: any) {
  const { recipe, source, isNew } = route.params;
  const [editRecipe, setEditRecipe] = useState({
    ...recipe,
    emoji: recipe.emoji || '🍽️',
    cuisine: recipe.cuisine || 'Other',
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async () => {
    try {
      // Save to SQLite database
      const savedRecipe = await saveRecipe({
        title: editRecipe.title,
        description: editRecipe.description,
        emoji: editRecipe.emoji,
        cuisine: editRecipe.cuisine,
        difficulty: editRecipe.difficulty || 'Medium',
        prepTime: editRecipe.prepTime || '',
        cookTime: editRecipe.cookTime || '',
        totalTime: editRecipe.totalTime,
        servings: editRecipe.servings,
        ingredients: editRecipe.ingredients,
        instructions: editRecipe.instructions,
        tags: editRecipe.tags || [],
        image: editRecipe.image,
        source: source === 'import' ? editRecipe.source : undefined,
      });

      Alert.alert(
        'Recipe Saved',
        `${savedRecipe.title} has been saved to your collection!`,
        [{ 
          text: 'View Recipe', 
          onPress: () => navigation.navigate('RecipeHome', { recipeId: savedRecipe.id })
        }]
      );
    } catch (error) {
      console.error('Error saving recipe:', error);
      Alert.alert(
        'Save Failed',
        'Could not save the recipe. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const updateField = (field: string, value: any) => {
    setEditRecipe(prev => ({ ...prev, [field]: value }));
  };

  const cuisineOptions = ['Italian', 'Asian', 'Mexican', 'American', 'Mediterranean', 'Indian', 'French', 'Other'];
  const emojiOptions = ['🍽️', '🍕', '🍜', '🥗', '🍔', '🌮', '🍛', '🥘', '🍝', '🥪', '🥞', '🍰', '🥧', '🍪'];

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
          <Text style={styles.title}>Review Recipe</Text>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Text style={styles.editButtonText}>
              {isEditing ? 'Done' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Source Badge */}
        <View style={styles.sourceBadge}>
          <Text style={styles.sourceText}>
            {source === 'import' ? '🔗 Imported from web' : 
             source === 'photo' ? '📷 From photo' : 
             source === 'ai' ? '✨ AI Generated' : 'Custom Recipe'}
          </Text>
        </View>

        {isEditing ? (
          // Edit Mode
          <View style={styles.editSection}>
            <Text style={styles.label}>Recipe Name</Text>
            <TextInput
              style={styles.input}
              value={editRecipe.title}
              onChangeText={(text) => updateField('title', text)}
            />

            <Text style={styles.label}>Select Emoji</Text>
            <View style={styles.emojiRow}>
              {emojiOptions.map(emoji => (
                <TouchableOpacity
                  key={emoji}
                  style={[styles.emojiBtn, editRecipe.emoji === emoji && styles.emojiBtnActive]}
                  onPress={() => updateField('emoji', emoji)}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Cuisine</Text>
            <View style={styles.chipRow}>
              {cuisineOptions.map(cuisine => (
                <TouchableOpacity
                  key={cuisine}
                  style={[styles.chip, editRecipe.cuisine === cuisine && styles.chipActive]}
                  onPress={() => updateField('cuisine', cuisine)}
                >
                  <Text style={[styles.chipText, editRecipe.cuisine === cuisine && styles.chipTextActive]}>
                    {cuisine}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              multiline
              value={editRecipe.description}
              onChangeText={(text) => updateField('description', text)}
            />

            <Text style={styles.label}>Cooking Time</Text>
            <TextInput
              style={styles.input}
              value={editRecipe.totalTime}
              onChangeText={(text) => updateField('totalTime', text)}
              placeholder="e.g., 30 minutes"
            />

            <Text style={styles.label}>Servings</Text>
            <TextInput
              style={styles.input}
              value={editRecipe.servings}
              onChangeText={(text) => updateField('servings', text)}
              placeholder="e.g., 4 servings"
            />
          </View>
        ) : (
          // Preview Mode
          <View style={styles.previewSection}>
            <View style={styles.titleRow}>
              <Text style={styles.recipeEmoji}>{editRecipe.emoji}</Text>
              <Text style={styles.recipeTitle}>{editRecipe.title}</Text>
            </View>

            <Text style={styles.recipeCuisine}>{editRecipe.cuisine}</Text>

            {editRecipe.description && (
              <Text style={styles.description}>{editRecipe.description}</Text>
            )}

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Text style={styles.metaIcon}>⏱️</Text>
                <Text style={styles.metaLabel}>{editRecipe.totalTime}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaIcon}>👥</Text>
                <Text style={styles.metaLabel}>{editRecipe.servings}</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>📝 Ingredients</Text>
            {editRecipe.ingredients?.map((ing: string, i: number) => (
              <Text key={i} style={styles.listItem}>• {ing}</Text>
            ))}

            <Text style={styles.sectionTitle}>👨‍🍳 Instructions</Text>
            {editRecipe.instructions?.map((step: string, i: number) => (
              <View key={i} style={styles.stepRow}>
                <Text style={styles.stepNumber}>{i + 1}</Text>
                <Text style={styles.step}>{step}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.cancelBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.saveBtn}
            onPress={handleSave}
          >
            <Text style={styles.saveBtnText}>💾 Save to My Library</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#87CEEB',
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  sourceBadge: {
    backgroundColor: '#E8E8E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sourceText: {
    fontSize: 13,
    color: '#8B7355',
    fontWeight: '500',
  },
  previewSection: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recipeEmoji: {
    fontSize: 40,
    marginRight: 12,
  },
  recipeTitle: {
    flex: 1,
    fontSize: 26,
    fontWeight: '700',
    color: '#5D4E37',
  },
  recipeCuisine: {
    fontSize: 14,
    color: '#87CEEB',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#8B7355',
    lineHeight: 22,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  metaIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  metaLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5D4E37',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5D4E37',
    marginTop: 20,
    marginBottom: 12,
  },
  listItem: {
    fontSize: 15,
    color: '#5D4E37',
    marginBottom: 6,
    lineHeight: 22,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF8C42',
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 28,
    marginRight: 12,
  },
  step: {
    flex: 1,
    fontSize: 15,
    color: '#5D4E37',
    lineHeight: 22,
  },
  editSection: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5D4E37',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#5D4E37',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  emojiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emojiBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiBtnActive: {
    backgroundColor: '#FF8C42',
  },
  emojiText: {
    fontSize: 28,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  chipActive: {
    backgroundColor: '#87CEEB',
  },
  chipText: {
    fontSize: 14,
    color: '#8B7355',
  },
  chipTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#E8E8E8',
    padding: 16,
    borderRadius: 12,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5D4E37',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#FF8C42',
    padding: 16,
    borderRadius: 12,
    marginLeft: 8,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});
