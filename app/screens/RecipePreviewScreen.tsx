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
import { useTheme } from '@/providers/ThemeProvider';

export default function RecipePreviewScreen({ route, navigation }: any) {
  const { colors, isMichelin } = useTheme();
  const dynamicStyles = createStyles(colors, isMichelin);
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
    <SafeAreaView style={dynamicStyles.container}>
      <StatusBar style={isMichelin ? 'light' : 'dark'} />
      <ScrollView style={dynamicStyles.scrollView}>
        {/* Header */}
        <View style={dynamicStyles.header}>
          <TouchableOpacity 
            style={dynamicStyles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={dynamicStyles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={dynamicStyles.title}>Review Recipe</Text>
          <TouchableOpacity 
            style={dynamicStyles.editButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Text style={dynamicStyles.editButtonText}>
              {isEditing ? 'Done' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Source Badge */}
        <View style={dynamicStyles.sourceBadge}>
          <Text style={dynamicStyles.sourceText}>
            {source === 'import' ? '🔗 Imported from web' : 
             source === 'photo' ? '📷 From photo' : 
             source === 'ai' ? '✨ AI Generated' : 'Custom Recipe'}
          </Text>
        </View>

        {isEditing ? (
          // Edit Mode
          <View style={dynamicStyles.editSection}>
            <Text style={dynamicStyles.label}>Recipe Name</Text>
            <TextInput
              style={dynamicStyles.input}
              value={editRecipe.title}
              onChangeText={(text) => updateField('title', text)}
            />

            <Text style={dynamicStyles.label}>Select Emoji</Text>
            <View style={dynamicStyles.emojiRow}>
              {emojiOptions.map(emoji => (
                <TouchableOpacity
                  key={emoji}
                  style={[dynamicStyles.emojiBtn, editRecipe.emoji === emoji && dynamicStyles.emojiBtnActive]}
                  onPress={() => updateField('emoji', emoji)}
                >
                  <Text style={dynamicStyles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={dynamicStyles.label}>Cuisine</Text>
            <View style={dynamicStyles.chipRow}>
              {cuisineOptions.map(cuisine => (
                <TouchableOpacity
                  key={cuisine}
                  style={[dynamicStyles.chip, editRecipe.cuisine === cuisine && dynamicStyles.chipActive]}
                  onPress={() => updateField('cuisine', cuisine)}
                >
                  <Text style={[dynamicStyles.chipText, editRecipe.cuisine === cuisine && dynamicStyles.chipTextActive]}>
                    {cuisine}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={dynamicStyles.label}>Description</Text>
            <TextInput
              style={[dynamicStyles.input, dynamicStyles.textArea]}
              multiline
              value={editRecipe.description}
              onChangeText={(text) => updateField('description', text)}
            />

            <Text style={dynamicStyles.label}>Cooking Time</Text>
            <TextInput
              style={dynamicStyles.input}
              value={editRecipe.totalTime}
              onChangeText={(text) => updateField('totalTime', text)}
              placeholder="e.g., 30 minutes"
            />

            <Text style={dynamicStyles.label}>Servings</Text>
            <TextInput
              style={dynamicStyles.input}
              value={editRecipe.servings}
              onChangeText={(text) => updateField('servings', text)}
              placeholder="e.g., 4 servings"
            />
          </View>
        ) : (
          // Preview Mode
          <View style={dynamicStyles.previewSection}>
            <View style={dynamicStyles.titleRow}>
              <Text style={dynamicStyles.recipeEmoji}>{editRecipe.emoji}</Text>
              <Text style={dynamicStyles.recipeTitle}>{editRecipe.title}</Text>
            </View>

            <Text style={dynamicStyles.recipeCuisine}>{editRecipe.cuisine}</Text>

            {editRecipe.description && (
              <Text style={dynamicStyles.description}>{editRecipe.description}</Text>
            )}

            <View style={dynamicStyles.metaRow}>
              <View style={dynamicStyles.metaItem}>
                <Text style={dynamicStyles.metaIcon}>⏱️</Text>
                <Text style={dynamicStyles.metaLabel}>{editRecipe.totalTime}</Text>
              </View>
              <View style={dynamicStyles.metaItem}>
                <Text style={dynamicStyles.metaIcon}>👥</Text>
                <Text style={dynamicStyles.metaLabel}>{editRecipe.servings}</Text>
              </View>
            </View>

            <Text style={dynamicStyles.sectionTitle}>📝 Ingredients</Text>
            {editRecipe.ingredients?.map((ing: string, i: number) => (
              <Text key={i} style={dynamicStyles.listItem}>• {ing}</Text>
            ))}

            <Text style={dynamicStyles.sectionTitle}>👨‍🍳 Instructions</Text>
            {editRecipe.instructions?.map((step: string, i: number) => (
              <View key={i} style={dynamicStyles.stepRow}>
                <Text style={dynamicStyles.stepNumber}>{i + 1}</Text>
                <Text style={dynamicStyles.step}>{step}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Actions */}
        <View style={dynamicStyles.actions}>
          <TouchableOpacity 
            style={dynamicStyles.cancelBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={dynamicStyles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={dynamicStyles.saveBtn}
            onPress={handleSave}
          >
            <Text style={dynamicStyles.saveBtnText}>💾 Save to My Library</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any, isMichelin: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isMichelin ? colors.background?.primary : colors.cream[50],
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
    backgroundColor: isMichelin ? colors.background?.secondary : isMichelin ? colors.background?.secondary : '#FFF',
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
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#87CEEB',
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: isMichelin ? colors.background?.secondary : isMichelin ? colors.background?.secondary : '#FFF',
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
    color: isMichelin ? colors.neutral[400] : colors.neutral[600],
    fontWeight: '500',
  },
  previewSection: {
    backgroundColor: isMichelin ? colors.background?.secondary : isMichelin ? colors.background?.secondary : '#FFF',
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
    color: isMichelin ? colors.neutral[300] : colors.neutral[700],
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
    color: isMichelin ? colors.neutral[400] : colors.neutral[600],
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
    color: isMichelin ? colors.neutral[300] : colors.neutral[700],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: isMichelin ? colors.neutral[300] : colors.neutral[700],
    marginTop: 20,
    marginBottom: 12,
  },
  listItem: {
    fontSize: 15,
    color: isMichelin ? colors.neutral[300] : colors.neutral[700],
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
    backgroundColor: colors.primary[500],
    color: isMichelin ? colors.background?.secondary : isMichelin ? colors.background?.secondary : '#FFF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 28,
    marginRight: 12,
  },
  step: {
    flex: 1,
    fontSize: 15,
    color: isMichelin ? colors.neutral[300] : colors.neutral[700],
    lineHeight: 22,
  },
  editSection: {
    backgroundColor: isMichelin ? colors.background?.secondary : isMichelin ? colors.background?.secondary : '#FFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: isMichelin ? colors.neutral[300] : colors.neutral[700],
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: isMichelin ? colors.neutral[300] : colors.neutral[700],
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
    backgroundColor: colors.primary[500],
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
    color: isMichelin ? colors.neutral[400] : colors.neutral[600],
  },
  chipTextActive: {
    color: isMichelin ? colors.background?.secondary : isMichelin ? colors.background?.secondary : '#FFF',
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
    color: isMichelin ? colors.neutral[300] : colors.neutral[700],
  },
  saveBtn: {
    flex: 1,
    backgroundColor: colors.primary[500],
    padding: 16,
    borderRadius: 12,
    marginLeft: 8,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: isMichelin ? colors.background?.secondary : isMichelin ? colors.background?.secondary : '#FFF',
  },
});
