import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, TextInput } from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect } from '@react-navigation/native';
import { chickenCurryRecipe, beefRendangRecipe, freshPastaRecipe, sourdoughRecipe, pepperpotRecipe, doublesRecipe, fishCurryRecipe, dhalPuriRecipe, pastaPomodoroRecipe, rotiCurryChannaRecipe, phoBoRecipe, jerkChickenRecipe } from "../data/recipes";
import { StatusBar } from 'expo-status-bar';
import { scaleAmount, scaleServings, scaleTime } from "../utils/scaling";
import { convertIngredient, DEFAULT_PREFERENCES, UNIT_PRESETS, UnitPreference } from "../utils/units";
import { isFavorite, toggleFavorite, getFavorites, FavoriteRecipe, initFavorites, isFavoriteSync } from "../utils/favorites";
import { isInLibrary, toggleLibrary, initLibrary } from "../utils/library";

// Recipe lookup
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

// Section metadata (emoji, display name)
const SECTION_META: Record<string, { emoji: string; title: string }> = {
  'curry': { emoji: '🥘', title: 'Chicken Curry' },
  'roti': { emoji: '🫓', title: 'Paratha Roti' },
  'marinade': { emoji: '🧄', title: 'Spice Paste & Marinade' },
  'cooking': { emoji: '🔥', title: 'Slow Cooking' },
  'pasta': { emoji: '🍝', title: 'Fresh Pasta' },
  'sauce': { emoji: '🍅', title: 'Pomodoro Sauce' },
  'starter': { emoji: '🫧', title: 'Starter & Autolyse' },
  'bulk': { emoji: '💪', title: 'Bulk Fermentation' },
  'shape': { emoji: '🌀', title: 'Shaping' },
  'bake': { emoji: '🔥', title: 'Proofing & Baking' },
};

// Get section display info
const getSectionInfo = (sectionKey: string, recipe: any) => {
  const meta = SECTION_META[sectionKey];
  return {
    emoji: meta?.emoji || '👨‍🍳',
    title: meta?.title || sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1),
    steps: recipe.sections[sectionKey] || [],
    ingredients: recipe.ingredients[sectionKey] || [],
  };
};

export default function RecipeScreen({ navigation, route }: any) {
  const recipeId = route.params?.recipeId || 'chicken-curry';
  const recipe = RECIPE_MAP[recipeId] || chickenCurryRecipe;
  
  // Get all section keys from the recipe
  const sectionKeys = Object.keys(recipe.sections);
  
  // Calculate times
  const calculateTimes = () => {
    let activeTime = 0;
    let passiveTime = 0;
    
    Object.values(recipe.sections).flat().forEach((step: any) => {
      if (step.active) {
        activeTime += step.durationMinutes;
      } else {
        passiveTime += step.durationMinutes;
      }
    });
    
    return { activeTime, passiveTime };
  };
  
  const { activeTime } = calculateTimes();
  const [servings, setServings] = useState(recipe.servings);
  const [showIngredients, setShowIngredients] = useState(false);
  const [showSteps, setShowSteps] = useState<string | null>(null);
  const [showShoppingModal, setShowShoppingModal] = useState(false);
  const [unitPreset, setUnitPreset] = useState<'metric' | 'imperial' | 'baker'>('metric');
  const [myNotes, setMyNotes] = useState<Record<string, string>>({});
  const [isFav, setIsFav] = useState(false);
  const [inLibrary, setInLibrary] = useState(false);

  // Check favorite and library status on mount and when focused
  useFocusEffect(
    useCallback(() => {
      initFavorites().then(() => {
        setIsFav(isFavoriteSync(recipeId));
      });
      initLibrary().then(() => {
        isInLibrary(recipeId).then(setInLibrary);
      });
    }, [recipeId])
  );

  const handleToggleFavorite = async () => {
    const newState = await toggleFavorite({
      id: recipeId,
      title: recipe.title,
      emoji: recipe.emoji,
      cuisine: recipe.cuisine,
      time: recipe.totalTimeMinutes >= 60 ? `${Math.round(recipe.totalTimeMinutes / 60)}h` : `${recipe.totalTimeMinutes}m`,
    });
    setIsFav(newState);
  };

  const handleToggleLibrary = async () => {
    const newState = await toggleLibrary({
      id: recipeId,
      title: recipe.title,
      emoji: recipe.emoji,
      cuisine: recipe.cuisine,
      time: recipe.totalTimeMinutes >= 60 ? `${Math.round(recipe.totalTimeMinutes / 60)}h` : `${recipe.totalTimeMinutes}m`,
    });
    setInLibrary(newState);
  };

  const ratio = servings / recipe.servings;
  const unitPrefs = unitPreset === 'baker' 
    ? { ...DEFAULT_PREFERENCES, defaultUnit: 'g' as const, preferWeight: true }
    : UNIT_PRESETS[unitPreset];

  // Calculate total steps and ingredients
  const totalSteps = Object.values(recipe.sections).reduce((acc, section) => acc + (section as any[]).length, 0);
  const totalIngredients = Object.values(recipe.ingredients).reduce((acc, section) => acc + (section as any[]).length, 0);

  const handleStartCooking = () => {
    navigation.navigate('Cook', { recipeId, servings, fromLauncher: true });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header with Favorite */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.libraryButton}
            onPress={handleToggleLibrary}
          >
            <Text style={styles.libraryEmoji}>{inLibrary ? '📚' : '📑'}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={handleToggleFavorite}
          >
            <Text style={styles.favoriteEmoji}>{isFav ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>{recipe.emoji}</Text>
          <Text style={styles.heroTitle}>{recipe.title}</Text>
          <Text style={styles.heroSubtitle}>{recipe.description}</Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{Math.round(recipe.totalTimeMinutes * ratio) >= 60 ? `${Math.round((recipe.totalTimeMinutes * ratio) / 60)}h` : `${Math.round(recipe.totalTimeMinutes * ratio)}m`}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{Math.round(activeTime * ratio) >= 60 ? `${Math.round((activeTime * ratio) / 60)}h` : `${Math.round(activeTime * ratio)}m`}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalSteps}</Text>
            <Text style={styles.statLabel}>Steps</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalIngredients}</Text>
            <Text style={styles.statLabel}>Items</Text>
          </View>
        </View>

        {/* Serving & Units Controls */}
        <View style={styles.controlsSection}>
          {/* Servings */}
          <View style={styles.servingControl}>
            <Text style={styles.controlLabel}>👥 Servings</Text>
            <View style={styles.servingStepper}>
              <TouchableOpacity
                style={styles.stepperButton}
                onPress={() => setServings(Math.max(1, servings - 1))}
              >
                <Text style={styles.stepperButtonText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.servingValue}>{servings}</Text>
              <TouchableOpacity
                style={styles.stepperButton}
                onPress={() => setServings(Math.min(20, servings + 1))}
              >
                <Text style={styles.stepperButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.servingRange}>1–20 people</Text>
          </View>

          {/* Unit Presets */}
          <View style={styles.unitControl}>
            <Text style={styles.controlLabel}>⚖️ Units</Text>
            <View style={styles.unitButtons}>
              {(['metric', 'imperial', 'baker'] as const).map(preset => (
                <TouchableOpacity
                  key={preset}
                  style={[
                    styles.unitButton,
                    unitPreset === preset && styles.unitButtonActive,
                  ]}
                  onPress={() => setUnitPreset(preset)}
                >
                  <Text style={[
                    styles.unitButtonText,
                    unitPreset === preset && styles.unitButtonTextActive,
                  ]}>{preset.charAt(0).toUpperCase() + preset.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Ingredients Section */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => setShowIngredients(!showIngredients)}
          >
            <Text style={styles.sectionTitle}>📝 Ingredients</Text>
            <Text style={styles.sectionToggle}>{showIngredients ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          
          {showIngredients && (
            <View style={styles.ingredientsList}>
              {sectionKeys.map(sectionKey => {
                const info = getSectionInfo(sectionKey, recipe);
                if (info.ingredients.length === 0) return null;
                
                return (
                  <View key={sectionKey} style={styles.ingredientGroup}>
                    <Text style={styles.ingredientGroupTitle}>{info.emoji} For the {info.title}</Text>
                    {info.ingredients.map((ing: any, idx: number) => (
                      <View key={idx} style={styles.ingredientRow}>
                        <Text style={styles.ingredientAmount}>
                          {convertIngredient(scaleAmount(ing.amount, ratio), ing.item, unitPrefs)}
                        </Text>
                        <Text style={styles.ingredientItem}>{ing.item}</Text>
                      </View>
                    ))}
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* What's Involved - Dynamic Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's involved</Text>
          
          {sectionKeys.map(sectionKey => {
            const info = getSectionInfo(sectionKey, recipe);
            const isExpanded = showSteps === sectionKey;
            
            return (
              <TouchableOpacity 
                key={sectionKey}
                style={styles.phaseCard}
                onPress={() => setShowSteps(isExpanded ? null : sectionKey)}
              >
                <View style={styles.phaseHeader}>
                  <Text style={styles.phaseEmoji}>{info.emoji}</Text>
                  <View style={styles.phaseInfo}>
                    <Text style={styles.phaseTitle}>{info.title}</Text>
                    <Text style={styles.phaseMeta}>{info.steps.length} steps • {info.ingredients.length} ingredients</Text>
                  </View>
                  <Text style={styles.phaseToggle}>{isExpanded ? '▲' : '▼'}</Text>
                </View>
                
                {/* Step Preview */}
                {isExpanded && (
                  <View style={styles.stepPreview}>
                    {info.steps.map((step: any, idx: number) => (
                      <View key={step.id} style={styles.stepPreviewItem}>
                        <View style={styles.stepPreviewNumber}>
                          <Text style={styles.stepPreviewNumberText}>{idx + 1}</Text>
                        </View>
                        <View style={styles.stepPreviewContent}>
                          <Text style={styles.stepPreviewTitle}>{step.title}</Text>
                          <View style={styles.stepPreviewMeta}>
                            {step.durationMinutes > 0 && (
                              <Text style={styles.stepPreviewTime}>⏱️ {Math.round(step.durationMinutes * ratio)} min</Text>
                            )}
                            {step.active ? (
                              <Text style={styles.stepPreviewActive}>👨‍🍳 Active</Text>
                            ) : (
                              <Text style={styles.stepPreviewPassive}>😴 Hands-off</Text>
                            )}
                          </View>
                          <Text style={styles.stepPreviewInstructions} numberOfLines={2}>
                            {step.instructions[0]}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Chef's Notes */}
        {recipe.chefNotes && recipe.chefNotes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chef's notes</Text>
            <View style={styles.notesCard}>
              {recipe.chefNotes.slice(0, 3).map((note: string, idx: number) => (
                <View key={idx} style={styles.noteItem}>
                  <Text style={styles.noteBullet}>💡</Text>
                  <Text style={styles.noteText}>{note}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* My Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 My Notes</Text>
          <View style={styles.myNotesCard}>
            <TextInput
              style={styles.myNotesInput}
              multiline
              placeholder="Add your personal notes here..."
              placeholderTextColor="#999"
              value={myNotes[recipeId] || ''}
              onChangeText={(text) => setMyNotes(prev => ({ ...prev, [recipeId]: text }))}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Bottom padding */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Start Button */}
      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity style={styles.startButton} onPress={handleStartCooking}>
          <Text style={styles.startButtonText}>Start Cooking</Text>
          <Text style={styles.startButtonSub}>{servings} people • ~{Math.round(activeTime * ratio)} min active</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.addToPlanButton}
          onPress={() => navigation.navigate('PlanWeek', { addRecipe: { id: recipeId, title: recipe.title, emoji: recipe.emoji } })}
        >
          <Text style={styles.addToPlanText}>+ Add to Weekly Plan</Text>
        </TouchableOpacity>
      </View>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
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
  favoriteButton: {
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
  favoriteEmoji: {
    fontSize: 24,
  },
  libraryButton: {
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
    marginRight: 8,
  },
  libraryEmoji: {
    fontSize: 22,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 24,
  },
  heroEmoji: {
    fontSize: 100,
    lineHeight: 120,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#5D4E37',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#87CEEB',
    textAlign: 'center',
    lineHeight: 22,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 60,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5D4E37',
  },
  statLabel: {
    fontSize: 12,
    color: '#87CEEB',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 20,
  },
  controlsSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 16,
  },
  servingControl: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
  },
  controlLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5D4E37',
    marginBottom: 12,
  },
  servingButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  servingButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  servingButtonActive: {
    backgroundColor: '#FF8C42',
  },
  servingButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  servingStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  stepperButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF8C42',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  servingValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#5D4E37',
    minWidth: 50,
    textAlign: 'center',
  },
  servingRange: {
    fontSize: 12,
    color: '#87CEEB',
    textAlign: 'center',
    marginTop: 8,
  },
  unitControl: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
  },
  unitButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  unitButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  unitButtonActive: {
    backgroundColor: '#87CEEB',
  },
  unitButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  unitButtonTextActive: {
    color: '#FFF',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#5D4E37',
  },
  sectionToggle: {
    fontSize: 16,
    color: '#87CEEB',
  },
  ingredientsList: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
  },
  ingredientGroup: {
    marginBottom: 16,
  },
  ingredientGroupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5D4E37',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  ingredientAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF8C42',
    width: 80,
  },
  ingredientItem: {
    fontSize: 15,
    color: '#5D4E37',
    flex: 1,
  },
  phaseCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phaseEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  phaseInfo: {
    flex: 1,
  },
  phaseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5D4E37',
  },
  phaseMeta: {
    fontSize: 13,
    color: '#87CEEB',
    marginTop: 2,
  },
  phaseToggle: {
    fontSize: 16,
    color: '#87CEEB',
  },
  stepPreview: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  stepPreviewItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepPreviewNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#87CEEB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepPreviewNumberText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepPreviewContent: {
    flex: 1,
  },
  stepPreviewTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5D4E37',
    marginBottom: 4,
  },
  stepPreviewMeta: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  stepPreviewTime: {
    fontSize: 12,
    color: '#87CEEB',
  },
  stepPreviewActive: {
    fontSize: 12,
    color: '#FF8C42',
  },
  stepPreviewPassive: {
    fontSize: 12,
    color: '#999',
  },
  stepPreviewInstructions: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  notesCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
  },
  noteItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  noteBullet: {
    fontSize: 14,
    marginRight: 8,
  },
  noteText: {
    fontSize: 14,
    color: '#5D4E37',
    flex: 1,
    lineHeight: 20,
  },
  myNotesCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    minHeight: 120,
  },
  myNotesInput: {
    fontSize: 15,
    color: '#5D4E37',
    lineHeight: 22,
    minHeight: 100,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF8E7',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  startButton: {
    backgroundColor: '#FF8C42',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  startButtonSub: {
    fontSize: 13,
    color: '#FFF',
    opacity: 0.9,
    marginTop: 4,
  },
});
