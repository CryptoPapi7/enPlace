import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useState, useEffect } from "react";
import { ConsolidatedItem, consolidateShoppingList, getNeedToBuy, getShoppingStats } from "../utils/shopping";
import { getWeeklyPlan } from "../utils/weeklyPlan";
import { ALL_RECIPES } from "../data/recipes";
import { StatusBar } from 'expo-status-bar';

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

export default function ShoppingScreen({ navigation, route }: any) {
  const weeklyPlan = route.params?.weeklyPlan;
  const [items, setItems] = useState<ConsolidatedItem[]>([]);
  const [showBreakdown, setShowBreakdown] = useState<string | null>(null);
  const [activeRecipes, setActiveRecipes] = useState<any[]>(weeklyPlan?.recipes || MOCK_WEEKLY_PLAN.recipes);
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('imperial'); // Default: US shopping
  const [recipesExpanded, setRecipesExpanded] = useState(true);

  useEffect(() => {
    const loadPlan = async () => {
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
                servings: 4, // Default
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Weekly Shopping</Text>
        
        {/* Unit System Toggle */}
        <View style={styles.unitToggle}>
          <TouchableOpacity
            style={[styles.unitOption, unitSystem === 'imperial' && styles.unitOptionActive]}
            onPress={() => setUnitSystem('imperial')}
          >
            <Text style={[styles.unitOptionText, unitSystem === 'imperial' && styles.unitOptionTextActive]}>US</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.unitOption, unitSystem === 'metric' && styles.unitOptionActive]}
            onPress={() => setUnitSystem('metric')}
          >
            <Text style={[styles.unitOptionText, unitSystem === 'metric' && styles.unitOptionTextActive]}>Metric</Text>
          </TouchableOpacity>
        </View>
        
        {/* Collapsible Recipes */}
        <TouchableOpacity 
          style={styles.recipesHeader}
          onPress={() => setRecipesExpanded(!recipesExpanded)}
        >
          <Text style={styles.recipesHeaderText}>
            Recipes ({activeRecipes.length})
          </Text>
          <Text style={styles.recipesToggle}>
            {recipesExpanded ? '▼' : '▶'}
          </Text>
        </TouchableOpacity>
        
        {recipesExpanded && (
          <View style={styles.recipePills}>
            {activeRecipes.map((r: any, index: number) => (
              <TouchableOpacity 
                key={`${r.recipeId}-${index}`} 
                style={styles.recipePill}
                onPress={() => removeRecipe(r.recipeId)}
                activeOpacity={0.7}
              >
                <Text style={styles.recipePillText}>{r.recipeName}</Text>
                <Text style={styles.removePillText}> ✕</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Progress */}
      <View style={styles.progressCard}>
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>{needToBuy.length} items to buy</Text>
          <Text style={styles.progressPercent}>{Math.round(stats.progress * 100)}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${stats.progress * 100}%` }]} />
        </View>
      </View>

      <ScrollView style={styles.list}>
        {Object.entries(byCategory).map(([category, catItems]) => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryHeader}>
              {CATEGORY_EMOJIS[category]} {CATEGORY_NAMES[category]}
              <Text style={styles.categoryCount}> ({catItems.length})</Text>
            </Text>
            
            {catItems.map(item => (
              <View key={item.id}>
                <View style={[
                  styles.itemRow,
                  item.hasAtHome && styles.itemRowHome,
                  item.checked && styles.itemRowChecked
                ]}>
                  {/* Checkbox */}
                  <TouchableOpacity 
                    style={[styles.checkbox, item.checked && styles.checkboxChecked]}
                    onPress={() => toggleChecked(item.id)}
                  >
                    {item.checked && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                  
                  <View style={styles.itemContent}>
                    <Text style={[
                      styles.itemName,
                      (item.checked || item.hasAtHome) && styles.itemNameDimmed
                    ]}>
                      {item.item}
                    </Text>
                    <Text style={styles.itemAmount}>{convertToSystem(item.totalAmount)}</Text>
                    
                    {/* Show which recipes need this */}
                    <TouchableOpacity onPress={() => setShowBreakdown(showBreakdown === item.id ? null : item.id)}>
                      <Text style={styles.breakdownToggle}>
                        Used in {item.breakdown.length} recipe{item.breakdown.length > 1 ? 's' : ''} 
                        {showBreakdown === item.id ? '▲' : '▼'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  
                  {/* Have at home toggle */}
                  <TouchableOpacity 
                    style={[styles.homeButton, item.hasAtHome && styles.homeButtonActive]}
                    onPress={() => toggleHasAtHome(item.id)}
                  >
                    <Text style={styles.homeButtonText}>
                      {item.hasAtHome ? '🏠' : '🛒'}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                {/* Breakdown by recipe */}
                {showBreakdown === item.id && (
                  <View style={styles.breakdown}>
                    {item.breakdown.map((use, idx) => (
                      <View key={idx} style={styles.breakdownRow}>
                        <Text style={styles.breakdownBullet}>•</Text>
                        <Text style={styles.breakdownText}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E7',
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#5D4E37',
    marginBottom: 12,
  },
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 4,
    marginBottom: 12,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  unitOption: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  unitOptionActive: {
    backgroundColor: '#FF8C42',
  },
  unitOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
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
    color: '#666',
  },
  recipesToggle: {
    fontSize: 12,
    color: '#999',
  },
  recipesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  recipesHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5D4E37',
  },
  recipesToggle: {
    fontSize: 14,
    color: '#87CEEB',
  },
  recipePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  recipePill: {
    backgroundColor: '#FF8C42',
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
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    padding: 4,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  unitOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  unitOptionActive: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unitOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  unitOptionTextActive: {
    color: '#5D4E37',
    fontWeight: '600',
  },
  progressCard: {
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: '#FFF',
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
    color: '#5D4E37',
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF8C42',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  progressFill: {
    height: 8,
    backgroundColor: '#4CAF50',
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
    color: '#5D4E37',
    marginBottom: 12,
    paddingVertical: 8,
  },
  categoryCount: {
    color: '#87CEEB',
    fontWeight: '400',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  itemRowHome: {
    backgroundColor: '#E8F5E9',
    opacity: 0.7,
  },
  itemRowChecked: {
    backgroundColor: '#F5F5F5',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#87CEEB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
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
    color: '#5D4E37',
  },
  itemNameDimmed: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  itemAmount: {
    fontSize: 13,
    color: '#87CEEB',
    marginTop: 2,
  },
  breakdownToggle: {
    fontSize: 12,
    color: '#FF8C42',
    marginTop: 4,
  },
  homeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF8E7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#DDD',
  },
  homeButtonActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  homeButtonText: {
    fontSize: 20,
  },
  breakdown: {
    backgroundColor: '#FFF8E7',
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
    color: '#87CEEB',
    marginRight: 8,
  },
  breakdownText: {
    fontSize: 13,
    color: '#666',
  },
});
