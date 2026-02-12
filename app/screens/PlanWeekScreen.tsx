import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Modal } from "react-native";
import { useState, useEffect } from "react";
import { StatusBar } from 'expo-status-bar';
import { ALL_RECIPES, beefRendangRecipe, chickenCurryRecipe, freshPastaRecipe, sourdoughRecipe } from '../data/recipes';
import { saveWeeklyPlan, getWeeklyPlan } from '../utils/weeklyPlan';

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

export default function PlanWeekScreen({ navigation, route }: any) {
  const [weekPlan, setWeekPlan] = useState<DayPlan[]>(generateWeekDays());
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [showRecipePicker, setShowRecipePicker] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [selectedDayForRecipe, setSelectedDayForRecipe] = useState<number | null>(null);
  const [mealToMove, setMealToMove] = useState<{ dayIndex: number; mealIndex: number } | null>(null);

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
    if (route.params?.selectedRecipe) {
      setSelectedRecipe(route.params.selectedRecipe);
      setShowDayPicker(true);
      // Clear the param so it doesn't re-trigger
      navigation.setParams({ selectedRecipe: null });
    }
  }, [route.params?.selectedRecipe]);

  // Handle add to plan from RecipeScreen
  useEffect(() => {
    if (route.params?.addRecipe) {
      setSelectedRecipe(route.params.addRecipe);
      setShowDayPicker(true);
      // Clear the param so it doesn't re-trigger
      navigation.setParams({ addRecipe: null });
    }
  }, [route.params?.addRecipe]);

  // Auto-save weekly plan when it changes
  useEffect(() => {
    saveWeeklyPlan(weekPlan);
  }, [weekPlan]);

  // Add recipe to a specific day
  const addMealToDay = (dayIndex: number) => {
    if (!selectedRecipe) return;
    
    const newPlan = [...weekPlan];
    newPlan[dayIndex].meals.push({
      recipeId: selectedRecipe.id,
      recipeName: selectedRecipe.title,
      emoji: selectedRecipe.emoji,
      serveTime: '18:00',
    });
    setWeekPlan(newPlan);
    setSelectedRecipe(null);
    setShowDayPicker(false);
  };

  // Add a recipe to selected day (from empty slot tap)
  const addRecipeToSelectedDay = (recipe: any) => {
    if (selectedDayForRecipe === null) return;
    
    const newPlan = [...weekPlan];
    newPlan[selectedDayForRecipe].meals.push({
      recipeId: recipe.id,
      recipeName: recipe.title,
      emoji: recipe.emoji,
      serveTime: '18:00',
    });
    setWeekPlan(newPlan);
    setShowRecipePicker(false);
    setSelectedDayForRecipe(null);
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
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🗓️ Plan This Week</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Add Recipe CTA */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('RecipeLibrary', { selectingForPlan: true })}
      >
        <Text style={styles.addButtonEmoji}>➕</Text>
        <Text style={styles.addButtonText}>Add Recipe to Plan</Text>
      </TouchableOpacity>

      {/* Week View */}
      <ScrollView style={styles.scrollView}>
        {weekPlan.map((day, dayIndex) => (
          <View key={dayIndex} style={styles.dayCard}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayName}>{day.dayName}</Text>
              <Text style={styles.dayDate}>{day.date}</Text>
            </View>
            
            {/* Meals (up to 3) */}
            {day.meals.map((meal, mealIndex) => (
              <TouchableOpacity 
                key={mealIndex} 
                style={styles.mealCard}
                onLongPress={() => {
                  setMealToMove({ dayIndex, mealIndex });
                  setShowMoveMenu(true);
                }}
                delayLongPress={500}
              >
                <Text style={styles.mealEmoji}>{meal.emoji}</Text>
                <View style={styles.mealInfo}>
                  <Text style={styles.mealName}>{meal.recipeName}</Text>
                  <Text style={styles.mealTime}>
                    Serve at {meal.serveTime}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => removeMeal(dayIndex, mealIndex)}>
                  <Text style={styles.removeButton}>✕</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
            
            {/* Add another meal slot (if < 3 meals) */}
            {day.meals.length < 3 && (
              <TouchableOpacity 
                style={[styles.emptySlot, day.meals.length > 0 && styles.emptySlotCompact]}
                onPress={() => {
                  setSelectedDayForRecipe(dayIndex);
                  setShowRecipePicker(true);
                }}
              >
                <Text style={styles.emptySlotText}>
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
          style={styles.modalOverlay}
          onPress={() => setShowDayPicker(false)}
          activeOpacity={1}
        >
          <TouchableOpacity 
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
            activeOpacity={1}
          >
            <Text style={styles.modalTitle}>Add to which day?</Text>
            {weekPlan.map((day, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.dayOption}
                onPress={() => addMealToDay(idx)}
              >
                <Text style={styles.dayOptionEmoji}>📅</Text>
                <View>
                  <Text style={styles.dayOptionName}>{day.dayName}</Text>
                  <Text style={styles.dayOptionDate}>{day.date}</Text>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowDayPicker(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
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
          style={styles.modalOverlay}
          onPress={() => setShowRecipePicker(false)}
          activeOpacity={1}
        >
          <TouchableOpacity 
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
            activeOpacity={1}
          >
            <Text style={styles.modalTitle}>
              {selectedDayForRecipe !== null 
                ? `Add to ${weekPlan[selectedDayForRecipe]?.dayName}` 
                : 'Select a recipe'}
            </Text>
            <ScrollView style={{ maxHeight: 400 }}>
              {ALL_RECIPES.filter(r => r.available).map((recipe) => (
                <TouchableOpacity
                  key={recipe.id}
                  style={styles.recipeOption}
                  onPress={() => addRecipeToSelectedDay(recipe)}
                >
                  <Text style={styles.recipeOptionEmoji}>{recipe.emoji}</Text>
                  <View style={styles.recipeOptionInfo}>
                    <Text style={styles.recipeOptionName}>{recipe.title}</Text>
                    <Text style={styles.recipeOptionMeta}>{recipe.timeDisplay} • {recipe.difficulty}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => {
                setShowRecipePicker(false);
                setSelectedDayForRecipe(null);
              }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
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
          style={styles.modalOverlay}
          onPress={() => setShowMoveMenu(false)}
          activeOpacity={1}
        >
          <View style={styles.moveMenuContent}>
            <Text style={styles.moveMenuTitle}>Move to...</Text>
            {mealToMove && weekPlan.map((day, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.moveOption,
                  idx === mealToMove.dayIndex && styles.moveOptionDisabled
                ]}
                onPress={() => moveMeal(mealToMove.dayIndex, mealToMove.mealIndex, idx)}
                disabled={idx === mealToMove.dayIndex || day.meals.length >= 3}
              >
                <Text style={styles.moveOptionEmoji}>
                  {idx === mealToMove.dayIndex ? '📍' : day.meals.length >= 3 ? '❌' : '📅'}
                </Text>
                <View style={styles.moveOptionInfo}>
                  <Text style={[
                    styles.moveOptionName,
                    (idx === mealToMove.dayIndex || day.meals.length >= 3) && styles.moveOptionNameDisabled
                  ]}>
                    {day.dayName}
                  </Text>
                  <Text style={styles.moveOptionDate}>{day.date}</Text>
                </View>
                {day.meals.length >= 3 && <Text style={styles.moveOptionFull}>Full</Text>}
              </TouchableOpacity>
            ))}
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowMoveMenu(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Generate Shopping List */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.shoppingButton}
          onPress={() => {
            // Build weekly plan with actual ingredients from recipes
            const allRecipes = weekPlan.flatMap((day) => 
              day.meals.map(meal => {
                const recipeData = RECIPE_DATA[meal.recipeId];
                // Flatten all ingredients from all sections
                const allIngredients = recipeData 
                  ? Object.values(recipeData.ingredients).flat()
                  : [];
                
                return {
                  recipeId: meal.recipeId,
                  recipeName: meal.recipeName,
                  servings: 4,
                  ingredients: allIngredients.map((ing: any) => ({
                    item: ing.item,
                    amount: ing.amount?.value !== undefined 
                      ? `${ing.amount.value} ${ing.amount.unit}` 
                      : ing.amount?.toString() || 'as needed',
                    category: ing.category || 'other',
                  })),
                };
              })
            );
            
            navigation.navigate('Shopping', { 
              weeklyPlan: { recipes: allRecipes }
            });
          }}
        >
          <Text style={styles.shoppingButtonText}>
            🛒 Generate Shopping List ({weekPlan.flatMap(d => d.meals).length} meals)
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E7',
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
    color: '#FFF',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  dayCard: {
    backgroundColor: '#FFF',
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
    color: '#5D4E37',
  },
  dayDate: {
    fontSize: 14,
    color: '#87CEEB',
  },
  emptySlot: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#DDD',
  },
  emptySlotText: {
    fontSize: 14,
    color: '#999',
  },
  mealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E7',
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
    color: '#5D4E37',
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
    backgroundColor: '#FFF8E7',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  moveMenuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5D4E37',
    marginBottom: 16,
    textAlign: 'center',
  },
  moveOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
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
    color: '#5D4E37',
  },
  moveOptionNameDisabled: {
    color: '#999',
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
    backgroundColor: '#FFF8E7',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5D4E37',
    marginBottom: 16,
    textAlign: 'center',
  },
  dayOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
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
    color: '#5D4E37',
  },
  dayOptionDate: {
    fontSize: 13,
    color: '#87CEEB',
  },
  recipeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
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
    color: '#5D4E37',
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
    color: '#666',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFF8E7',
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
    color: '#FFF',
  },
});
