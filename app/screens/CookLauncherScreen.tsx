import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { getActiveCooking, ActiveCooking, clearActiveCooking } from '../utils/activeCooking';
import { getWeeklyPlan } from '../utils/weeklyPlan';
import { getFavorites, initFavorites } from '../utils/favorites';

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
function NoActiveCookingCard({ navigation }: any) {
  const [plannedMeal, setPlannedMeal] = useState<{recipeId: string; recipeName: string; emoji: string; serveTime?: string} | null>(null);
  
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
      navigation.navigate('Cook', { recipeId: plannedMeal.recipeId });
    }
  };

  if (plannedMeal) {
    return (
      <TouchableOpacity style={styles.readyCard} onPress={startCooking}>
        <View style={styles.readyHeader}>
          <Text style={styles.readyEmoji}>🍳</Text>
          <Text style={styles.readyLabel}>READY TO COOK</Text>
        </View>
        <Text style={styles.readyTitle}>Ready to start cooking?</Text>
        <View style={styles.recipePreview}>
          <Text style={styles.readyRecipeEmoji}>{plannedMeal.emoji}</Text>
          <Text style={styles.readyRecipeName}>{plannedMeal.recipeName}</Text>
        </View>
        {plannedMeal.serveTime && (
          <Text style={styles.readyTime}>Planned for {plannedMeal.serveTime}</Text>
        )}
        <View style={styles.startCookingBtn}>
          <Text style={styles.startCookingText}>START COOKING →</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.startCard}>
      <Text style={styles.startEmoji}>👨‍🍳</Text>
      <Text style={styles.startTitle}>Not cooking today?</Text>
      <Text style={styles.startSub}>Pick a recipe or plan your week</Text>
      <View style={styles.emptyActions}>
        <TouchableOpacity 
          style={styles.smallBtn}
          onPress={() => navigation.navigate('RecipeLibrary')}
        >
          <Text style={styles.smallBtnText}>Browse</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.smallBtn}
          onPress={() => navigation.navigate('PlanWeek')}
        >
          <Text style={styles.smallBtnText}>Plan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function CookLauncherScreen({ navigation }: any) {
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
      navigation.navigate('Cook', { 
        recipeId: activeCooking.recipeId,
        resumeStep: activeCooking.currentStep 
      });
    }
  };

  const handleClearProgress = async () => {
    await clearActiveCooking();
    setActiveCooking(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>My Kitchen</Text>
        
        {/* Active Cooking */}
        {activeCooking ? (
          <View style={styles.activeCard}>
            <TouchableOpacity onPress={resume} style={styles.activeCardContent}>
              <View style={styles.activeHeader}>
                <Text style={styles.fireEmoji}>🔥</Text>
                <Text style={styles.cookingNow}>COOKING NOW</Text>
              </View>
              <Text style={styles.recipeName}>{activeCooking.recipeName}</Text>
              <Text style={styles.stepText}>
                Step {activeCooking.currentStep + 1} of {activeCooking.totalSteps}
              </Text>
              <View style={styles.resumeBtn}>
                <Text style={styles.resumeText}>RESUME →</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.clearBtn} onPress={handleClearProgress}>
              <Text style={styles.clearText}>✕ Clear Progress</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <NoActiveCookingCard navigation={navigation} />
        )}

        {/* My Favorites */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>❤️ My Favorites</Text>
          {favorites.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {favorites.map((fav) => (
                <TouchableOpacity 
                  key={fav.id}
                  style={styles.favCard}
                  onPress={() => navigation.navigate('RecipeHome', { recipeId: fav.id })}
                >
                  <Text style={styles.favEmoji}>{fav.emoji}</Text>
                  <Text style={styles.favName} numberOfLines={2}>{fav.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <TouchableOpacity 
              style={styles.emptyFavs}
              onPress={() => navigation.navigate('RecipeLibrary')}
            >
              <Text style={styles.emptyText}>No favorites yet</Text>
              <Text style={styles.emptySub}>Browse recipes and save the ones you love</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Access */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Quick Access</Text>
          <View style={styles.quickGrid2x2}>
            <TouchableOpacity 
              style={styles.quickBtn}
              onPress={() => navigation.navigate('MyLibrary')}
            >
              <Text style={styles.quickEmoji}>📚</Text>
              <Text style={styles.quickLabel} numberOfLines={2} ellipsizeMode="tail">My Library</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickBtn}
              onPress={() => navigation.navigate('PlanWeek')}
            >
              <Text style={styles.quickEmoji}>📅</Text>
              <Text style={styles.quickLabel} numberOfLines={2} ellipsizeMode="tail">This Week</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickBtn}
              onPress={() => navigation.navigate('CreateRecipe')}
            >
              <Text style={styles.quickEmoji}>✍️</Text>
              <Text style={styles.quickLabel} numberOfLines={2} ellipsizeMode="tail">Create Recipe</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickBtn}
              onPress={() => navigation.navigate('ImportRecipe')}
            >
              <Text style={styles.quickEmoji}>📥</Text>
              <Text style={styles.quickLabel} numberOfLines={2} ellipsizeMode="tail">Import Recipe</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
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
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#5D4E37',
    marginBottom: 24,
  },
  
  // Active Cooking
  activeCard: {
    backgroundColor: '#FF8C42',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#FF8C42',
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
    color: '#FF8C42',
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
  
  // Start Card (no active cooking, no plan)
  startCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    borderStyle: 'dashed',
  },
  startEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  startTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#5D4E37',
    marginBottom: 8,
  },
  startSub: {
    fontSize: 14,
    color: '#8B7355',
  },
  startSubSmall: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  browseBtn: {
    marginTop: 16,
    backgroundColor: '#FF8C42',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  browseBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  smallBtn: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  smallBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5D4E37',
  },
  emptyActions: {
    flexDirection: 'row',
    marginTop: 16,
  },
  
  // Ready to Cook Card (has planned recipe for today)
  readyCard: {
    backgroundColor: '#7CB342',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#7CB342',
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
    color: '#7CB342',
  },
  
  // Sections
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5D4E37',
    marginBottom: 16,
  },
  
  // Favorites
  favCard: {
    backgroundColor: '#FFF',
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
    color: '#5D4E37',
    textAlign: 'center',
  },
  emptyFavs: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5D4E37',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 14,
    color: '#8B7355',
  },
  
  // Quick Access
  quickGrid2x2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickBtn: {
    width: '47%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    marginBottom: 12,
  },
  quickEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5D4E37',
    textAlign: 'center',
  },
});
