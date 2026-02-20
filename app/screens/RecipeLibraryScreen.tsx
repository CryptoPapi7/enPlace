import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert, RefreshControl, Image } from "react-native";
import { useState, useCallback, useEffect } from "react";
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, router, useLocalSearchParams } from 'expo-router';
import { ALL_RECIPES } from '../data/recipes';
import { isFavorite, toggleFavorite, getFavorites, initFavorites } from '../utils/favorites';
import { getAllRecipes, deleteRecipe } from '../database/db';
import { migrateFromAsyncStorage } from '../database/migrate';
import type { Recipe } from '../schemas/recipe';
import { spacing, layout, typography, shadows } from '../theme';
import { useTheme } from '@/providers/ThemeProvider';

// Filter categories
const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'comfort', label: 'Comfort' },
  { id: 'quick', label: 'Quick' },
  { id: 'showoff', label: 'Show Off' },
  { id: 'mindful', label: 'Mindful' },
];

export default function RecipeLibraryScreen() {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [migrationStatus, setMigrationStatus] = useState<string>('');
  const { selectingForPlan } = useLocalSearchParams<{ selectingForPlan?: string }>();
  const isSelectingForPlan = selectingForPlan === 'true';

  // Run migration once on mount
  useEffect(() => {
    const runMigration = async () => {
      const result = await migrateFromAsyncStorage();
      if (result.migrated > 0) {
        setMigrationStatus(`Migrated ${result.migrated} recipes`);
      }
    };
    runMigration();
  }, []);

  // Load my recipes from SQLite
  const loadMyRecipes = async () => {
    try {
      setIsLoading(true);
      const recipes = await getAllRecipes();
      setMyRecipes(recipes);
    } catch (error) {
      console.error('Failed to load recipes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh when screen is focused
  useFocusEffect(
    useCallback(() => {
      initFavorites().then(() => {
        getFavorites().then(favs => {
          setFavorites(favs.map(f => f.id));
        });
      });
      loadMyRecipes();
    }, [])
  );

  const handleDeleteRecipe = async (recipe: Recipe) => {
    Alert.alert(
      'Delete Recipe?',
      `Are you sure you want to delete "${recipe.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (recipe.id) {
              await deleteRecipe(recipe.id);
              await loadMyRecipes();
            }
          }
        }
      ]
    );
  };

  // Filter recipes
  let filtered = ALL_RECIPES;
  
  if (activeFilter !== 'all') {
    filtered = filtered.filter(r => r.vibe === activeFilter);
  }
  
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(r => 
      r.title.toLowerCase().includes(query) ||
      r.cuisine.toLowerCase().includes(query) ||
      r.emoji.includes(query)
    );
  }

  const handleRecipePress = (recipe: typeof ALL_RECIPES[0]) => {
    if (!recipe.available) {
      alert(`${recipe.title} - Coming in v0.2!`);
      return;
    }
    
    // Navigate to recipe detail screen
    router.push(`/recipe/${recipe.id}`);
  };

  const handleToggleFavorite = async (recipe: typeof ALL_RECIPES[0]) => {
    const isNowFav = await toggleFavorite({
      id: recipe.id,
      title: recipe.title,
      emoji: recipe.emoji,
      cuisine: recipe.cuisine,
      time: recipe.timeDisplay || recipe.time.toString(),
    });
    setFavorites(prev => 
      isNowFav ? [...prev, recipe.id] : prev.filter(id => id !== recipe.id)
    );
  };

  const dynamicStyles = createStyles(colors);

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.title}>Recipe Library</Text>
      </View>

      {/* Search */}
      <View style={dynamicStyles.searchContainer}>
        <TextInput
          style={dynamicStyles.searchInput}
          placeholder="Search recipes, cuisines..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.text.muted}
        />
        {searchQuery && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={dynamicStyles.clearButton}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Pills */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={dynamicStyles.filterScroll}
        contentContainerStyle={dynamicStyles.filterContent}
      >
        {FILTERS.map(filter => (
          <TouchableOpacity
            key={filter.id}
            style={[
              dynamicStyles.filterPill,
              activeFilter === filter.id && dynamicStyles.filterPillActive,
            ]}
            onPress={() => setActiveFilter(filter.id)}
          >
            <Text style={[
              dynamicStyles.filterText,
              activeFilter === filter.id && dynamicStyles.filterTextActive,
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={dynamicStyles.scrollView}
        contentContainerStyle={dynamicStyles.grid}
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
        contentInset={{ top: 0 }}
        alwaysBounceVertical={false}
      >
        {/* Migration Status */}
        {migrationStatus ? (
          <View style={dynamicStyles.migrationBanner}>
            <Text style={dynamicStyles.migrationText}>{migrationStatus}</Text>
          </View>
        ) : null}

        {/* Built-in Recipes */}
        {filtered.map(recipe => (
          <View
            key={recipe.id}
            style={[dynamicStyles.recipeCard, !recipe.available && dynamicStyles.recipeCardDisabled]}
          >
            {/* Favorite Heart */}
            <TouchableOpacity 
              style={dynamicStyles.heartButton}
              onPress={() => handleToggleFavorite(recipe)}
            >
              <Text style={dynamicStyles.heartEmoji}>
                {favorites.includes(recipe.id) ? '❤️' : '🤍'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => handleRecipePress(recipe)}>
              {recipe.imageUrl ? (
                <View style={dynamicStyles.recipeImageContainer}>
                  <Image source={{ uri: recipe.imageUrl }} style={dynamicStyles.recipeImage} />
                  <View style={dynamicStyles.recipeOverlay}>
                    <Text style={dynamicStyles.recipeImageTitle} numberOfLines={2}>{recipe.title}</Text>
                    <Text style={dynamicStyles.recipeOverlayCuisine}>{recipe.cuisine}</Text>
                  </View>
                </View>
              ) : (
                <View style={dynamicStyles.recipeEmojiContainer}>
                  <Text style={dynamicStyles.recipeEmoji}>{recipe.emoji}</Text>
                  <Text style={dynamicStyles.recipeTitle} numberOfLines={2}>{recipe.title}</Text>
                  <Text style={dynamicStyles.recipeCuisine}>{recipe.cuisine}</Text>
                </View>
              )}
            </TouchableOpacity>
            <View style={dynamicStyles.recipeMeta}>
              <Text style={dynamicStyles.recipeTime}>⏱️ {recipe.timeDisplay || recipe.time}</Text>
              <Text style={dynamicStyles.recipeDifficulty}>{recipe.difficulty}</Text>
            </View>
            
            {/* Action Buttons */}
            {recipe.available && (
              <View style={dynamicStyles.cardActions}>
                <TouchableOpacity 
                  style={dynamicStyles.addToPlanButton}
                  onPress={() => router.push(`/plan?addRecipe=${recipe.id}`)}
                >
                  <Text style={dynamicStyles.addToPlanText} numberOfLines={1}>Add to plan</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {!recipe.available && (
              <View style={dynamicStyles.comingSoonBadge}>
                <Text style={dynamicStyles.comingSoonText}>Soon</Text>
              </View>
            )}
          </View>
        ))}
        
        {filtered.length === 0 && (
          <View style={dynamicStyles.emptyState}>
            <Text style={dynamicStyles.emptyText}>No recipes found</Text>
            <Text style={dynamicStyles.emptySub}>Try a different search</Text>
          </View>
        )}
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    fontSize: 24,
    color: colors.text.secondary,
    padding: 8,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface?.secondary ?? colors.background?.secondary ?? colors.white,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: colors.border.subtle,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
  },
  clearButton: {
    fontSize: 16,
    color: colors.text.muted,
    padding: 4,
  },
  filterScroll: {
    maxHeight: 44,
    marginBottom: 16,
  },
  filterContent: {
    paddingHorizontal: layout.screenGutter,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.surface?.secondary ?? colors.background?.secondary ?? colors.white,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border.default,
    justifyContent: 'center',
  },
  filterPillActive: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  filterText: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlignVertical: 'center',
  },
  filterTextActive: {
    color: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: layout.screenGutter,
    gap: 12,
  },
  sectionHeaderFullWidth: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  sectionCount: {
    fontSize: 14,
    color: colors.accent.primary,
    marginLeft: 8,
    fontWeight: '600',
  },
  migrationBanner: {
    width: '100%',
    backgroundColor: colors.accent.success,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  migrationText: {
    ...typography.bodyMedium,
    color: colors.text.inverse,
    textAlign: 'center',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    padding: 4,
  },
  deleteEmoji: {
    fontSize: 20,
  },
  recipeCard: {
    width: '47%',
    backgroundColor: colors.surface?.secondary ?? colors.background?.secondary ?? colors.white,
    borderRadius: 18,
    padding: 18,
    shadowColor: colors.border.subtle,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  recipeCardDisabled: {
    opacity: 0.7,
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    padding: 4,
  },
  heartEmoji: {
    fontSize: 20,
  },
  recipeEmoji: {
    fontSize: 48,
    marginBottom: 8,
    textAlign: 'center',
  },
  recipeImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    marginBottom: 8,
  },
  recipeTitle: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  recipeCuisine: {
    ...typography.caption,
    color: colors.accent.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  recipeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recipeTime: {
    ...typography.caption,
    color: colors.text.muted,
  },
  recipeDifficulty: {
    ...typography.caption,
    color: colors.accent.primary,
  },
  comingSoonBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.text.muted,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  comingSoonText: {
    ...typography.label,
    color: '#FFF',
  },
  cardActions: {
    marginTop: 8,
  },
  addToPlanButton: {
    backgroundColor: colors.surface.secondary,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accent.primary,
  },
  addToPlanText: {
    ...typography.caption,
    color: colors.accent.primary,
  },
  emptyState: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    ...typography.h3,
    color: colors.text.primary,
  },
  emptySub: {
    fontSize: 14,
    color: colors.accent.primary,
  },
});
