import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert, RefreshControl } from "react-native";
import { useState, useCallback, useEffect } from "react";
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, router, useLocalSearchParams } from 'expo-router';
import { ALL_RECIPES } from '../data/recipes';
import { isFavorite, toggleFavorite, getFavorites, initFavorites } from '../utils/favorites';
import { getAllRecipes, deleteRecipe } from '../database/db';
import { migrateFromAsyncStorage } from '../database/migrate';
import type { Recipe } from '../schemas/recipe';
import { spacing, typography, shadows } from '../theme';
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
  const { colors, isMichelin } = useTheme();
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

  const dynamicStyles = createStyles(colors, isMichelin);

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <StatusBar style={isMichelin ? 'light' : 'dark'} />
      
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={dynamicStyles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={dynamicStyles.title}>Recipe Library</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search */}
      <View style={dynamicStyles.searchContainer}>
        <Text style={dynamicStyles.searchIcon}>🔍</Text>
        <TextInput
          style={dynamicStyles.searchInput}
          placeholder="Search recipes, cuisines..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.neutral[500]}
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
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadMyRecipes} />}
      >
        {/* Migration Status */}
        {migrationStatus ? (
          <View style={dynamicStyles.migrationBanner}>
            <Text style={dynamicStyles.migrationText}>✅ {migrationStatus}</Text>
          </View>
        ) : null}

        {/* Built-in Recipes */}
        <View style={dynamicStyles.sectionHeaderFullWidth}>
          <Text style={dynamicStyles.sectionTitle}>📚 Recipe Library</Text>
        </View>
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
              <Text style={dynamicStyles.recipeEmoji}>{recipe.emoji}</Text>
              <Text style={dynamicStyles.recipeTitle} numberOfLines={2}>{recipe.title}</Text>
            </TouchableOpacity>
            <Text style={dynamicStyles.recipeCuisine}>{recipe.cuisine}</Text>
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
                  <Text style={dynamicStyles.addToPlanText}>➕ Add to Plan</Text>
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
            <Text style={dynamicStyles.emptyEmoji}>🔍</Text>
            <Text style={dynamicStyles.emptyText}>No recipes found</Text>
            <Text style={dynamicStyles.emptySub}>Try a different search</Text>
          </View>
        )}
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any, isMichelin: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isMichelin ? colors.background?.primary : colors.cream[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    fontSize: 24,
    color: colors.neutral[700],
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.neutral[900],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isMichelin ? colors.background?.secondary : '#FFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.neutral[900],
  },
  clearButton: {
    fontSize: 16,
    color: colors.neutral[500],
    padding: 4,
  },
  filterScroll: {
    maxHeight: 44,
    marginBottom: 16,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: isMichelin ? colors.background?.secondary : '#FFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.neutral[300],
  },
  filterPillActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutral[700],
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
    paddingHorizontal: 20,
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
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  sectionCount: {
    fontSize: 14,
    color: colors.primary[500],
    marginLeft: 8,
    fontWeight: '600',
  },
  migrationBanner: {
    width: '100%',
    backgroundColor: colors.success,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  migrationText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
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
    backgroundColor: isMichelin ? colors.background?.secondary : '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
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
  recipeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: 4,
    textAlign: 'center',
  },
  recipeCuisine: {
    fontSize: 12,
    color: colors.primary[500],
    marginBottom: 8,
    textAlign: 'center',
  },
  recipeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recipeTime: {
    fontSize: 11,
    color: colors.neutral[500],
  },
  recipeDifficulty: {
    fontSize: 11,
    color: colors.primary[500],
    fontWeight: '500',
  },
  comingSoonBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.neutral[500],
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  comingSoonText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: 'bold',
  },
  cardActions: {
    marginTop: 8,
  },
  addToPlanButton: {
    backgroundColor: colors.success,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  addToPlanText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  emptySub: {
    fontSize: 14,
    color: colors.primary[500],
  },
});
