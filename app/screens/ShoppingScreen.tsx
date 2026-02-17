import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useState, useEffect } from "react";
import { router, useLocalSearchParams } from 'expo-router';
import { ConsolidatedItem, consolidateShoppingList, getNeedToBuy, getShoppingStats } from "../utils/shopping";
import { getWeeklyPlan } from "../utils/weeklyPlan";
import { ALL_RECIPES } from "../data/recipes";
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/providers/ThemeProvider';
import { getUnitSystem, UnitSystem } from "../utils/settings";

// Fallback mock data if no plan passed
const MOCK_WEEKLY_PLAN = {
  recipes: [
    {
      recipeId: "chicken-curry",
      recipeName: "Chicken Curry with Roti",
      servings: 4,
      ingredients: [
        { item: "Chicken thighs", amount: "2 lbs", category: "curry" as const },
        { item: "Onion", amount: "1 large", category: "curry" as const },
        { item: "Garlic", amount: "4 cloves", category: "curry" as const },
        { item: "Curry powder", amount: "2 tbsp", category: "curry" as const },
        { item: "Coconut milk", amount: "3 cups", category: "curry" as const },
        { item: "Potatoes", amount: "3 medium", category: "curry" as const },
        { item: "All-purpose flour", amount: "3 cups", category: "roti" as const },
        { item: "Butter", amount: "3 tbsp", category: "roti" as const },
      ]
    },
    {
      recipeId: "tacos",
      recipeName: "Street Tacos",
      servings: 4,
      ingredients: [
        { item: "Ground beef", amount: "1 lb", category: "main" as const },
        { item: "Onion", amount: "1 medium", category: "main" as const },
        { item: "Garlic", amount: "2 cloves", category: "main" as const },
        { item: "Tortillas", amount: "12 small", category: "main" as const },
        { item: "Cilantro", amount: "1 bunch", category: "side" as const },
      ]
    }
  ]
};

const CATEGORY_EMOJIS: Record<string, string> = {
  produce: '🥬',
  meat: '🥩',
  dairy: '🧈',
  pantry: '🌾',
  spices: '🌶️',
  other: '📦',
};

const CATEGORY_NAMES: Record<string, string> = {
  produce: 'Produce',
  meat: 'Meat & Protein',
  dairy: 'Dairy',
  pantry: 'Pantry',
  spices: 'Spices',
  other: 'Other',
};

export default function ShoppingScreen() {
  const { colors, isMichelin } = useTheme();
  const { weeklyPlan: weeklyPlanParam } = useLocalSearchParams<{ weeklyPlan?: string }>();
  const weeklyPlan = weeklyPlanParam ? JSON.parse(weeklyPlanParam) : null;
  const [items, setItems] = useState<ConsolidatedItem[]>([]);
  const [showBreakdown, setShowBreakdown] = useState<string | null>(null);
  const [activeRecipes, setActiveRecipes] = useState<any[]>(weeklyPlan?.recipes || MOCK_WEEKLY_PLAN.recipes);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric'); // Will load from profile settings
  const [recipesExpanded, setRecipesExpanded] = useState(false);
  const [editingRecipeServings, setEditingRecipeServings] = useState<string | null>(null);

  useEffect(() => {
    const loadPlan = async () => {
      // Load user's preferred unit system from profile settings
      const savedUnitSystem = await getUnitSystem();
      setUnitSystem(savedUnitSystem);
      
      // First try passed navigation params, then AsyncStorage, then mock
      if (weeklyPlan?.recipes) {
        setActiveRecipes(weeklyPlan.recipes);
        const consolidated = consolidateShoppingList(weeklyPlan.recipes);
        setItems(consolidated);
      } else {
        const saved = await getWeeklyPlan();
        if (saved) {
          // Convert saved plan to recipes format with ingredients
          const recipes = saved.flatMap((day: any) => 
            day.meals.map((meal: any) => {
              // Look up recipe to get ingredients
              const recipeData = ALL_RECIPES.find(r => r.id === meal.recipeId);
              const ingredients = recipeData?.data?.ingredients || {};
              
              // Flatten all ingredient sections
              const allIngredients = Object.values(ingredients).flat().map((ing: any) => ({
                item: ing.item,
                amount: ing.amount?.original || ing.amount?.value?.toString() || '',
                category: ing.category
              }));
              
              return {
                recipeId: meal.recipeId,
                recipeName: meal.recipeName,
                servings: meal.servings || recipeData?.data?.servings || 4,
                defaultServings: recipeData?.data?.servings || 4,
                ingredients: allIngredients
              };
            })
          );
          setActiveRecipes(recipes);
          const consolidated = consolidateShoppingList(recipes);
          setItems(consolidated);
        } else {
          // Fall back to mock
          setActiveRecipes(MOCK_WEEKLY_PLAN.recipes);
          const consolidated = consolidateShoppingList(MOCK_WEEKLY_PLAN.recipes);
          setItems(consolidated);
        }
      }
    };
    loadPlan();
  }, [weeklyPlan]);

  // Convert amount string to user's unit system
  const convertToSystem = (amountStr: string): string => {
    // Simple conversions for common units
    if (unitSystem === 'metric') {
      if (amountStr.includes('lb') || amountStr.includes('lbs')) {
        const lbs = parseFloat(amountStr);
        if (!isNaN(lbs)) return `${(lbs * 0.453592).toFixed(1)} kg`;
      }
      if (amountStr.includes('oz')) {
        const oz = parseFloat(amountStr);
        if (!isNaN(oz)) return `${(oz * 28.3495).toFixed(0)} g`;
      }
      if (amountStr.includes('fl oz')) {
        const floz = parseFloat(amountStr);
        if (!isNaN(floz)) return `${(floz * 29.5735).toFixed(0)} ml`;
      }
      if (amountStr.includes('cup') || amountStr.includes('cups')) {
        const cups = parseFloat(amountStr);
        if (!isNaN(cups)) return `${(cups * 236.588).toFixed(0)} ml`;
      }
    } else {
      if (amountStr.includes('kg')) {
        const kg = parseFloat(amountStr);
        if (!isNaN(kg)) return `${(kg * 2.20462).toFixed(1)} lbs`;
      }
      if (amountStr.includes('g') && !amountStr.includes('ml')) {
        const g = parseFloat(amountStr);
        if (!isNaN(g) && g >= 28) return `${(g / 28.3495).toFixed(1)} oz`;
      }
      if (amountStr.includes('ml')) {
        const ml = parseFloat(amountStr);
        if (!isNaN(ml) && ml >= 30) return `${(ml / 29.5735).toFixed(0)} fl oz`;
      }
    }
    return amountStr; // Return original if no conversion needed
  };

  const updateRecipeServings = (recipeId: string, newServings: number) => {
    const updated = activeRecipes.map(r => 
      r.recipeId === recipeId ? { ...r, servings: newServings } : r
    );
    setActiveRecipes(updated);
    const consolidated = consolidateShoppingList(updated);
    setItems(consolidated);
    setEditingRecipeServings(null);
  };

  const removeRecipe = (recipeId: string) => {
    const updated = activeRecipes.filter(r => r.recipeId !== recipeId);
    setActiveRecipes(updated);
    const consolidated = consolidateShoppingList(updated);
    setItems(consolidated);
  };

  const toggleChecked = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const toggleHasAtHome = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, hasAtHome: !item.hasAtHome, checked: false } : item
    ));
  };

  const stats = getShoppingStats(items);
  const needToBuy = getNeedToBuy(items);
  
  // Group by category
  const byCategory = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ConsolidatedItem[]>);

  const dynamicStyles = createStyles(colors, isMichelin);

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <StatusBar style={isMichelin ? 'light' : 'dark'} />
      
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.title}>Weekly Shopping</Text>
        
        {/* Unit System Toggle */}
        <View style={dynamicStyles.unitToggle}>
          <TouchableOpacity
            style={[dynamicStyles.unitOption, unitSystem === 'imperial' && dynamicStyles.unitOptionActive]}
            onPress={() => setUnitSystem('imperial')}
          >
            <Text style={[dynamicStyles.unitOptionText, unitSystem === 'imperial' && dynamicStyles.unitOptionTextActive]}>US</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[dynamicStyles.unitOption, unitSystem === 'metric' && dynamicStyles.unitOptionActive]}
            onPress={() => setUnitSystem('metric')}
          >
            <Text style={[dynamicStyles.unitOptionText, unitSystem === 'metric' && dynamicStyles.unitOptionTextActive]}>Metric</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[dynamicStyles.unitOption, unitSystem === 'baker' && dynamicStyles.unitOptionActive]}
            onPress={() => setUnitSystem('baker')}
          >
            <Text style={[dynamicStyles.unitOptionText, unitSystem === 'baker' && dynamicStyles.unitOptionTextActive]}>Baker</Text>
          </TouchableOpacity>
        </View>
        
        {/* Collapsible Recipes */}
        <TouchableOpacity 
          style={dynamicStyles.recipesHeader}
          onPress={() => setRecipesExpanded(!recipesExpanded)}
        >
          <Text style={dynamicStyles.recipesHeaderText}>
            Recipes ({activeRecipes.length})
          </Text>
          <Text style={dynamicStyles.recipesToggle}>
            {recipesExpanded ? '▼' : '▶'}
          </Text>
        </TouchableOpacity>
        
        {recipesExpanded && (
          <View style={dynamicStyles.recipePills}>
            {activeRecipes.map((r: any, index: number) => (
              <View key={`${r.recipeId}-${index}`} style={dynamicStyles.recipePillContainer}>
                {editingRecipeServings === r.recipeId ? (
                  <View style={dynamicStyles.servingsEditRow}>
                    <TouchableOpacity 
                      style={dynamicStyles.servingsEditButton}
                      onPress={() => updateRecipeServings(r.recipeId, Math.max(1, r.servings - 1))}
                    >
                      <Text style={dynamicStyles.servingsEditText}>−</Text>
                    </TouchableOpacity>
                    <Text style={dynamicStyles.servingsEditValue}>{r.servings}</Text>
                    <TouchableOpacity 
                      style={dynamicStyles.servingsEditButton}
                      onPress={() => updateRecipeServings(r.recipeId, Math.min(20, r.servings + 1))}
                    >
                      <Text style={dynamicStyles.servingsEditText}>+</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={dynamicStyles.servingsDoneButton}
                      onPress={() => setEditingRecipeServings(null)}
                    >
                      <Text style={dynamicStyles.servingsDoneText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={dynamicStyles.recipePill}
                    onLongPress={() => setEditingRecipeServings(r.recipeId)}
                    onPress={() => removeRecipe(r.recipeId)}
                    activeOpacity={0.7}
                  >
                    <Text style={dynamicStyles.recipePillText}>{r.recipeName}</Text>
                    <Text style={dynamicStyles.servingsBadge}>Serves {r.servings || 4}</Text>
                    <Text style={dynamicStyles.removePillText}> ✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Progress */}
      <View style={dynamicStyles.progressCard}>
        <View style={dynamicStyles.progressRow}>
          <Text style={dynamicStyles.progressText}>{needToBuy.length} items to buy</Text>
          <Text style={dynamicStyles.progressPercent}>{Math.round(stats.progress * 100)}%</Text>
        </View>
        <View style={dynamicStyles.progressBar}>
          <View style={[dynamicStyles.progressFill, { width: `${stats.progress * 100}%` }]} />
        </View>
      </View>

      <ScrollView style={dynamicStyles.list}>
        {Object.entries(byCategory).map(([category, catItems]) => (
          <View key={category} style={dynamicStyles.categorySection}>
            <Text style={dynamicStyles.categoryHeader}>
              {CATEGORY_EMOJIS[category]} {CATEGORY_NAMES[category]}
              <Text style={dynamicStyles.categoryCount}> ({catItems.length})</Text>
            </Text>
            
            {catItems.map(item => (
              <View key={item.id}>
                <View style={[
                  dynamicStyles.itemRow,
                  item.hasAtHome && dynamicStyles.itemRowHome,
                  item.checked && dynamicStyles.itemRowChecked
                ]}>
                  {/* Checkbox */}
                  <TouchableOpacity 
                    style={[dynamicStyles.checkbox, item.checked && dynamicStyles.checkboxChecked]}
                    onPress={() => toggleChecked(item.id)}
                  >
                    {item.checked && <Text style={dynamicStyles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                  
                  <View style={dynamicStyles.itemContent}>
                    <Text style={[
                      dynamicStyles.itemName,
                      (item.checked || item.hasAtHome) && dynamicStyles.itemNameDimmed
                    ]}>
                      {item.item}
                    </Text>
                    <Text style={dynamicStyles.itemAmount}>{convertToSystem(item.totalAmount)}</Text>
                    
                    {/* Show which recipes need this */}
                    <TouchableOpacity onPress={() => setShowBreakdown(showBreakdown === item.id ? null : item.id)}>
                      <Text style={dynamicStyles.breakdownToggle}>
                        Used in {item.breakdown.length} recipe{item.breakdown.length > 1 ? 's' : ''} 
                        {showBreakdown === item.id ? '▲' : '▼'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  
                  {/* Have at home toggle */}
                  <TouchableOpacity 
                    style={[dynamicStyles.homeButton, item.hasAtHome && dynamicStyles.homeButtonActive]}
                    onPress={() => toggleHasAtHome(item.id)}
                  >
                    <Text style={dynamicStyles.homeButtonText}>
                      {item.hasAtHome ? '🏠' : '🛒'}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                {/* Breakdown by recipe */}
                {showBreakdown === item.id && (
                  <View style={dynamicStyles.breakdown}>
                    {item.breakdown.map((use, idx) => (
                      <View key={idx} style={dynamicStyles.breakdownRow}>
                        <Text style={dynamicStyles.breakdownBullet}>•</Text>
                        <Text style={dynamicStyles.breakdownText}>
                          {use.amount} for {use.recipeName}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        ))}
        
        <View style={{ height: 100 }} />
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
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.neutral[900],
    marginBottom: 12,
  },
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: isMichelin ? colors.background?.secondary : '#FFF',
    borderRadius: 20,
    padding: 4,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  unitOption: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  unitOptionActive: {
    backgroundColor: colors.primary[500],
  },
  unitOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutral[700],
  },
  unitOptionTextActive: {
    color: '#FFF',
  },
  recipesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  recipesHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[700],
  },
  recipesToggle: {
    fontSize: 12,
    color: colors.neutral[500],
  },
  recipePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  recipePill: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  recipePillText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  removePillText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  progressCard: {
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: isMichelin ? colors.background?.secondary : '#FFF',
    borderRadius: 16,
    padding: 16,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary[500],
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.neutral[300],
    borderRadius: 4,
  },
  progressFill: {
    height: 8,
    backgroundColor: colors.success,
    borderRadius: 4,
  },
  list: {
    flex: 1,
    paddingHorizontal: 24,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: 12,
    paddingVertical: 8,
  },
  categoryCount: {
    color: colors.primary[500],
    fontWeight: '400',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isMichelin ? colors.background?.secondary : '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  itemRowHome: {
    backgroundColor: colors.success + '20',
    opacity: 0.7,
  },
  itemRowChecked: {
    backgroundColor: colors.neutral[300],
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkmark: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  itemNameDimmed: {
    textDecorationLine: 'line-through',
    color: colors.neutral[500],
  },
  itemAmount: {
    fontSize: 13,
    color: colors.primary[500],
    marginTop: 2,
  },
  breakdownToggle: {
    fontSize: 12,
    color: colors.primary[500],
    marginTop: 4,
  },
  homeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: isMichelin ? colors.background?.tertiary : colors.cream[100],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.neutral[300],
  },
  homeButtonActive: {
    backgroundColor: colors.success + '20',
    borderColor: colors.success,
  },
  homeButtonText: {
    fontSize: 20,
  },
  breakdown: {
    backgroundColor: isMichelin ? colors.background?.tertiary : colors.cream[100],
    borderRadius: 8,
    padding: 12,
    marginLeft: 40,
    marginBottom: 12,
    marginTop: -4,
  },
  breakdownRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  breakdownBullet: {
    color: colors.primary[500],
    marginRight: 8,
  },
  breakdownText: {
    fontSize: 13,
    color: colors.neutral[700],
  },
  recipePillContainer: {
    marginRight: 8,
    marginBottom: 8,
  },
  servingsBadge: {
    fontSize: 11,
    color: colors.primary[400],
    fontWeight: '600',
    marginLeft: 4,
  },
  servingsEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isMichelin ? colors.background?.tertiary : colors.cream[100],
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  servingsEditButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  servingsEditText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '700',
  },
  servingsEditValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral[900],
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  servingsDoneButton: {
    backgroundColor: colors.success,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  servingsDoneText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '600',
  },
});
