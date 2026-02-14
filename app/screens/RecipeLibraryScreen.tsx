import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import { useState, useCallback } from "react";
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, router, useLocalSearchParams } from 'expo-router';
import { ALL_RECIPES } from '../data/recipes';
import { isFavorite, toggleFavorite, getFavorites, initFavorites } from '../utils/favorites';
import { colors, spacing, typography, shadows } from '../theme';

// Filter categories
const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'comfort', label: 'Comfort' },
  { id: 'quick', label: 'Quick' },
  { id: 'showoff', label: 'Show Off' },
  { id: 'mindful', label: 'Mindful' },
];

export default function RecipeLibraryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const { selectingForPlan } = useLocalSearchParams<{ selectingForPlan?: string }>();
  const isSelectingForPlan = selectingForPlan === 'true';

  // Refresh favorites when screen is focused
  useFocusEffect(
    useCallback(() => {
      initFavorites().then(() => {
        getFavorites().then(favs => {
          setFavorites(favs.map(f => f.id));
        });
      });
    }, [])
  );

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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Recipe Library</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search recipes, cuisines..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        {searchQuery && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearButton}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Pills */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {FILTERS.map(filter => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterPill,
              activeFilter === filter.id && styles.filterPillActive,
            ]}
            onPress={() => setActiveFilter(filter.id)}
          >
            <Text style={[
              styles.filterText,
              activeFilter === filter.id && styles.filterTextActive,
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Recipe Grid */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.grid}>
        {filtered.map(recipe => (
          <View
            key={recipe.id}
            style={[styles.recipeCard, !recipe.available && styles.recipeCardDisabled]}
          >
            {/* Favorite Heart */}
            <TouchableOpacity 
              style={styles.heartButton}
              onPress={() => handleToggleFavorite(recipe)}
            >
              <Text style={styles.heartEmoji}>
                {favorites.includes(recipe.id) ? '❤️' : '🤍'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => handleRecipePress(recipe)}>
              <Text style={styles.recipeEmoji}>{recipe.emoji}</Text>
              <Text style={styles.recipeTitle} numberOfLines={2}>{recipe.title}</Text>
            </TouchableOpacity>
            <Text style={styles.recipeCuisine}>{recipe.cuisine}</Text>
            <View style={styles.recipeMeta}>
              <Text style={styles.recipeTime}>⏱️ {recipe.timeDisplay || recipe.time}</Text>
              <Text style={styles.recipeDifficulty}>{recipe.difficulty}</Text>
            </View>
            
            {/* Action Buttons */}
            {recipe.available && (
              <View style={styles.cardActions}>
                <TouchableOpacity 
                  style={styles.addToPlanButton}
                  onPress={() => router.push(`/plan?addRecipe=${recipe.id}`)}
                >
                  <Text style={styles.addToPlanText}>➕ Add to Plan</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {!recipe.available && (
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>Soon</Text>
              </View>
            )}
          </View>
        ))}
        
        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>No recipes found</Text>
            <Text style={styles.emptySub}>Try a different search</Text>
          </View>
        )}
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream[50],
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
    color: '#5D4E37',
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5D4E37',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
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
    color: '#5D4E37',
  },
  clearButton: {
    fontSize: 16,
    color: '#999',
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
    backgroundColor: '#FFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterPillActive: {
    backgroundColor: '#87CEEB',
    borderColor: '#87CEEB',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
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
  recipeCard: {
    width: '47%',
    backgroundColor: '#FFF',
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
    color: '#5D4E37',
    marginBottom: 4,
    textAlign: 'center',
  },
  recipeCuisine: {
    fontSize: 12,
    color: '#87CEEB',
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
    color: '#666',
  },
  recipeDifficulty: {
    fontSize: 11,
    color: '#FF8C42',
    fontWeight: '500',
  },
  comingSoonBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#999',
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
    backgroundColor: '#4CAF50',
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
    color: '#5D4E37',
  },
  emptySub: {
    fontSize: 14,
    color: '#87CEEB',
  },
});