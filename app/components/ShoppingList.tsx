import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useState } from "react";
import { useTheme } from '@/providers/ThemeProvider';
import { typography } from '../theme';

interface ShoppingItem {
  id: string;
  item: string;
  amount: string;
  recipeId: string;
  recipeName: string;
  checked: boolean;
  hasAtHome: boolean; // user marked they already have this
}

interface ShoppingListProps {
  items: ShoppingItem[];
  onToggleChecked: (id: string) => void;
  onToggleHasAtHome: (id: string) => void;
  onClearCompleted: () => void;
}

export function ShoppingList({ items, onToggleChecked, onToggleHasAtHome, onClearCompleted }: ShoppingListProps) {
  const { colors } = useTheme();
  const [showAll, setShowAll] = useState(true);
  
  const needToBuy = items.filter(i => !i.hasAtHome);
  const atHome = items.filter(i => i.hasAtHome);
  const displayItems = showAll ? items : needToBuy;
  
  // Group by recipe
  const grouped = displayItems.reduce((acc, item) => {
    if (!acc[item.recipeName]) acc[item.recipeName] = [];
    acc[item.recipeName].push(item);
    return acc;
  }, {} as Record<string, ShoppingItem[]>);

  return (
    <View style={styles.container}>
      {/* Filter tabs */}
      <View style={styles.filters}>
        <TouchableOpacity 
          style={[styles.filterTab, showAll && styles.filterTabActive]}
          onPress={() => setShowAll(true)}
        >
          <Text style={[styles.filterText, showAll && styles.filterTextActive]}>
            All Items ({items.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterTab, !showAll && styles.filterTabActive]}
          onPress={() => setShowAll(false)}
        >
          <Text style={[styles.filterText, !showAll && styles.filterTextActive]}>
            Need to Buy ({needToBuy.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list}>
        {Object.entries(grouped).map(([recipeName, recipeItems]) => (
          <View key={recipeName} style={styles.recipeGroup}>
            <Text style={styles.recipeHeader}>{recipeName}</Text>
            {recipeItems.map(item => (
              <View key={item.id} style={styles.itemRow}>
                {/* Checkbox for shopping */}
                <TouchableOpacity 
                  style={[styles.checkbox, item.checked && styles.checkboxChecked]}
                  onPress={() => onToggleChecked(item.id)}
                >
                  {item.checked && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
                
                <View style={styles.itemContent}>
                  <Text style={[styles.itemName, item.checked && styles.itemNameChecked]}>
                    {item.item}
                  </Text>
                  <Text style={styles.itemAmount}>{item.amount}</Text>
                </View>
                
                {/* "Have at home" toggle */}
                <TouchableOpacity 
                  style={[styles.homeButton, item.hasAtHome && styles.homeButtonActive]}
                  onPress={() => onToggleHasAtHome(item.id)}
                >
                  <Text style={styles.homeButtonText}>
                    {item.hasAtHome ? '🏠 Have' : 'Need'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ))}
        
        {items.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🛒</Text>
            <Text style={styles.emptyText}>No shopping list yet</Text>
            <Text style={styles.emptySub}>Add a recipe to get started</Text>
          </View>
        )}
        
        <View style={{ height: 100 }} />
      </ScrollView>
      
      {/* Clear completed */}
      {items.some(i => i.checked) && (
        <TouchableOpacity style={styles.clearButton} onPress={onClearCompleted}>
          <Text style={styles.clearButtonText}>Clear Checked Items</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background?.primary ?? colors.cream[50],
  }
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: colors.primary[500],
  },
  filterText: {
    ...typography.bodyMedium,
    color: colors.neutral[700],
  },
  filterTextActive: {
    color: colors.white,
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  recipeGroup: {
    marginBottom: 20,
  },
  recipeHeader: {
    ...typography.bodyMedium,
    color: colors.neutral[700],
    marginBottom: 8,
    paddingVertical: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.neutral[300],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkmark: {
    ...typography.bodyMedium,
    color: colors.white,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    ...typography.bodyMedium,
    color: colors.neutral[700],
  },
  itemNameChecked: {
    textDecorationLine: 'line-through',
    color: colors.neutral[500],
  },
  itemAmount: {
    fontSize: 13,
    color: colors.neutral[500],
    marginTop: 2,
  },
  homeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.cream[100],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  homeButtonActive: {
    backgroundColor: colors.success + '20',
    borderColor: colors.success,
  },
  homeButtonText: {
    ...typography.caption,
    color: colors.neutral[700],
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    ...typography.h3,
    color: colors.neutral[700],
  },
  emptySub: {
    fontSize: 14,
    color: colors.neutral[500],
    marginTop: 4,
  },
  clearButton: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: colors.primary[500],
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  clearButtonText: {
    ...typography.bodyMedium,
    color: colors.white,
  },
});
