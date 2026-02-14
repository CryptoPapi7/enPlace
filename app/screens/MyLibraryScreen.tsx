import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, TextInput } from "react-native";
import { useState, useCallback } from "react";
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { getMyLibraryRecipes, LibraryRecipe } from '../utils/library';
import { toggleFavorite, isFavorite } from '../utils/favorites';

export default function MyLibraryScreen() {
  const [recipes, setRecipes] = useState<(LibraryRecipe & { isFav?: boolean })[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Refresh library when screen is focused
  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const libRecipes = await getMyLibraryRecipes();
        // Check favorite status for each
        const withFavStatus = await Promise.all(
          libRecipes.map(async (r) => ({
            ...r,
            isFav: await isFavorite(r.id)
          }))
        );
        setRecipes(withFavStatus);
      };
      load();
    }, [])
  );

  const handleToggleFavorite = async (recipe: any) => {
    const newState = await toggleFavorite({
      id: recipe.id,
      title: recipe.title,
      emoji: recipe.emoji,
      cuisine: recipe.cuisine,
      time: recipe.time,
    });
    setRecipes(prev => 
      prev.map(r => r.id === recipe.id ? { ...r, isFav: newState } : r)
    );
  };

  const handleRecipePress = (recipeId: string) => {
    router.push(`/recipe/${recipeId}`);
  };

  // Filter recipes
  const filtered = searchQuery 
    ? recipes.filter(r => 
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : recipes;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>My Library</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search your recipes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>

        {/* Favorites Section */}
        {filtered.filter(r => r.isFav).length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>⭐ My Favorites</Text>
              <Text style={styles.sectionCount}>
                {filtered.filter(r => r.isFav).length}
              </Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {filtered.filter(r => r.isFav).map((recipe) => (
                <TouchableOpacity 
                  key={`fav-${recipe.id}`}
                  style={styles.horizontalCard}
                  onPress={() => handleRecipePress(recipe.id)}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.recipeEmoji}>{recipe.emoji}</Text>
                  </View>
                  <Text style={styles.recipeName} numberOfLines={2}>{recipe.title}</Text>
                  <Text style={styles.recipeMeta}>{recipe.cuisine} • {recipe.time}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Saved Recipes Section */}
        {filtered.filter(r => !r.isFav).length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📚 Saved Recipes</Text>
              <Text style={styles.sectionCount}>
                {filtered.filter(r => !r.isFav).length}
              </Text>
            </View>
            <View style={styles.grid}>
              {filtered.filter(r => !r.isFav).map((recipe) => (
                <TouchableOpacity 
                  key={`saved-${recipe.id}`}
                  style={styles.recipeCard}
                  onPress={() => handleRecipePress(recipe.id)}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.recipeEmoji}>{recipe.emoji}</Text>
                    <TouchableOpacity 
                      style={styles.favButton}
                      onPress={() => handleToggleFavorite(recipe)}
                  >
                    <Text style={styles.favEmoji}>
                      {recipe.isFav ? '❤️' : '🤍'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.recipeName} numberOfLines={2}>{recipe.title}</Text>
                <Text style={styles.recipeMeta}>{recipe.cuisine} • {recipe.time}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* My Creations Section (Future) */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>✍️ My Creations</Text>
          <Text style={styles.sectionCount}>0</Text>
        </View>
        <View style={styles.emptyCreations}>
          <Text style={styles.emptyCreationsText}>
            Create your own recipes to see them here
          </Text>
        </View>
      </View>

      {/* Total Count */}
      <Text style={styles.totalCount}>
        {recipes.length} total recipe{recipes.length !== 1 ? 's' : ''} in your library
      </Text>

      {recipes.length === 0 && !searchQuery && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📚</Text>
          <Text style={styles.emptyTitle}>Your library is empty</Text>
          <TouchableOpacity 
            style={styles.browseButton}
            onPress={() => router.push('/(tabs)/library')}
          >
            <Text style={styles.browseButtonText}>Browse All Recipes</Text>
          </TouchableOpacity>
        </View>
      )}
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
    marginBottom: 20,
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
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#5D4E37',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  countText: {
    fontSize: 14,
    color: '#8B7355',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5D4E37',
  },
  sectionCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B7355',
    backgroundColor: '#E8E8E8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  horizontalScroll: {
    minHeight: 140,
  },
  horizontalCard: {
    width: 120,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  totalCount: {
    fontSize: 14,
    color: '#8B7355',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  emptyCreations: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  emptyCreationsText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  recipeCard: {
    width: '47%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recipeEmoji: {
    fontSize: 32,
  },
  favButton: {
    padding: 4,
  },
  favEmoji: {
    fontSize: 20,
  },
  recipeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5D4E37',
    marginBottom: 4,
  },
  recipeMeta: {
    fontSize: 12,
    color: '#8B7355',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#5D4E37',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8B7355',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  browseButton: {
    backgroundColor: '#FF8C42',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  browseButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
