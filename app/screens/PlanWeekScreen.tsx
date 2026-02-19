import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Modal } from "react-native";
import { useState, useEffect } from "react";
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ALL_RECIPES, beefRendangRecipe, chickenCurryRecipe, freshPastaRecipe, sourdoughRecipe } from '../data/recipes';
import { saveWeeklyPlan, getWeeklyPlan } from '../utils/weeklyPlan';
import { useTheme } from '@/providers/ThemeProvider';
import { layout } from '../theme/spacing';

// Recipe lookup for ingredient data
const RECIPE_DATA: Record<string, any> = {
  'chicken-curry': chickenCurryRecipe,
  'beef-rendang': beefRendangRecipe,
  'fresh-pasta': freshPastaRecipe,
  'sourdough': sourdoughRecipe,
};

interface PlannedMeal {
  recipeId: string;
  recipeName: string;
  emoji: string;
  serveTime: string;
  servings: number;
}

interface DayPlan {
  date: string;
  dayName: string;
  meals: PlannedMeal[];
}

// Generate next 7 days
function generateWeekDays(): DayPlan[] {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const result: DayPlan[] = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    result.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dayName: i === 0 ? 'Today' : days[date.getDay()],
      meals: [],
    });
  }
  
  return result;
}

export default function PlanWeekScreen() {
  const { colors, isMichelin } = useTheme();
  const dynamicStyles = createStyles(colors, isMichelin);
  const { selectedRecipe: selectedRecipeParam, addRecipe, servings: servingsParam, moveRecipe } = useLocalSearchParams<{
    selectedRecipe?: string;
    addRecipe?: string;
    moveRecipe?: string;
  }>();
  const [weekPlan, setWeekPlan] = useState<DayPlan[]>(generateWeekDays());
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [showRecipePicker, setShowRecipePicker] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [showServingsPicker, setShowServingsPicker] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [selectedDayForRecipe, setSelectedDayForRecipe] = useState<number | null>(null);
  const [mealToMove, setMealToMove] = useState<{ dayIndex: number; mealIndex: number } | null>(null);
  const [pendingServings, setPendingServings] = useState<number>(4);
  const [skipServingsPicker, setSkipServingsPicker] = useState(false);

  // Load saved weekly plan on mount
  useEffect(() => {
    const loadPlan = async () => {
      const saved = await getWeeklyPlan();
      if (saved) {
        setWeekPlan(saved);
      }
    };
    loadPlan();
  }, []);

  // Handle recipe selected from RecipeLibrary
  useEffect(() => {
    if (selectedRecipeParam) {
      const recipe = JSON.parse(selectedRecipeParam);
      setSelectedRecipe(recipe);
      setPendingServings(recipe.data?.servings || 4);
      setShowDayPicker(true);
    }
  }, [selectedRecipeParam]);

  // Handle add to plan from RecipeScreen
  useEffect(() => {
    if (addRecipe) {
      const recipeId = addRecipe;
      const recipe = ALL_RECIPES.find(r => r.id === recipeId);
      if (recipe) {
        const customServings = servingsParam ? parseInt(servingsParam, 10) : recipe.data?.servings || 4;
        console.log(`RecipeScreen flow: ${recipe.title}, customServings=${customServings}`);
        setSelectedRecipe(recipe);
        setPendingServings(customServings);
        setShowDayPicker(true);
      }
    }
  }, [addRecipe, servingsParam]);

  // Auto-save weekly plan when it changes
  useEffect(() => {
    saveWeeklyPlan(weekPlan);
  }, [weekPlan]);

  // Add recipe to a specific day
  const addMealToDay = (dayIndex: number) => {
    if (!selectedRecipe) return;
    
    console.log(`addMealToDay: ${selectedRecipe.title}, pendingServings=${pendingServings}`);
    const newPlan = [...weekPlan];
    newPlan[dayIndex].meals.push({
      recipeId: selectedRecipe.id,
      recipeName: selectedRecipe.title,
      emoji: selectedRecipe.emoji,
      serveTime: '18:00',
      servings: pendingServings,
    });
    setWeekPlan(newPlan);
    setSelectedRecipe(null);
    setPendingServings(4);
    setShowDayPicker(false);
    setShowServingsPicker(false);
  };
  
  // Handle day selected from day picker
  const handleDaySelected = (dayIndex: number) => {
    if (selectedDayForRecipe !== null) {
      // Coming from empty slot flow - show servings picker
      setSelectedDayForRecipe(dayIndex);
      setShowDayPicker(false);
      setShowServingsPicker(true);
    } else {
      // Coming from RecipeScreen - add directly with recipe default servings
      addMealToDay(dayIndex);
    }
  };

  // Add a recipe to selected day (from empty slot tap)
  const addRecipeToSelectedDay = (recipe: any) => {
    if (selectedDayForRecipe === null) return;
    
    const defaultServings = recipe.data?.servings || 4;
    console.log(`addRecipeToSelectedDay: ${recipe.title}, defaultServings=${defaultServings}`);
    setSelectedRecipe(recipe);
    setPendingServings(defaultServings);
    setShowRecipePicker(false);
    setShowServingsPicker(true);
  };

  // Remove meal from day
  const removeMeal = (dayIndex: number, mealIndex: number) => {
    const newPlan = [...weekPlan];
    newPlan[dayIndex].meals.splice(mealIndex, 1);
    setWeekPlan(newPlan);
  };

  // Move meal to different day
  const moveMeal = (fromDay: number, mealIndex: number, toDay: number) => {
    if (fromDay === toDay) return;
    if (weekPlan[toDay].meals.length >= 3) {
      alert(`${weekPlan[toDay].dayName} already has 3 meals`);
      return;
    }
    
    const newPlan = [...weekPlan];
    const meal = newPlan[fromDay].meals[mealIndex];
    newPlan[fromDay].meals.splice(mealIndex, 1);
    newPlan[toDay].meals.push(meal);
    setWeekPlan(newPlan);
    setShowMoveMenu(false);
    setMealToMove(null);
  };

  // Open move menu
  const openMoveMenu = (dayIndex: number, mealIndex: number) => {
    setMealToMove({ dayIndex, mealIndex });
    setShowMoveMenu(true);
  };

  // Calculate when to start cooking
  const getStartTime = (serveTime: string, cookTimeMinutes: number) => {
    const [hours, minutes] = serveTime.split(':').map(Number);
    const serveDate = new Date();
    serveDate.setHours(hours, minutes, 0);
    
    const startDate = new Date(serveDate.getTime() - cookTimeMinutes * 60000);
    return startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <StatusBar style={isMichelin ? 'light' : 'dark'} />
      
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={dynamicStyles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={dynamicStyles.title}>🗓️ Plan This Week</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Add Recipe CTA */}
      <TouchableOpacity 
        style={dynamicStyles.addButton}
        onPress={() => router.push({ pathname: '/(tabs)/library', params: { selectingForPlan: 'true' } })}
      >
        <Text style={dynamicStyles.addButtonEmoji}>➕</Text>
        <Text style={dynamicStyles.addButtonText}>Add Recipe to Plan</Text>
      </TouchableOpacity>

      {/* Week View */}
      <ScrollView style={dynamicStyles.scrollView}>
        {weekPlan.map((day, dayIndex) => (
          <View key={dayIndex} style={dynamicStyles.dayCard}>
            <View style={dynamicStyles.dayHeader}>
              <Text style={dynamicStyles.dayName}>{day.dayName}</Text>
              <Text style={dynamicStyles.dayDate}>{day.date}</Text>
            </View>
            
            {/* Meals (up to 3) */}
            {day.meals.map((meal, mealIndex) => (
              <TouchableOpacity 
                key={mealIndex} 
                style={dynamicStyles.mealCard}
                onLongPress={() => {
                  setMealToMove({ dayIndex, mealIndex });
                  setShowMoveMenu(true);
                }}
                delayLongPress={500}
              >
                <Text style={dynamicStyles.mealEmoji}>{meal.emoji}</Text>
                <View style={dynamicStyles.mealInfo}>
                  <Text style={dynamicStyles.mealName}>{meal.recipeName}</Text>
                  <Text style={dynamicStyles.mealTime}>
                    Serve at {meal.serveTime}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => removeMeal(dayIndex, mealIndex)}>
                  <Text style={dynamicStyles.removeButton}>✕</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
            
            {/* Add another meal slot (if < 3 meals) */}
            {day.meals.length < 3 && (
              <TouchableOpacity 
                style={[dynamicStyles.emptySlot, day.meals.length > 0 && dynamicStyles.emptySlotCompact]}
                onPress={() => {
                  setSelectedDayForRecipe(dayIndex);
                  setShowRecipePicker(true);
                }}
              >
                <Text style={dynamicStyles.emptySlotText}>
                  {day.meals.length === 0 ? 'Tap to add meal' : '+ Add another meal'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
        
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Day Picker Modal (when recipe selected from library) */}
      <Modal
        visible={showDayPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDayPicker(false)}
      >
        <TouchableOpacity 
          style={dynamicStyles.modalOverlay}
          onPress={() => setShowDayPicker(false)}
          activeOpacity={1}
        >
          <TouchableOpacity 
            style={dynamicStyles.modalContent}
            onPress={(e) => e.stopPropagation()}
            activeOpacity={1}
          >
            <Text style={dynamicStyles.modalTitle}>Add to which day?</Text>
            {weekPlan.map((day, idx) => (
              <TouchableOpacity
                key={idx}
                style={dynamicStyles.dayOption}
                onPress={() => handleDaySelected(idx)}
              >
                <Text style={dynamicStyles.dayOptionEmoji}>📅</Text>
                <View>
                  <Text style={dynamicStyles.dayOptionName}>{day.dayName}</Text>
                  <Text style={dynamicStyles.dayOptionDate}>{day.date}</Text>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity 
              style={dynamicStyles.cancelButton}
              onPress={() => setShowDayPicker(false)}
            >
              <Text style={dynamicStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Servings Picker Modal */}
      <Modal
        visible={showServingsPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowServingsPicker(false)}
      >
        <TouchableOpacity 
          style={dynamicStyles.modalOverlay}
          onPress={() => setShowServingsPicker(false)}
          activeOpacity={1}
        >
          <TouchableOpacity 
            style={dynamicStyles.modalContent}
            onPress={(e) => e.stopPropagation()}
            activeOpacity={1}
          >
            <Text style={dynamicStyles.modalTitle}>How many servings?</Text>
            <Text style={dynamicStyles.servingsSubtitle}>{selectedRecipe?.title}</Text>
            <View style={dynamicStyles.servingsRow}>
              <TouchableOpacity
                style={dynamicStyles.servingsButton}
                onPress={() => setPendingServings(Math.max(1, pendingServings - 1))}
              >
                <Text style={dynamicStyles.servingsButtonText}>−</Text>
              </TouchableOpacity>
              <Text style={dynamicStyles.servingsValue}>{pendingServings}</Text>
              <TouchableOpacity
                style={dynamicStyles.servingsButton}
                onPress={() => setPendingServings(Math.min(20, pendingServings + 1))}
              >
                <Text style={dynamicStyles.servingsButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={dynamicStyles.confirmButton}
              onPress={() => {
                if (selectedDayForRecipe !== null) {
                  addMealToDay(selectedDayForRecipe);
                } else {
                  // Fallback: close modal and reset
                  setShowServingsPicker(false);
                  setSelectedRecipe(null);
                }
              }}
            >
              <Text style={dynamicStyles.confirmButtonText}>Add to Plan</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={dynamicStyles.cancelButton}
              onPress={() => {
                setShowServingsPicker(false);
                setShowDayPicker(true);
              }}
            >
              <Text style={dynamicStyles.cancelText}>Back</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Recipe Picker Modal (when tapping empty day) */}
      <Modal
        visible={showRecipePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRecipePicker(false)}
      >
        <TouchableOpacity 
          style={dynamicStyles.modalOverlay}
          onPress={() => setShowRecipePicker(false)}
          activeOpacity={1}
        >
          <TouchableOpacity 
            style={dynamicStyles.modalContent}
            onPress={(e) => e.stopPropagation()}
            activeOpacity={1}
          >
            <Text style={dynamicStyles.modalTitle}>
              {selectedDayForRecipe !== null 
                ? `Add to ${weekPlan[selectedDayForRecipe]?.dayName}` 
                : 'Select a recipe'}
            </Text>
            <ScrollView style={{ maxHeight: 400 }}>
              {ALL_RECIPES.filter(r => r.available).map((recipe) => (
                <TouchableOpacity
                  key={recipe.id}
                  style={dynamicStyles.recipeOption}
                  onPress={() => addRecipeToSelectedDay(recipe)}
                >
                  <Text style={dynamicStyles.recipeOptionEmoji}>{recipe.emoji}</Text>
                  <View style={dynamicStyles.recipeOptionInfo}>
                    <Text style={dynamicStyles.recipeOptionName}>{recipe.title}</Text>
                    <Text style={dynamicStyles.recipeOptionMeta}>{recipe.timeDisplay} • {recipe.difficulty}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity 
              style={dynamicStyles.cancelButton}
              onPress={() => {
                setShowRecipePicker(false);
                setSelectedDayForRecipe(null);
              }}
            >
              <Text style={dynamicStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Move Meal Menu */}
      <Modal
        visible={showMoveMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMoveMenu(false)}
      >
        <TouchableOpacity 
          style={dynamicStyles.modalOverlay}
          onPress={() => setShowMoveMenu(false)}
          activeOpacity={1}
        >
          <View style={dynamicStyles.moveMenuContent}>
            <Text style={dynamicStyles.moveMenuTitle}>Move to...</Text>
            {mealToMove && weekPlan.map((day, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  dynamicStyles.moveOption,
                  idx === mealToMove.dayIndex && dynamicStyles.moveOptionDisabled
                ]}
                onPress={() => moveMeal(mealToMove.dayIndex, mealToMove.mealIndex, idx)}
                disabled={idx === mealToMove.dayIndex || day.meals.length >= 3}
              >
                <Text style={dynamicStyles.moveOptionEmoji}>
                  {idx === mealToMove.dayIndex ? '📍' : day.meals.length >= 3 ? '❌' : '📅'}
                </Text>
                <View style={dynamicStyles.moveOptionInfo}>
                  <Text style={[
                    dynamicStyles.moveOptionName,
                    (idx === mealToMove.dayIndex || day.meals.length >= 3) && dynamicStyles.moveOptionNameDisabled
                  ]}>
                    {day.dayName}
                  </Text>
                  <Text style={dynamicStyles.moveOptionDate}>{day.date}</Text>
                </View>
                {day.meals.length >= 3 && <Text style={dynamicStyles.moveOptionFull}>Full</Text>}
              </TouchableOpacity>
            ))}
            <TouchableOpacity 
              style={dynamicStyles.cancelButton}
              onPress={() => setShowMoveMenu(false)}
            >
              <Text style={dynamicStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Generate Shopping List */}
      <View style={dynamicStyles.footer}>
        <TouchableOpacity 
          style={dynamicStyles.shoppingButton}
          onPress={() => {
            // Build weekly plan with actual ingredients from recipes
            const allRecipes = weekPlan.flatMap((day) => 
              day.meals.map(meal => {
                // Look up recipe in ALL_RECIPES
                const recipeInfo = ALL_RECIPES.find(r => r.id === meal.recipeId);
                const recipeData = recipeInfo?.data;
                // Flatten all ingredients from all sections
                const allIngredients = recipeData?.ingredients 
                  ? Object.values(recipeData.ingredients).flat()
                  : [];
                
                const finalServings = meal.servings || recipeData?.data?.servings || 4;
                const defaultServings = recipeData?.data?.servings || 4;
                console.log(`Recipe ${meal.recipeName}: meal.servings=${meal.servings}, recipeDefault=${defaultServings}, using=${finalServings}`);
                return {
                  recipeId: meal.recipeId,
                  recipeName: meal.recipeName,
                  servings: finalServings,
                  defaultServings: defaultServings,
                  ingredients: allIngredients.map((ing: any) => ({
                    item: ing.item,
                    amount: typeof ing.amount === 'string' 
                      ? ing.amount 
                      : ing.amount?.toString() || 'as needed',
                    category: ing.category || 'other',
                  })),
                };
              })
            );
            
            router.push({
              pathname: '/(tabs)/grocery',
              params: { 
                weeklyPlan: JSON.stringify({ recipes: allRecipes })
              }
            });
          }}
        >
          <Text style={dynamicStyles.shoppingButtonText}>
            🛒 Generate Shopping List ({weekPlan.flatMap(d => d.meals).length} meals)
          </Text>
        </TouchableOpacity>
      </View>
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
    color: colors.neutral[900],
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: isMichelin ? colors.neutral[700] : colors.neutral[900],
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
  },
  addButtonEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: isMichelin ? colors.background?.secondary : '#FFF',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  dayCard: {
    backgroundColor: isMichelin ? colors.background?.secondary : '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    color: isMichelin ? colors.neutral[700] : colors.neutral[900],
  },
  dayDate: {
    fontSize: 14,
    color: '#87CEEB',
  },
  emptySlot: {
    backgroundColor: isMichelin ? colors.background?.tertiary : '#F5F5F5',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: isMichelin ? colors.neutral[700] : '#DDD',
  },
  emptySlotText: {
    fontSize: 14,
    color: isMichelin ? colors.neutral[500] : colors.neutral[500],
  },
  mealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isMichelin ? colors.background?.primary : colors.cream[50],
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#87CEEB40',
  },
  mealEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 15,
    fontWeight: '600',
    color: isMichelin ? colors.neutral[700] : colors.neutral[900],
  },
  mealTime: {
    fontSize: 12,
    color: '#87CEEB',
    marginTop: 2,
  },
  removeButton: {
    fontSize: 18,
    color: '#FF6B6B',
    padding: 8,
  },
  moveMenuContent: {
    backgroundColor: isMichelin ? colors.background?.primary : colors.cream[50],
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  moveMenuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.neutral[900],
    marginBottom: 16,
    textAlign: 'center',
  },
  moveOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isMichelin ? colors.background?.secondary : '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  moveOptionDisabled: {
    opacity: 0.5,
  },
  moveOptionEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  moveOptionInfo: {
    flex: 1,
  },
  moveOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  moveOptionNameDisabled: {
    color: isMichelin ? colors.neutral[500] : colors.neutral[500],
  },
  moveOptionDate: {
    fontSize: 13,
    color: '#87CEEB',
  },
  moveOptionFull: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: isMichelin ? colors.background?.primary : colors.cream[50],
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.neutral[900],
    marginBottom: 16,
    textAlign: 'center',
  },
  dayOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isMichelin ? colors.background?.secondary : '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  dayOptionEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  dayOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  dayOptionDate: {
    fontSize: 13,
    color: '#87CEEB',
  },
  recipeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isMichelin ? colors.background?.secondary : '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  recipeOptionEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  recipeOptionInfo: {
    flex: 1,
  },
  recipeOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  recipeOptionMeta: {
    fontSize: 13,
    color: '#87CEEB',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[700],
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    backgroundColor: isMichelin ? colors.background?.primary : colors.cream[50],
  },
  shoppingButton: {
    backgroundColor: '#FF8C42',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  shoppingButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: isMichelin ? colors.background?.secondary : '#FFF',
  },
  // Servings picker styles
  servingsSubtitle: {
    fontSize: 16,
    color: colors.neutral[700],
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  servingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 16,
  },
  servingsButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF8C42',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  servingsButtonText: {
    fontSize: 24,
    fontWeight: '700',
    color: isMichelin ? colors.background?.secondary : '#FFF',
  },
  servingsValue: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.neutral[900],
    minWidth: 60,
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: layout.screenGutter,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
    marginHorizontal: 20,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: isMichelin ? colors.background?.secondary : '#FFF',
  },
});
