import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Image } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { getActiveCooking, ActiveCooking, clearActiveCooking } from '../utils/activeCooking';
import { getWeeklyPlan } from '../utils/weeklyPlan';
import { getFavorites, initFavorites } from '../utils/favorites';
import { ALL_RECIPES } from '../data/recipes';
import { useTheme } from '@/providers/ThemeProvider';
import { typography } from '@/theme';

// Recipe validation map (ids that exist in the app)
const VALID_RECIPE_IDS = [
  'chicken-curry',
  'beef-rendang',
  'fresh-pasta',
  'sourdough',
  'pepperpot',
  'doubles',
  'fish-curry',
  'dhal-puri',
  'pasta-pomodoro',
  'roti-curry-channa',
  'pho-bo',
  'jerk-chicken',
];

// Smart empty state component for when not actively cooking
function NoActiveCookingCard({ colors }: { colors: any }) {
  const [plannedMeal, setPlannedMeal] = useState<{recipeId: string; recipeName: string; emoji: string; serveTime?: string} | null>(null);
  const dynamicStyles = createNoCookingStyles(colors);
  
  // Re-check plan whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const checkPlan = async () => {
        try {
          const plan = await getWeeklyPlan();
          // Weekly plan uses relative indices: first item is always "Today"
          // dayName: "Today", "Mon", "Tue", etc.
          const todayPlan = plan?.find((p: any) => p.dayName === 'Today');
          
          if (todayPlan?.meals?.length > 0) {
            const meal = todayPlan.meals[0];
            setPlannedMeal({
              recipeId: meal.recipeId,
              recipeName: meal.recipeName,
              emoji: meal.emoji || '🍽️',
              serveTime: meal.serveTime
            });
          } else {
            // Reset when no meal planned for today
            setPlannedMeal(null);
          }
        } catch (e) {
          console.error('Error checking plan:', e);
        }
      };
      checkPlan();
    }, [])
  );

  const startCooking = () => {
    if (plannedMeal) {
      router.push(`/recipe/${plannedMeal.recipeId}`);
    }
  };

  if (plannedMeal) {
    const plannedRecipe = ALL_RECIPES.find(r => r.id === plannedMeal.recipeId);
    return (
      <TouchableOpacity style={dynamicStyles.readyCard} onPress={startCooking}>
        <View style={dynamicStyles.readyHeader}>
          <Text style={dynamicStyles.readyLabel}>READY TO COOK</Text>
        </View>
        <Text style={dynamicStyles.readyTitle}>Ready to start cooking?</Text>
        <View style={dynamicStyles.recipePreview}>
          {plannedRecipe?.imageUrl ? (
            <Image source={{ uri: plannedRecipe.imageUrl }} style={dynamicStyles.readyThumb} />
          ) : (
            <View style={dynamicStyles.readyThumb} />
          )}
          <Text style={dynamicStyles.readyRecipeName}>{plannedMeal.recipeName}</Text>
        </View>
        {plannedMeal.serveTime && (
          <Text style={dynamicStyles.readyTime}>Planned for {plannedMeal.serveTime}</Text>
        )}
        <View style={dynamicStyles.startCookingBtn}>
          <Text style={dynamicStyles.startCookingText}>START COOKING →</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={dynamicStyles.startCard}>
      <Text style={dynamicStyles.startTitle}>Not cooking today?</Text>
      <Text style={dynamicStyles.startSub}>Pick a recipe or plan your week</Text>
      <View style={dynamicStyles.emptyActions}>
        <TouchableOpacity 
          style={dynamicStyles.smallBtn}
          onPress={() => router.push('/(tabs)/library')}
        >
          <Text style={dynamicStyles.smallBtnText}>Browse</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={dynamicStyles.smallBtn}
          onPress={() => router.push('/(tabs)/plan')}
        >
          <Text style={dynamicStyles.smallBtnText}>Plan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function CookLauncherScreen() {
  const { colors } = useTheme();
  const [activeCooking, setActiveCooking] = useState<ActiveCooking | null>(null);
  const [favorites, setFavorites] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const cooking = await getActiveCooking();
        
        // Validate active cooking state - clear if recipe doesn't exist anymore
        if (cooking && !VALID_RECIPE_IDS.includes(cooking.recipeId)) {
          console.log('Clearing invalid active cooking state:', cooking.recipeId);
          await clearActiveCooking();
          setActiveCooking(null);
        } else {
          setActiveCooking(cooking);
        }
        
        await initFavorites();
        const favs = await getFavorites();
        setFavorites(favs);
      };
      load();
    }, [])
  );

  const resume = () => {
    if (activeCooking) {
      router.push(`/cooking?recipeId=${activeCooking.recipeId}&resumeStep=${activeCooking.currentStep}`);
    }
  };

  const handleClearProgress = async () => {
    await clearActiveCooking();
    setActiveCooking(null);
  };

  const dynamicStyles = createStyles(colors);

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <StatusBar style="dark" />
      <ScrollView style={dynamicStyles.scrollView}>
        <Text style={dynamicStyles.title}>My Kitchen</Text>
        
        {/* Active Cooking */}
        {activeCooking ? (
          <View style={dynamicStyles.activeCard}>
            <TouchableOpacity onPress={resume} style={dynamicStyles.activeCardContent}>
              <View style={dynamicStyles.activeHeader}>
                <Text style={dynamicStyles.cookingNow}>COOKING NOW</Text>
              </View>
              <Text style={dynamicStyles.recipeName}>{activeCooking.recipeName}</Text>
              <Text style={dynamicStyles.stepText}>
                Step {activeCooking.currentStep + 1} of {activeCooking.totalSteps}
              </Text>
              <View style={dynamicStyles.resumeBtn}>
                <Text style={dynamicStyles.resumeText}>RESUME →</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={dynamicStyles.clearBtn} onPress={handleClearProgress}>
              <Text style={dynamicStyles.clearText}>✕ Clear Progress</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <NoActiveCookingCard colors={colors} />
        )}

        {/* My Favorites */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>My Favorites</Text>
          {favorites.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {favorites.map((fav) => {
                const favRecipe = ALL_RECIPES.find(r => r.id === fav.id);
                return (
                  <TouchableOpacity
                    key={fav.id}
                    style={dynamicStyles.favCard}
                    onPress={() => router.push(`/recipe/${fav.id}`)}
                  >
                    {favRecipe?.imageUrl ? (
                      <Image source={{ uri: favRecipe.imageUrl }} style={dynamicStyles.favImage} />
                    ) : (
                      <View style={dynamicStyles.favImage} />
                    )}
                    <Text style={dynamicStyles.favName} numberOfLines={2}>{fav.title}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : (
            <TouchableOpacity 
              style={dynamicStyles.emptyFavs}
              onPress={() => router.replace('/(tabs)/library')}
            >
              <Text style={dynamicStyles.emptyText}>No favorites yet</Text>
              <Text style={dynamicStyles.emptySub}>Browse recipes and save the ones you love</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Access */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Quick Access</Text>
          <View style={dynamicStyles.quickList}>
            <TouchableOpacity
              style={dynamicStyles.quickBtn}
              onPress={() => router.push('/my-library')}
            >
              <Text style={dynamicStyles.quickLabel}>My Library</Text>
              <Text style={dynamicStyles.quickArrow}>→</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={dynamicStyles.quickBtn}
              onPress={() => router.push('/(tabs)/plan')}
            >
              <Text style={dynamicStyles.quickLabel}>This Week</Text>
              <Text style={dynamicStyles.quickArrow}>→</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={dynamicStyles.quickBtn}
              onPress={() => router.push('/create-recipe')}
            >
              <Text style={dynamicStyles.quickLabel}>Create Recipe</Text>
              <Text style={dynamicStyles.quickArrow}>→</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={dynamicStyles.quickBtn}
              onPress={() => router.push('/import-recipe')}
            >
              <Text style={dynamicStyles.quickLabel}>Import Recipe</Text>
              <Text style={dynamicStyles.quickArrow}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

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
  scrollView: {
    flex: 1,
    padding: 24,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: 24,
  },
  
  // Active Cooking
  activeCard: {
    backgroundColor: colors.accent.primary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    shadowColor: colors.accent.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 4,
  },
  activeCardContent: {
    flex: 1,
  },
  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  fireEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  cookingNow: {
    ...typography.label,
    color: colors.text.inverse,
    opacity: 0.9,
  },
  recipeName: {
    ...typography.h3,
    color: colors.text.inverse,
    marginBottom: 4,
  },
  stepText: {
    ...typography.caption,
    color: colors.text.inverse,
    opacity: 0.9,
    marginBottom: 16,
  },
  resumeBtn: {
    backgroundColor: colors.surface.secondary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  resumeText: {
    ...typography.bodyMedium,
    color: colors.accent.primary,
  },
  clearBtn: {
    marginTop: 12,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  clearText: {
    ...typography.caption,
    color: colors.text.inverse,
    opacity: 0.8,
  },
  
  // Sections
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: 16,
  },
  
  // Favorites
  favCard: {
    backgroundColor: colors.surface.secondary,
    borderRadius: 12,
    marginRight: 12,
    width: 140,
    overflow: 'hidden',
    shadowColor: colors.border.subtle,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  favImage: {
    width: '100%',
    aspectRatio: 4/3,
    backgroundColor: colors.surface.raised,
  },
  favName: {
    ...typography.caption,
    color: colors.text.primary,
    padding: 10,
  },
  emptyFavs: {
    backgroundColor: colors.surface.secondary,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    marginBottom: 4,
  },
  emptySub: {
    ...typography.caption,
    color: colors.text.muted,
  },
  
  // Quick Access
  quickList: {
    gap: 8,
  },
  quickBtn: {
    backgroundColor: colors.surface.secondary,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: colors.border.default,
  },
  quickLabel: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  quickArrow: {
    fontSize: 16,
    color: colors.text.muted,
  },
});

const createNoCookingStyles = (colors: any) => StyleSheet.create({
  // Start Card (no active cooking, no plan)
  startCard: {
    backgroundColor: colors.surface.secondary,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 2,
    borderColor: colors.border.subtle,
    borderStyle: 'dashed',
  },
  startEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  startTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  startSub: {
    fontSize: 14,
    color: colors.text.muted,
  },
  smallBtn: {
    backgroundColor: colors.surface.raised,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  smallBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
  },
  emptyActions: {
    flexDirection: 'row',
    marginTop: 16,
  },
  
  // Ready to Cook Card (has planned recipe for today)
  readyCard: {
    backgroundColor: colors.success,
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 4,
  },
  readyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  readyEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  readyLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.surface.secondary,
    letterSpacing: 1,
    opacity: 0.9,
  },
  readyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.surface.secondary,
    marginBottom: 16,
  },
  recipePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  readyThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  readyRecipeName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.surface.secondary,
    flex: 1,
  },
  readyTime: {
    fontSize: 13,
    color: colors.surface.secondary,
    opacity: 0.8,
    marginBottom: 16,
    marginLeft: 4,
  },
  startCookingBtn: {
    backgroundColor: colors.surface.secondary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  startCookingText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.success,
  },
});
