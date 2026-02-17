import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Image } from "react-native";
import { useState, useCallback } from "react";
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, router } from 'expo-router';
import { ALL_RECIPES } from '../../data/recipes';
import { getAvatar } from '../../utils/avatar';
import { spacing, typography, shadows } from '../../theme';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { supabase } from '@/lib/supabase';

const VIBES = [
  { id: 'comfort', label: 'Comfort', emoji: '🛋️', color: '#FF8C42' },
  { id: 'quick', label: 'Quick Win', emoji: '⚡', color: '#4CAF50' },
  { id: 'impress', label: 'Show Off', emoji: '✨', color: '#9C27B0' },
  { id: 'mindful', label: 'Mindful', emoji: '🧘', color: '#87CEEB' },
];

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
  const { user } = useAuth();
  const { colors, isMichelin } = useTheme();
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [chefName, setChefName] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadAvatar();
      if (user) loadChefName();
    }, [user])
  );

  const loadAvatar = async () => {
    const avatar = await getAvatar();
    if (avatar) setAvatarUri(avatar.uri);
  };

  const loadChefName = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user!.id)
      .single();
    setChefName(data?.display_name || null);
  };

  const dynamicStyles = createStyles(colors, isMichelin);

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <StatusBar style={isMichelin ? 'light' : 'dark'} />
      <ScrollView style={dynamicStyles.scrollView}>
        {/* Header */}
        <View style={dynamicStyles.header}>
          <View style={dynamicStyles.headerRow}>
            <View style={dynamicStyles.greetingContainer}>
              <Text style={dynamicStyles.greeting}>
                {chefName ? `Hey Chef ${chefName}!` : "What's for dinner?"}
              </Text>
              {chefName && (
                <Text style={dynamicStyles.greetingSub}>Ready to cook something amazing?</Text>
              )}
            </View>
            <TouchableOpacity
              style={dynamicStyles.avatarPlaceholder}
              onPress={() => router.push('/profile')}
            >
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={dynamicStyles.avatarImage} />
              ) : (
                <Text style={dynamicStyles.avatarEmoji}>👤</Text>
              )}
              {chefName && (
                <View style={dynamicStyles.avatarBadge}>
                  <Text style={dynamicStyles.avatarBadgeText} numberOfLines={1}>
                    {chefName}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={dynamicStyles.browseBtn}
            onPress={() => router.push('/(tabs)/library')}
          >
            <Text style={dynamicStyles.browseBtnText}>Browse All Recipes →</Text>
          </TouchableOpacity>
        </View>

        {/* Vibes */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={dynamicStyles.vibesScroll}>
          {VIBES.map((vibe) => (
            <TouchableOpacity
              key={vibe.id}
              style={[
                dynamicStyles.vibeChip,
                selectedVibe === vibe.id && { 
                  backgroundColor: vibe.color + '20', 
                  borderColor: vibe.color 
                }
              ]}
              onPress={() => setSelectedVibe(selectedVibe === vibe.id ? null : vibe.id)}
            >
              <Text style={dynamicStyles.vibeEmoji}>{vibe.emoji}</Text>
              <Text style={dynamicStyles.vibeLabel}>{vibe.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Trending Now */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>🔥 Trending Now</Text>
          {TRENDING_RECIPES.map((recipe) => (
            <TouchableOpacity key={recipe.id} style={dynamicStyles.trendingCard}>
              <Text style={dynamicStyles.trendingEmoji}>{recipe.emoji}</Text>
              <View style={dynamicStyles.trendingInfo}>
                <Text style={dynamicStyles.trendingName}>{recipe.name}</Text>
                <Text style={dynamicStyles.trendingSaves}>❤️ {recipe.saves} saves</Text>
              </View>
              <View style={dynamicStyles.ratingPreview}>
                <Text style={dynamicStyles.stars}>★★★★☆</Text>
                <Text style={dynamicStyles.ratingCount}>2.4k made it</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* People You Follow */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>👥 Chefs You Follow</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {PEOPLE_YOU_FOLLOW.map((person) => (
              <TouchableOpacity key={person.id} style={dynamicStyles.personCard}>
                <Text style={dynamicStyles.personAvatar}>{person.avatar}</Text>
                <Text style={dynamicStyles.personName}>{person.name}</Text>
                <Text style={dynamicStyles.personLatest} numberOfLines={1}>{person.latestRecipe}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Community Picks */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>🌟 Community Picks</Text>
          <View style={dynamicStyles.communityGrid}>
            {ALL_RECIPES.filter(r => r.available).slice(0, 4).map((recipe) => (
              <TouchableOpacity
                key={recipe.id}
                style={dynamicStyles.communityCard}
                onPress={() => router.push(`/recipe/${recipe.id}`)}
              >
                <Text style={dynamicStyles.communityEmoji}>{recipe.emoji}</Text>
                <Text style={dynamicStyles.communityName} numberOfLines={2}>{recipe.title}</Text>
                <Text style={dynamicStyles.communityTime}>{recipe.timeDisplay}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Create styles function that accepts dynamic colors
const createStyles = (colors: any, isMichelin: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isMichelin ? colors.background?.primary : colors.cream[50],
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
  greetingContainer: {
    flex: 1,
  },
  greetingSub: {
    fontSize: 14,
    color: colors.neutral[500],
    marginTop: 4,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: isMichelin ? colors.background?.secondary : '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: isMichelin ? colors.neutral[300] : '#E8E8E8',
    overflow: 'visible',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: colors.primary[500],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    maxWidth: 70,
  },
  avatarBadgeText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '600',
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
    backgroundColor: colors.primary[500],
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  browseBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  vibesScroll: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  vibeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isMichelin ? colors.background?.secondary : '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: isMichelin ? colors.neutral[300] : '#E8E8E8',
  },
  vibeEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  vibeLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: typography.h3.fontWeight,
    color: colors.neutral[900],
    marginBottom: 16,
  },
  trendingCard: {
    flexDirection: 'row',
    backgroundColor: isMichelin ? colors.background?.secondary : '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  trendingEmoji: {
    fontSize: 40,
    marginRight: 16,
  },
  trendingInfo: {
    flex: 1,
  },
  trendingName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: 4,
  },
  trendingSaves: {
    fontSize: 14,
    color: colors.neutral[500],
  },
  ratingPreview: {
    alignItems: 'flex-end',
  },
  stars: {
    fontSize: 16,
    color: isMichelin && colors.gold ? colors.gold[500] : '#FF8C42',
    marginBottom: 2,
  },
  ratingCount: {
    fontSize: 12,
    color: colors.neutral[500],
  },
  personCard: {
    backgroundColor: isMichelin ? colors.background?.secondary : '#FFF',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    width: 120,
    alignItems: 'center',
  },
  personAvatar: {
    fontSize: 40,
    marginBottom: 8,
  },
  personName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: 4,
  },
  personLatest: {
    fontSize: 12,
    color: colors.neutral[500],
    textAlign: 'center',
  },
  communityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  communityCard: {
    backgroundColor: isMichelin ? colors.background?.secondary : '#FFF',
    borderRadius: 16,
    padding: 16,
    width: '47%',
    alignItems: 'center',
  },
  communityEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  communityName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: 4,
  },
  communityTime: {
    fontSize: 12,
    color: colors.neutral[500],
  },
});
