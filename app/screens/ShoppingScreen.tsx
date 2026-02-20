import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useState, useEffect } from "react";
import { router, useLocalSearchParams } from 'expo-router';
import { ConsolidatedItem, consolidateShoppingList, getNeedToBuy, getShoppingStats } from "../utils/shopping";
import { getWeeklyPlan } from "../utils/weeklyPlan";
import { ALL_RECIPES } from "../data/recipes";
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/providers/ThemeProvider';
import { layout } from '../theme/spacing';
import { typography } from '@/theme';
import { getUnitSystem, UnitSystem } from "../utils/settings";

export default function ShoppingScreen() {
  const { colors } = useTheme();
  const { weeklyPlan: weeklyPlanParam } = useLocalSearchParams<{ weeklyPlan?: string }>();
  const weeklyPlan = weeklyPlanParam ? JSON.parse(weeklyPlanParam) : null;

  const [items, setItems] = useState<ConsolidatedItem[]>([]);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  const [recipesExpanded, setRecipesExpanded] = useState(false);
  const [activeRecipes, setActiveRecipes] = useState<any[]>([]);
  const [showBreakdown, setShowBreakdown] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const savedUnitSystem = await getUnitSystem();
      setUnitSystem(savedUnitSystem);

      if (weeklyPlan?.recipes) {
        setActiveRecipes(weeklyPlan.recipes);
        setItems(consolidateShoppingList(weeklyPlan.recipes));
      } else {
        const saved = await getWeeklyPlan();
        if (saved) {
          const recipes = saved.flatMap((day: any) =>
            day.meals.map((meal: any) => {
              const recipeData = ALL_RECIPES.find(r => r.id === meal.recipeId);
              const ingredients = recipeData?.data?.ingredients || {};
              const allIngredients = Object.values(ingredients).flat().map((ing: any) => ({
                item: ing.item,
                amount: ing.amount?.original || ing.amount?.value?.toString() || '',
                category: ing.category
              }));
              return {
                recipeId: meal.recipeId,
                recipeName: meal.recipeName,
                servings: meal.servings || recipeData?.data?.servings || 4,
                ingredients: allIngredients
              };
            })
          );
          setActiveRecipes(recipes);
          setItems(consolidateShoppingList(recipes));
        }
      }
    };
    load();
  }, [weeklyPlan]);

  const toggleChecked = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  };

  const toggleHasAtHome = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, hasAtHome: !i.hasAtHome, checked: false } : i));
  };

  const stats = getShoppingStats(items);
  const needToBuy = getNeedToBuy(items);

  const clearSelections = () => {
    setItems(prev => prev.map(i => ({ ...i, checked: false, hasAtHome: false })));
  };

  const byCategory = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ConsolidatedItem[]>);

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.title}>Weekly Shopping</Text>
      </View>

      <ScrollView style={styles.list}>
        <View style={styles.unitToggle}>
          {(['imperial', 'metric', 'baker'] as const).map(u => (
            <TouchableOpacity
              key={u}
              style={[styles.unitOption, unitSystem === u && styles.unitOptionActive]}
              onPress={() => setUnitSystem(u)}
            >
              <Text style={[styles.unitOptionText, unitSystem === u && styles.unitOptionTextActive]}>
                {u === 'imperial' ? 'US' : u.charAt(0).toUpperCase() + u.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.recipesHeader} onPress={() => setRecipesExpanded(v => !v)}>
          <Text style={styles.recipesHeaderText}>Recipes ({activeRecipes.length})</Text>
          <Text style={styles.recipesToggle}>{recipesExpanded ? '▼' : '▶'}</Text>
        </TouchableOpacity>

        {recipesExpanded && (
          <View style={styles.recipePills}>
            {activeRecipes.map((r, i) => (
              <View key={i} style={styles.recipePill}>
                <Text style={styles.recipePillText}>{r.recipeName}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.progressCard}>
          <TouchableOpacity style={styles.clearAllBtn} onPress={clearSelections}>
            <Text style={styles.clearAllText}>Clear all</Text>
          </TouchableOpacity>
          <View style={styles.progressRow}>
            <Text style={styles.progressText}>{needToBuy.length} items to buy</Text>
            <Text style={styles.progressPercent}>{Math.round(stats.progress * 100)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${stats.progress * 100}%` }]} />
          </View>
        </View>

        {Object.entries(byCategory).map(([category, catItems]) => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryHeader}>{category} ({catItems.length})</Text>
            {catItems.map(item => (
              <View
                key={item.id}
                style={[
                  styles.itemRow,
                  item.checked && styles.itemRowChecked,
                  item.hasAtHome && styles.itemRowHome,
                ]}
              >
                <TouchableOpacity
                  style={[styles.checkbox, item.checked && styles.checkboxChecked]}
                  onPress={() => toggleChecked(item.id)}
                >
                  {item.checked && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
                <View style={styles.itemContent}>
                  <Text style={[styles.itemName, item.checked && styles.itemNameDimmed]}>{item.item}</Text>
                  <Text style={styles.itemAmount}>{item.totalAmount}</Text>
                  <TouchableOpacity onPress={() => setShowBreakdown(showBreakdown === item.id ? null : item.id)}>
                    <Text style={styles.breakdownToggle}>
                      Used in {item.breakdown.length} recipe{item.breakdown.length > 1 ? 's' : ''} {showBreakdown === item.id ? '▲' : '▼'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={[styles.homeButton, item.hasAtHome && styles.homeButtonActive]}
                  onPress={() => toggleHasAtHome(item.id)}
                >
                  <Text style={styles.homeButtonText}>{item.hasAtHome ? '🏠' : '🏠'}</Text>
                </TouchableOpacity>
                {showBreakdown === item.id && (
                  <View style={styles.breakdown}>
                    {item.breakdown.map((use, idx) => (
                      <Text key={idx} style={styles.breakdownText}>{use.amount} for {use.recipeName}</Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        ))}

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.primary },
  header: { alignItems: 'center', padding: 16 },
  title: { ...typography.h2, color: colors.text.primary },
  list: { flex: 1, paddingHorizontal: layout.screenGutter },
  unitToggle: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  unitOption: { padding: 8, borderRadius: 12, backgroundColor: colors.surface.secondary },
  unitOptionActive: { backgroundColor: colors.accent.primary },
  unitOptionText: { ...typography.caption, color: colors.text.secondary },
  unitOptionTextActive: { color: colors.text.inverse },
  recipesHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  recipesHeaderText: { ...typography.bodyMedium, color: colors.text.secondary },
  recipesToggle: { ...typography.caption, color: colors.text.muted },
  recipePills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  recipePill: { backgroundColor: colors.surface.secondary, padding: 8, borderRadius: 12 },
  recipePillText: { ...typography.caption, color: colors.text.primary },
  progressCard: { marginBottom: 16 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressText: { ...typography.caption, color: colors.text.muted },
  progressPercent: { ...typography.h3, color: colors.accent.primary },
  progressBar: { height: 4, backgroundColor: colors.border.subtle, borderRadius: 2 },
  progressFill: { height: '100%', backgroundColor: colors.accent.primary },
  clearAllBtn: {
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  clearAllText: {
    ...typography.caption,
    color: colors.text.muted,
  },
  categorySection: { marginBottom: 16 },
  categoryHeader: { ...typography.h3, color: colors.text.primary },
  itemName: { ...typography.bodyMedium, color: colors.text.primary },

  /* Re-added interaction styles */
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.secondary,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  itemRowChecked: {
    backgroundColor: colors.accent.primary + '15',
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  itemRowHome: {
    backgroundColor: colors.accent.primary + '25',
    borderWidth: 1,
    borderColor: colors.accent.primary,
  },
  itemNameDimmed: {
    textDecorationLine: 'line-through',
    color: colors.text.muted,
  },
  itemContent: {
    flex: 1,
    marginHorizontal: 12,
  },
  itemAmount: {
    ...typography.caption,
    color: colors.accent.primary,
    marginTop: 2,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  checkmark: {
    ...typography.bodyMedium,
    color: colors.text.inverse,
  },
  homeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeButtonActive: {
    backgroundColor: colors.accent.primary + '20',
    borderColor: colors.accent.primary,
  },
  homeButtonText: {
    ...typography.caption,
    color: colors.text.primary,
  },
  breakdownToggle: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: 4,
  },
  breakdown: {
    marginTop: 8,
    paddingLeft: 8,
  },
  breakdownText: {
    ...typography.caption,
    color: colors.text.muted,
  }
});