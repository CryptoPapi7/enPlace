import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { getActiveCooking, ActiveCooking } from '../utils/activeCooking';
import { getFavorites, initFavorites } from '../utils/favorites';

export default function CookLauncherScreen({ navigation }: any) {
  const [activeCooking, setActiveCooking] = useState<ActiveCooking | null>(null);
  const [favorites, setFavorites] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const cooking = await getActiveCooking();
        setActiveCooking(cooking);
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>My Kitchen</Text>
        
        {/* Active Cooking */}
        {activeCooking ? (
          <TouchableOpacity style={styles.activeCard} onPress={resume}>
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
        ) : (
          <TouchableOpacity 
            style={styles.startCard}
            onPress={() => navigation.navigate('RecipeLibrary')}
          >
            <Text style={styles.startEmoji}>👨‍🍳</Text>
            <Text style={styles.startTitle}>Ready to cook?</Text>
            <Text style={styles.startSub}>Pick a recipe from your favorites</Text>
          </TouchableOpacity>
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
          <View style={styles.quickGrid}>
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
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.quickEmoji}>🔥</Text>
              <Text style={styles.quickLabel} numberOfLines={2} ellipsizeMode="tail">Trending</Text>
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
  
  // Start Card (no active cooking)
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
    color: '#999',
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
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  favEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  favName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5D4E37',
    textAlign: 'center',
  },
  emptyFavs: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E8E8E8',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#5D4E37',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    color: '#999',
  },
  
  // Quick Access
  quickGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    borderWidth: 2,
    borderColor: '#E8E8E8',
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
