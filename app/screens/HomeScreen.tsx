import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Image } from "react-native";
import { useState, useCallback } from "react";
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, router } from 'expo-router';
import { ALL_RECIPES } from '../data/recipes';
import { getAvatar } from '../utils/avatar';
import { colors, spacing, typography, shadows } from '../theme';

const VIBES = [
  { id: 'comfort', label: 'Comfort', emoji: '🛋️', color: '#FF8C42' },
  { id: 'quick', label: 'Quick Win', emoji: '⚡', color: '#4CAF50' },
  { id: 'impress', label: 'Show Off', emoji: '✨', color: '#9C27B0' },
  { id: 'mindful', label: 'Mindful', emoji: '🧘', color: '#87CEEB' },
];

// Mock community data
const TRENDING_RECIPES = [
  { id: 'ramen', name: 'Tonkotsu Ramen', emoji: '🍜', saves: '12.4k' },
  { id: 'tacos', name: 'Birria Tacos', emoji: '🌮', saves: '8.7k' },
  { id: 'pasta', name: 'Cacio e Pepe', emoji: '🍝', saves: '6.2k' },
];

const PEOPLE_YOU_FOLLOW = [
  { id: 1, name: 'Chef Maria', avatar: '👩‍🍳', latestRecipe: 'Sunday Ragu' },
  { id: 2, name: 'Kenji', avatar: '🧑‍🔬', latestRecipe: 'Crispy Chicken' },
  { id: 3, name: 'Nana', avatar: '👵', latestRecipe: 'Sunday Roast' },
];

export default function HomeScreen() {
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadAvatar();
    }, [])
  );

  const loadAvatar = async () => {
    const avatar = await getAvatar();
    if (avatar) {
      setAvatarUri(avatar.uri);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView style={styles.scrollView}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.greeting}>What's for dinner?</Text>
            <TouchableOpacity 
              style={styles.avatarPlaceholder}
              onPress={() => router.push('/cook/profile')}
            >
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarEmoji}>👤</Text>
              )}
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={styles.browseBtn}
            onPress={() => router.push('/(tabs)/library')}
          >
            <Text style={styles.browseBtnText}>Browse All Recipes →</Text>
          </TouchableOpacity>
        </View>

        {/* Vibes */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vibesScroll}>
          {VIBES.map((vibe) => (
            <TouchableOpacity
              key={vibe.id}
              style={[
                styles.vibeChip,
                selectedVibe === vibe.id && { backgroundColor: vibe.color + '20', borderColor: vibe.color }
              ]}
              onPress={() => setSelectedVibe(selectedVibe === vibe.id ? null : vibe.id)}
            >
              <Text style={styles.vibeEmoji}>{vibe.emoji}</Text>
              <Text style={styles.vibeLabel}>{vibe.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Trending Now */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔥 Trending Now</Text>
          {TRENDING_RECIPES.map((recipe) => (
            <TouchableOpacity key={recipe.id} style={styles.trendingCard}>
              <Text style={styles.trendingEmoji}>{recipe.emoji}</Text>
              <View style={styles.trendingInfo}>
                <Text style={styles.trendingName}>{recipe.name}</Text>
                <Text style={styles.trendingSaves}>❤️ {recipe.saves} saves</Text>
              </View>
              <View style={styles.ratingPreview}>
                <Text style={styles.stars}>★★★★☆</Text>
                <Text style={styles.ratingCount}>2.4k made it</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* People You Follow */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 Chefs You Follow</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {PEOPLE_YOU_FOLLOW.map((person) => (
              <TouchableOpacity key={person.id} style={styles.personCard}>
                <Text style={styles.personAvatar}>{person.avatar}</Text>
                <Text style={styles.personName}>{person.name}</Text>
                <Text style={styles.personLatest} numberOfLines={1}>{person.latestRecipe}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Community Picks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌟 Community Picks</Text>
          <View style={styles.communityGrid}>
            {ALL_RECIPES.filter(r => r.available).slice(0, 4).map((recipe) => (
              <TouchableOpacity 
                key={recipe.id}
                style={styles.communityCard}
                onPress={() => router.push(`/recipe/${recipe.id}`)}
              >
                <Text style={styles.communityEmoji}>{recipe.emoji}</Text>
                <Text style={styles.communityName} numberOfLines={2}>{recipe.title}</Text>
                <Text style={styles.communityTime}>{recipe.timeDisplay}</Text>
              </TouchableOpacity>
            ))}
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
    backgroundColor: colors.cream[50],
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: typography.h1.fontSize,
    fontWeight: typography.h1.fontWeight,
    color: colors.neutral[900],
    flex: 1,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarEmoji: {
    fontSize: 28,
  },
  browseBtn: {
    backgroundColor: '#FF8C42',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  browseBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  vibesScroll: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  vibeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  vibeEmoji: {
    fontSize: 20,
    marginRight: 6,
  },
  vibeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5D4E37',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5D4E37',
    marginBottom: 16,
  },
  trendingCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  trendingEmoji: {
    fontSize: 36,
    marginRight: 16,
  },
  trendingInfo: {
    flex: 1,
  },
  trendingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5D4E37',
    marginBottom: 2,
  },
  trendingSaves: {
    fontSize: 13,
    color: '#999',
  },
  ratingPreview: {
    alignItems: 'flex-end',
  },
  stars: {
    fontSize: 14,
    color: '#FF8C42',
    letterSpacing: 1,
  },
  ratingCount: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  personCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginRight: 12,
    width: 110,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  personAvatar: {
    fontSize: 40,
    marginBottom: 8,
  },
  personName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5D4E37',
    marginBottom: 2,
  },
  personLatest: {
    fontSize: 12,
    color: '#87CEEB',
    textAlign: 'center',
  },
  communityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  communityCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    width: '47%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  communityEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  communityName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5D4E37',
    textAlign: 'center',
    marginBottom: 4,
  },
  communityTime: {
    fontSize: 12,
    color: '#999',
  },
});
