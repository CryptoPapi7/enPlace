import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, TextInput } from "react-native";
import { useState, useCallback } from "react";
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { getMyLibraryRecipes, LibraryRecipe } from '../utils/library';
import { toggleFavorite, isFavorite, getFavorites, FavoriteRecipe } from '../utils/favorites';
import { useTheme } from '@/providers/ThemeProvider';

export default function MyLibraryScreen() {
  const { colors, isMichelin } = useTheme();
  const dynamicStyles = createStyles(colors, isMichelin);
  const [recipes, setRecipes] = useState<(LibraryRecipe & { isFav?: boolean })[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>([]);

  // Refresh library when screen is focused
  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        // Load library recipes
        const libRecipes = await getMyLibraryRecipes();
        // Load favorites from Supabase
        const favRecipes = await getFavorites();
        setFavorites(favRecipes);
        
        // Mark library recipes that are favorites
        const favIds = new Set(favRecipes.map(f => f.id));
        const withFavStatus = libRecipes.map(r => ({
          ...r,
          isFav: favIds.has(r.id)
        }));
        setRecipes(withFavStatus);
      };
      load();
    }, [])
  );

  const handleToggleFavorite = async (recipe: any) => {
    const success = await toggleFavorite({
      id: recipe.id,
      title: recipe.title,
      emoji: recipe.emoji,
      cuisine: recipe.cuisine,
      time: recipe.time,
    });
    if (success) {
      // Refresh favorites from Supabase
      const favRecipes = await getFavorites();
      setFavorites(favRecipes);
      // Update library recipe status
      setRecipes(prev => 
        prev.map(r => r.id === recipe.id ? { ...r, isFav: !r.isFav } : r)
      );
    }
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
    <SafeAreaView style={dynamicStyles.container}>
      <StatusBar style={isMichelin ? 'light' : 'dark'} />
      <ScrollView style={dynamicStyles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={dynamicStyles.header}>
          <TouchableOpacity 
            style={dynamicStyles.backButton}
            onPress={() => router.back()}
          >
            <Text style={dynamicStyles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={dynamicStyles.title}>My Library</Text>
          <View style={dynamicStyles.placeholder} />
        </View>

        {/* Search */}
        <View style={dynamicStyles.searchContainer}>
          <TextInput
            style={dynamicStyles.searchInput}
            placeholder="Search your recipes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>

        {/* Favorites Section - From Supabase */}
        {favorites.length > 0 && (
          <View style={dynamicStyles.section}>
            <View style={dynamicStyles.sectionHeader}>
              <Text style={dynamicStyles.sectionTitle}>⭐ My Favorites</Text>
              <Text style={dynamicStyles.sectionCount}>
                {favorites.length}
              </Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={dynamicStyles.horizontalScroll}>
              {favorites.map((recipe) => (
                <TouchableOpacity 
                  key={`fav-${recipe.id}`}
                  style={dynamicStyles.horizontalCard}
                  onPress={() => handleRecipePress(recipe.id)}
                >
                  <View style={dynamicStyles.cardHeader}>
                    <Text style={dynamicStyles.recipeEmoji}>{recipe.emoji}</Text>
                    <TouchableOpacity 
                      style={dynamicStyles.favButton}
                      onPress={() => handleToggleFavorite(recipe)}
                    >
                      <Text style={dynamicStyles.favEmoji}>❤️</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={dynamicStyles.recipeName} numberOfLines={2}>{recipe.title}</Text>
                  <Text style={dynamicStyles.recipeMeta}>{recipe.cuisine} • {recipe.time}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Saved Recipes Section */}
        {filtered.filter(r => !r.isFav).length > 0 && (
          <View style={dynamicStyles.section}>
            <View style={dynamicStyles.sectionHeader}>
              <Text style={dynamicStyles.sectionTitle}>📚 Saved Recipes</Text>
              <Text style={dynamicStyles.sectionCount}>
                {filtered.filter(r => !r.isFav).length}
              </Text>
            </View>
            <View style={dynamicStyles.grid}>
              {filtered.filter(r => !r.isFav).map((recipe) => (
                <TouchableOpacity 
                  key={`saved-${recipe.id}`}
                  style={dynamicStyles.recipeCard}
                  onPress={() => handleRecipePress(recipe.id)}
                >
                  <View style={dynamicStyles.cardHeader}>
                    <Text style={dynamicStyles.recipeEmoji}>{recipe.emoji}</Text>
                    <TouchableOpacity 
                      style={dynamicStyles.favButton}
                      onPress={() => handleToggleFavorite(recipe)}
                  >
                    <Text style={dynamicStyles.favEmoji}>
                      {recipe.isFav ? '❤️' : '🤍'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={dynamicStyles.recipeName} numberOfLines={2}>{recipe.title}</Text>
                <Text style={dynamicStyles.recipeMeta}>{recipe.cuisine} • {recipe.time}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* My Creations Section (Future) */}
      <View style={dynamicStyles.section}>
        <View style={dynamicStyles.sectionHeader}>
          <Text style={dynamicStyles.sectionTitle}>✍️ My Creations</Text>
          <Text style={dynamicStyles.sectionCount}>0</Text>
        </View>
        <View style={dynamicStyles.emptyCreations}>
          <Text style={dynamicStyles.emptyCreationsText}>
            Create your own recipes to see them here
          </Text>
        </View>
      </View>

      {/* Total Count */}
      <Text style={dynamicStyles.totalCount}>
        {recipes.length} total recipe{recipes.length !== 1 ? 's' : ''} in your library
      </Text>

      {recipes.length === 0 && !searchQuery && (
        <View style={dynamicStyles.emptyState}>
          <Text style={dynamicStyles.emptyEmoji}>📚</Text>
          <Text style={dynamicStyles.emptyTitle}>Your library is empty</Text>
          <TouchableOpacity 
            style={dynamicStyles.browseButton}
            onPress={() => router.push('/(tabs)/library')}
          >
            <Text style={dynamicStyles.browseButtonText}>Browse All Recipes</Text>
          </TouchableOpacity>
        </View>
      )}
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
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: isMichelin ? colors.background?.secondary : '#FFF',
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
    color: colors.neutral[900],
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  placeholder: {
    width: 44,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: isMichelin ? colors.background?.secondary : '#FFF',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: colors.neutral[900],
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  countText: {
    fontSize: 14,
    color: colors.neutral[700],
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
    color: colors.neutral[900],
  },
  sectionCount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[700],
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
    backgroundColor: isMichelin ? colors.background?.secondary : '#FFF',
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
    color: colors.neutral[700],
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  emptyCreations: {
    backgroundColor: isMichelin ? colors.background?.secondary : '#FFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  emptyCreationsText: {
    fontSize: 14,
    color: isMichelin ? colors.neutral[500] : colors.neutral[500],
    fontStyle: 'italic',
  },
  recipeCard: {
    width: '47%',
    backgroundColor: isMichelin ? colors.background?.secondary : '#FFF',
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
    color: colors.neutral[900],
    marginBottom: 4,
  },
  recipeMeta: {
    fontSize: 12,
    color: colors.neutral[700],
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
    color: colors.neutral[900],
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.neutral[700],
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  browseButton: {
    backgroundColor: colors.primary[500],
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  browseButtonText: {
    color: isMichelin ? colors.background?.secondary : '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
