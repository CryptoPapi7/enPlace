import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { getActiveCooking, ActiveCooking, clearActiveCooking } from '../utils/activeCooking';
import { getWeeklyPlan } from '../utils/weeklyPlan';
import { getFavorites, initFavorites } from '../utils/favorites';
import { useTheme } from '@/providers/ThemeProvider';

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
function NoActiveCookingCard({ colors, isMichelin }: { colors: any; isMichelin: boolean }) {
  const [plannedMeal, setPlannedMeal] = useState<{recipeId: string; recipeName: string; emoji: string; serveTime?: string} | null>(null);
  const dynamicStyles = createNoCookingStyles(colors, isMichelin);
  
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
    return (
      <TouchableOpacity style={dynamicStyles.readyCard} onPress={startCooking}>
        <View style={dynamicStyles.readyHeader}>
          <Text style={dynamicStyles.readyEmoji}>🍳</Text>
          <Text style={dynamicStyles.readyLabel}>READY TO COOK</Text>
        </View>
        <Text style={dynamicStyles.readyTitle}>Ready to start cooking?</Text>
        <View style={dynamicStyles.recipePreview}>
          <Text style={dynamicStyles.readyRecipeEmoji}>{plannedMeal.emoji}</Text>
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
      <Text style={dynamicStyles.startEmoji}>👨‍🍳</Text>
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
  const { colors, isMichelin } = useTheme();
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

  const dynamicStyles = createStyles(colors, isMichelin);

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <StatusBar style={isMichelin ? 'light' : 'dark'} />
      <ScrollView style={dynamicStyles.scrollView}>
        <Text style={dynamicStyles.title}>My Kitchen</Text>
        
        {/* Active Cooking */}
        {activeCooking ? (
          <View style={dynamicStyles.activeCard}>
            <TouchableOpacity onPress={resume} style={dynamicStyles.activeCardContent}>
              <View style={dynamicStyles.activeHeader}>
                <Text style={dynamicStyles.fireEmoji}>🔥</Text>
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
          <NoActiveCookingCard colors={colors} isMichelin={isMichelin} />
        )}

        {/* My Favorites */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>❤️ My Favorites</Text>
          {favorites.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {favorites.map((fav) => (
                <TouchableOpacity 
                  key={fav.id}
                  style={dynamicStyles.favCard}
                  onPress={() => router.push(`/recipe/${fav.id}`)}
                >
                  <Text style={dynamicStyles.favEmoji}>{fav.emoji}</Text>
                  <Text style={dynamicStyles.favName} numberOfLines={2}>{fav.title}</Text>
                </TouchableOpacity>
              ))}
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
          <Text style={dynamicStyles.sectionTitle}>⚡ Quick Access</Text>
          <View style={dynamicStyles.quickGrid2x2}>
            <TouchableOpacity 
              style={dynamicStyles.quickBtn}
              onPress={() => router.push('/my-library')}
            >
              <Text style={dynamicStyles.quickEmoji}>📚</Text>
              <Text style={dynamicStyles.quickLabel} numberOfLines={2} ellipsizeMode="tail">My Library</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={dynamicStyles.quickBtn}
              onPress={() => router.push('/(tabs)/plan')}
            >
              <Text style={dynamicStyles.quickEmoji}>📅</Text>
              <Text style={dynamicStyles.quickLabel} numberOfLines={2} ellipsizeMode="tail">This Week</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={dynamicStyles.quickBtn}
              onPress={() => router.push('/create-recipe')}
            >
              <Text style={dynamicStyles.quickEmoji}>✍️</Text>
              <Text style={dynamicStyles.quickLabel} numberOfLines={2} ellipsizeMode="tail">Create Recipe</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={dynamicStyles.quickBtn}
              onPress={() => router.push('/import-recipe')}
            >
              <Text style={dynamicStyles.quickEmoji}>📥</Text>
              <Text style={dynamicStyles.quickLabel} numberOfLines={2} ellipsizeMode="tail">Import Recipe</Text>
            </TouchableOpacity>
          </View>
        </View>

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
  scrollView: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.neutral[900],
    marginBottom: 24,
  },
  
  // Active Cooking
  activeCard: {
    backgroundColor: colors.primary[500],
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    shadowColor: colors.primary[500],
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
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 1,
    opacity: 0.9,
  },
  recipeName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  stepText: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
    marginBottom: 16,
  },
  resumeBtn: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  resumeText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary[500],
  },
  clearBtn: {
    marginTop: 12,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  clearText: {
    fontSize: 12,
    color: '#FFF',
    opacity: 0.8,
  },
  
  // Sections
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: 16,
  },
  
  // Favorites
  favCard: {
    backgroundColor: isMichelin ? colors.background?.secondary : '#FFF',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    width: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  favEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  favName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral[900],
    textAlign: 'center',
  },
  emptyFavs: {
    backgroundColor: isMichelin ? colors.background?.secondary : '#FFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 14,
    color: colors.neutral[500],
  },
  
  // Quick Access
  quickGrid2x2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickBtn: {
    width: '47%',
    backgroundColor: isMichelin ? colors.background?.secondary : '#FFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    borderWidth: 2,
    borderColor: isMichelin ? colors.neutral[300] : '#E8E8E8',
    marginBottom: 12,
  },
  quickEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.neutral[900],
    textAlign: 'center',
  },
});

const createNoCookingStyles = (colors: any, isMichelin: boolean) => StyleSheet.create({
  // Start Card (no active cooking, no plan)
  startCard: {
    backgroundColor: isMichelin ? colors.background?.secondary : '#FFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 2,
    borderColor: isMichelin ? colors.neutral[300] : '#E8E8E8',
    borderStyle: 'dashed',
  },
  startEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  startTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: 8,
  },
  startSub: {
    fontSize: 14,
    color: colors.neutral[500],
  },
  smallBtn: {
    backgroundColor: isMichelin ? colors.background?.tertiary : '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  smallBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.neutral[900],
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
    color: '#FFF',
    letterSpacing: 1,
    opacity: 0.9,
  },
  readyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
  },
  recipePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  readyRecipeEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  readyRecipeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    flex: 1,
  },
  readyTime: {
    fontSize: 13,
    color: '#FFF',
    opacity: 0.8,
    marginBottom: 16,
    marginLeft: 4,
  },
  startCookingBtn: {
    backgroundColor: '#FFF',
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
