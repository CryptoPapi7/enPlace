import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, TextInput } from "react-native";
import { spacing, shadows, typography } from '../theme';
import { useState, useCallback, useEffect } from "react";
import { useFocusEffect, router, useLocalSearchParams } from 'expo-router';
import { chickenCurryRecipe, beefRendangRecipe, freshPastaRecipe, sourdoughRecipe, pepperpotRecipe, doublesRecipe, fishCurryRecipe, dhalPuriRecipe, pastaPomodoroRecipe, rotiCurryChannaRecipe, phoBoRecipe, jerkChickenRecipe, valentineDinnerRecipe } from "../data/recipes";
import { StatusBar } from 'expo-status-bar';
import { scaleAmount, scaleServings, scaleTime } from "../utils/scaling";
import { convertIngredient, DEFAULT_PREFERENCES, UNIT_PRESETS, UnitPreference } from "../utils/units";
import { isFavorite, toggleFavorite, FavoriteRecipe } from "../utils/favorites";
import { getUnitSystem, UnitSystem, loadSettings } from "../utils/settings";
import { isInLibrary, toggleLibrary, initLibrary } from "../utils/library";
import { useTheme } from '@/providers/ThemeProvider';

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
  'valentine-dinner': valentineDinnerRecipe,
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
  // Valentine's Dinner
  'pasta-dough': { emoji: '🍝', title: 'Pasta Dough' },
  'prep-mise': { emoji: '📋', title: 'Mise en Place' },
  'pasta-roll-cut': { emoji: '🍜', title: 'Roll & Cut' },
  'fish-sauce': { emoji: '🐟', title: 'Cod Piccata' },
  'pasta-cook': { emoji: '🔥', title: 'Cook Pasta' },
  'broccolini': { emoji: '🥬', title: 'Broccolini' },
  'serve': { emoji: '🍽️', title: 'Plate & Serve' },
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

export default function RecipeScreen() {
  const { colors, isMichelin } = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const recipeId = id || 'chicken-curry';
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
  const [unitPreset, setUnitPreset] = useState<UnitSystem>('metric');
  const [myNotes, setMyNotes] = useState<Record<string, string>>({});
  const [isFav, setIsFav] = useState(false);
  const [inLibrary, setInLibrary] = useState(false);
  const [buttonsCollapsed, setButtonsCollapsed] = useState(false);

  // Load settings once on mount
  useEffect(() => {
    loadSettings().then(settings => {
      console.log('Loaded settings:', settings);
      setUnitPreset(settings.unitSystem);
      setServings(settings.defaultServings);
    });
  }, []);

  // Check favorite and library status when focused
  useFocusEffect(
    useCallback(() => {
      isFavorite(recipeId).then(setIsFav);
      initLibrary().then(() => {
        isInLibrary(recipeId).then(setInLibrary);
      });
    }, [recipeId])
  );

  const handleToggleFavorite = async () => {
    const success = await toggleFavorite({
      id: recipeId,
      title: recipe.title,
      emoji: recipe.emoji,
      cuisine: recipe.cuisine,
      time: recipe.totalTimeMinutes >= 60 ? `${Math.round(recipe.totalTimeMinutes / 60)}h` : `${recipe.totalTimeMinutes}m`,
    });
    if (success) {
      setIsFav(!isFav);
    }
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
    router.push(`/cooking?recipeId=${recipeId}&servings=${servings}`);
  };

  const dynamicStyles = getStyles(colors, spacing, shadows, isMichelin);

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <StatusBar style={isMichelin ? 'light' : 'dark'} />
      <ScrollView style={dynamicStyles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header with Favorite and Library */}
        <View style={dynamicStyles.header}>
          <TouchableOpacity 
            style={dynamicStyles.backButton}
            onPress={() => router.back()}
          >
            <Text style={dynamicStyles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={dynamicStyles.headerActions}>
            <TouchableOpacity 
              style={dynamicStyles.libraryButton}
              onPress={handleToggleLibrary}
            >
              <Text style={dynamicStyles.libraryEmoji}>{inLibrary ? '📚' : '📑'}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={dynamicStyles.favoriteButton}
              onPress={handleToggleFavorite}
            >
              <Text style={dynamicStyles.favoriteEmoji}>{isFav ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Section */}
        <View style={dynamicStyles.hero}>
          <Text style={dynamicStyles.heroEmoji}>{recipe.emoji}</Text>
          <Text style={dynamicStyles.heroTitle}>{recipe.title}</Text>
          <Text style={dynamicStyles.heroSubtitle}>{recipe.description}</Text>
        </View>

        {/* Quick Stats */}
        <View style={dynamicStyles.stats}>
          <View style={dynamicStyles.statItem}>
            <Text style={dynamicStyles.statValue}>{Math.round(recipe.totalTimeMinutes * ratio) >= 60 ? `${Math.round((recipe.totalTimeMinutes * ratio) / 60)}h` : `${Math.round(recipe.totalTimeMinutes * ratio)}m`}</Text>
            <Text style={dynamicStyles.statLabel}>Total</Text>
          </View>
          <View style={dynamicStyles.statDivider} />
          <View style={dynamicStyles.statItem}>
            <Text style={dynamicStyles.statValue}>{Math.round(activeTime * ratio) >= 60 ? `${Math.round((activeTime * ratio) / 60)}h` : `${Math.round(activeTime * ratio)}m`}</Text>
            <Text style={dynamicStyles.statLabel}>Active</Text>
          </View>
          <View style={dynamicStyles.statDivider} />
          <View style={dynamicStyles.statItem}>
            <Text style={dynamicStyles.statValue}>{totalSteps}</Text>
            <Text style={dynamicStyles.statLabel}>Steps</Text>
          </View>
          <View style={dynamicStyles.statDivider} />
          <View style={dynamicStyles.statItem}>
            <Text style={dynamicStyles.statValue}>{totalIngredients}</Text>
            <Text style={dynamicStyles.statLabel}>Items</Text>
          </View>
        </View>

        {/* Serving & Units Controls */}
        <View style={dynamicStyles.controlsSection}>
          {/* Servings */}
          <View style={dynamicStyles.servingControl}>
            <Text style={dynamicStyles.controlLabel}>👥 Servings</Text>
            <View style={dynamicStyles.servingStepper}>
              <TouchableOpacity
                style={dynamicStyles.stepperButton}
                onPress={() => setServings(Math.max(1, servings - 1))}
              >
                <Text style={dynamicStyles.stepperButtonText}>−</Text>
              </TouchableOpacity>
              <Text style={dynamicStyles.servingValue}>{servings}</Text>
              <TouchableOpacity
                style={dynamicStyles.stepperButton}
                onPress={() => setServings(Math.min(20, servings + 1))}
              >
                <Text style={dynamicStyles.stepperButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={dynamicStyles.servingRange}>1–20 people</Text>
          </View>

          {/* Unit Presets */}
          <View style={dynamicStyles.unitControl}>
            <Text style={dynamicStyles.controlLabel}>⚖️ Units</Text>
            <View style={dynamicStyles.unitButtons}>
              {(['metric', 'imperial', 'baker'] as const).map(preset => (
                <TouchableOpacity
                  key={preset}
                  style={[
                    dynamicStyles.unitButton,
                    unitPreset === preset && dynamicStyles.unitButtonActive,
                  ]}
                  onPress={() => setUnitPreset(preset)}
                >
                  <Text style={[
                    dynamicStyles.unitButtonText,
                    unitPreset === preset && dynamicStyles.unitButtonTextActive,
                  ]}>{preset.charAt(0).toUpperCase() + preset.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Ingredients Section */}
        <View style={dynamicStyles.section}>
          <TouchableOpacity 
            style={dynamicStyles.sectionHeader}
            onPress={() => setShowIngredients(!showIngredients)}
          >
            <Text style={dynamicStyles.sectionTitle}>📝 Ingredients</Text>
            <Text style={dynamicStyles.sectionToggle}>{showIngredients ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          
          {showIngredients && (
            <View style={dynamicStyles.ingredientsList}>
              {sectionKeys.map(sectionKey => {
                const info = getSectionInfo(sectionKey, recipe);
                if (info.ingredients.length === 0) return null;
                
                return (
                  <View key={sectionKey} style={dynamicStyles.ingredientGroup}>
                    <Text style={dynamicStyles.ingredientGroupTitle}>{info.emoji} For the {info.title}</Text>
                    {info.ingredients.map((ing: any, idx: number) => {
                      const scaled = scaleAmount(ing.amount, ratio);
                      const converted = convertIngredient(scaled, ing.item, unitPrefs);
                      console.log(`${ing.item}: ${ing.amount} -> scaled: ${scaled} -> converted: ${converted}`);
                      return (
                        <View key={idx} style={dynamicStyles.ingredientRow}>
                          <Text style={dynamicStyles.ingredientAmount}>
                            {converted}
                          </Text>
                          <Text style={dynamicStyles.ingredientItem}>{ing.item}</Text>
                        </View>
                      );
                    })}
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* What's Involved - Dynamic Sections */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>What's involved</Text>
          
          {sectionKeys.map(sectionKey => {
            const info = getSectionInfo(sectionKey, recipe);
            const isExpanded = showSteps === sectionKey;
            
            return (
              <TouchableOpacity 
                key={sectionKey}
                style={dynamicStyles.phaseCard}
                onPress={() => setShowSteps(isExpanded ? null : sectionKey)}
              >
                <View style={dynamicStyles.phaseHeader}>
                  <Text style={dynamicStyles.phaseEmoji}>{info.emoji}</Text>
                  <View style={dynamicStyles.phaseInfo}>
                    <Text style={dynamicStyles.phaseTitle}>{info.title}</Text>
                    <Text style={dynamicStyles.phaseMeta}>{info.steps.length} steps • {info.ingredients.length} ingredients</Text>
                  </View>
                  <Text style={dynamicStyles.phaseToggle}>{isExpanded ? '▲' : '▼'}</Text>
                </View>
                
                {/* Step Preview */}
                {isExpanded && (
                  <View style={dynamicStyles.stepPreview}>
                    {info.steps.map((step: any, idx: number) => (
                      <View key={step.id} style={dynamicStyles.stepPreviewItem}>
                        <View style={dynamicStyles.stepPreviewNumber}>
                          <Text style={dynamicStyles.stepPreviewNumberText}>{idx + 1}</Text>
                        </View>
                        <View style={dynamicStyles.stepPreviewContent}>
                          <Text style={dynamicStyles.stepPreviewTitle}>{step.title}</Text>
                          <View style={dynamicStyles.stepPreviewMeta}>
                            {step.durationMinutes > 0 && (
                              <Text style={dynamicStyles.stepPreviewTime}>⏱️ {Math.round(step.durationMinutes * ratio)} min</Text>
                            )}
                            {step.active ? (
                              <Text style={dynamicStyles.stepPreviewActive}>👨‍🍳 Active</Text>
                            ) : (
                              <Text style={dynamicStyles.stepPreviewPassive}>😴 Hands-off</Text>
                            )}
                          </View>
                          <Text style={dynamicStyles.stepPreviewInstructions} numberOfLines={2}>
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
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Chef's notes</Text>
            <View style={dynamicStyles.notesCard}>
              {recipe.chefNotes.slice(0, 3).map((note: string, idx: number) => (
                <View key={idx} style={dynamicStyles.noteItem}>
                  <Text style={dynamicStyles.noteBullet}>💡</Text>
                  <Text style={dynamicStyles.noteText}>{note}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* My Notes */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>📝 My Notes</Text>
          <View style={dynamicStyles.myNotesCard}>
            <TextInput
              style={dynamicStyles.myNotesInput}
              multiline
              placeholder="Add your personal notes here..."
              placeholderTextColor="#999"
              value={myNotes[recipeId] || ''}
              onChangeText={(text) => setMyNotes(prev => ({ ...prev, [recipeId]: text }))}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Bottom padding for floating buttons */}
        <View style={{ height: 180 }} />
      </ScrollView>

      {/* Floating Action Area (collapsible) */}
      <View style={[dynamicStyles.floatingButtonContainer, buttonsCollapsed && dynamicStyles.floatingCollapsed]}>
        <TouchableOpacity
          style={dynamicStyles.collapseHandle}
          onPress={() => setButtonsCollapsed(v => !v)}
          activeOpacity={0.7}
        >
          <Text style={dynamicStyles.collapseHandleText}>
            {buttonsCollapsed ? '▲ Show actions' : '▼ Hide actions'}
          </Text>
        </TouchableOpacity>

        {!buttonsCollapsed && (
          <>
            <TouchableOpacity style={dynamicStyles.startButton} onPress={handleStartCooking}>
              <Text style={dynamicStyles.startButtonText}>Start Cooking</Text>
              <Text style={dynamicStyles.startButtonSub}>{servings} people • ~{Math.round(activeTime * ratio)} min active</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={dynamicStyles.addToPlanButton}
              onPress={() => router.push(`/plan?addRecipe=${recipeId}&servings=${servings}`)}
              activeOpacity={0.85}
            >
              <Text style={dynamicStyles.addToPlanText}>Add to Weekly Plan</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: any, spacing: any, shadows: any, isMichelin: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isMichelin ? colors.background?.primary : colors.cream[50],
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  backButtonText: {
    fontSize: 20,
    color: colors.neutral[700],
  },
  favoriteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  favoriteEmoji: {
    fontSize: 24,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  libraryButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  libraryEmoji: {
    fontSize: 22,
  },
  hero: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  heroEmoji: {
    fontSize: 100,
    lineHeight: 120,
    marginBottom: spacing.md,
  },
  heroTitle: {
    fontSize: typography.display.fontSize,
    fontWeight: typography.display.fontWeight,
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: spacing.sm,
    lineHeight: typography.display.lineHeight,
  },
  heroSubtitle: {
    fontSize: 16,
    color: colors.primary[500],
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
    color: colors.neutral[900],
  },
  statLabel: {
    fontSize: 12,
    color: colors.primary[500],
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.neutral[300],
    marginHorizontal: 20,
  },
  controlsSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 16,
  },
  servingControl: {
    backgroundColor: isMichelin ? colors.background?.secondary : '#FFF',
    borderRadius: 16,
    padding: 16,
  },
  controlLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[900],
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
    backgroundColor: colors.primary[500],
  },
  servingButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[700],
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
    backgroundColor: colors.primary[500],
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
    color: colors.neutral[900],
    minWidth: 50,
    textAlign: 'center',
  },
  servingRange: {
    fontSize: 12,
    color: colors.primary[500],
    textAlign: 'center',
    marginTop: 8,
  },
  unitControl: {
    backgroundColor: isMichelin ? colors.background?.secondary : '#FFF',
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
    color: colors.neutral[700],
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
    color: colors.neutral[900],
  },
  sectionToggle: {
    fontSize: 16,
    color: colors.primary[500],
  },
  ingredientsList: {
    backgroundColor: isMichelin ? colors.background?.secondary : '#FFF',
    borderRadius: 16,
    padding: 16,
  },
  ingredientGroup: {
    marginBottom: 16,
  },
  ingredientGroupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  ingredientAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary[500],
    width: 80,
  },
  ingredientItem: {
    fontSize: 15,
    color: colors.neutral[900],
    flex: 1,
  },
  phaseCard: {
    backgroundColor: isMichelin ? colors.background?.secondary : '#FFF',
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
    color: colors.neutral[900],
  },
  phaseMeta: {
    fontSize: 13,
    color: colors.primary[500],
    marginTop: 2,
  },
  phaseToggle: {
    fontSize: 16,
    color: colors.primary[500],
  },
  stepPreview: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
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
    color: colors.neutral[900],
    marginBottom: 4,
  },
  stepPreviewMeta: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  stepPreviewTime: {
    fontSize: 12,
    color: colors.primary[500],
  },
  stepPreviewActive: {
    fontSize: 12,
    color: colors.primary[500],
  },
  stepPreviewPassive: {
    fontSize: 12,
    color: colors.neutral[500],
  },
  stepPreviewInstructions: {
    fontSize: 13,
    color: colors.neutral[700],
    lineHeight: 18,
  },
  notesCard: {
    backgroundColor: isMichelin ? colors.background?.secondary : '#FFF',
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
    color: colors.neutral[900],
    flex: 1,
    lineHeight: 20,
  },
  myNotesCard: {
    backgroundColor: isMichelin ? colors.background?.secondary : '#FFF',
    borderRadius: 16,
    padding: 16,
    minHeight: 120,
  },
  myNotesInput: {
    fontSize: 15,
    color: colors.neutral[900],
    lineHeight: 22,
    minHeight: 100,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: isMichelin ? colors.background?.primary : colors.cream[50],
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: isMichelin ? colors.neutral[700] : colors.neutral[300],
  },
  floatingCollapsed: {
    paddingVertical: 8,
  },
  collapseHandle: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  collapseHandleText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.neutral[700],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  startButton: {
    backgroundColor: colors.primary[500],
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
  addToPlanButton: {
    backgroundColor: isMichelin ? colors.background?.secondary : colors.white,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 2,
    borderColor: colors.primary[500],
    minHeight: 56,
  },
  addToPlanText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary[500],
  },
});

