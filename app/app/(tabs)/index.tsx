import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Image } from "react-native";
import { useState, useCallback } from "react";
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, router } from 'expo-router';
import { ALL_RECIPES } from '../../data/recipes';
import { getAvatar } from '../../utils/avatar';
import { spacing, layout, typography, shadows, fonts } from '../../theme';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { supabase } from '@/lib/supabase';

const VIBES = [
  { id: 'comfort', label: 'Comfort' },
  { id: 'quick', label: 'Quick Win' },
  { id: 'impress', label: 'Show Off' },
  { id: 'mindful', label: 'Mindful' },
];

const TRENDING_RECIPES = [
  { id: 'tonkotsu-ramen', name: 'Tonkotsu Ramen', emoji: '🍜', saves: '12.4k' },
  { id: 'birria-tacos', name: 'Birria Tacos', emoji: '🌮', saves: '8.7k', isNew: true },
  { id: 'beef-rendang', name: 'Beef Rendang', emoji: '🥩', saves: '6.8k' },
  { id: 'cacio-e-pepe', name: 'Cacio e Pepe', emoji: '🧀', saves: '6.2k' },
  { id: 'chicken-curry', name: 'Chicken Curry with Paratha Roti', emoji: '🍛', saves: '5.9k' },
];

const CHEFS_YOU_FOLLOW = [
  { id: 1, name: 'Julia', avatarUrl: 'https://vsyibvjpwjjyvnsnyjmk.supabase.co/storage/v1/object/public/enPlace/Avatar-images/Julia.avif', specialty: 'French Cuisine', latestRecipe: 'Coq au Vin' },
  { id: 2, name: 'Charlotte', avatarUrl: 'https://vsyibvjpwjjyvnsnyjmk.supabase.co/storage/v1/object/public/enPlace/Avatar-images/Charlotte.avif', specialty: 'Pastry & Baking', latestRecipe: 'Sourdough Tartine' },
  { id: 3, name: 'Catherine', avatarUrl: 'https://vsyibvjpwjjyvnsnyjmk.supabase.co/storage/v1/object/public/enPlace/Avatar-images/Catherine.avif', specialty: 'Caribbean Fusion', latestRecipe: 'Jerk Chicken Tacos' },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [chefName, setChefName] = useState<string | null>(null);
const getTimeBasedGreeting = (name: string) => {
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  return `Good ${timeOfDay}, ${name}`;
};

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

  const dynamicStyles = createStyles(colors);

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <StatusBar style="dark" />
      <ScrollView style={dynamicStyles.scrollView}>
        {/* Header */}
        <View style={dynamicStyles.header}>
          <View style={dynamicStyles.headerRow}>
            <View style={dynamicStyles.greetingContainer}>
              <Text style={dynamicStyles.greeting}>
                {chefName ? getTimeBasedGreeting(chefName) : "What's for dinner?"}
              </Text>
            </View>
            <TouchableOpacity
              style={dynamicStyles.avatarPlaceholder}
              onPress={() => router.push('/profile')}
            >
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={dynamicStyles.avatarImage} />
              ) : (
                <Text style={dynamicStyles.avatarEmoji}>{ }</Text>
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
          <Text
            style={dynamicStyles.browseLink}
            onPress={() => router.push('/(tabs)/library')}
          >
            View all →
          </Text>
        </View>

        {/* Vibes */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={dynamicStyles.vibesScroll}>
          {VIBES.map((vibe) => (
            <TouchableOpacity
              key={vibe.id}
              style={dynamicStyles.vibeChip}
              onPress={() => {}}
            >
              <Text style={dynamicStyles.vibeLabel}>{vibe.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Trending Now */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionLabel}>TRENDING NOW</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={dynamicStyles.horizontalScrollContainer}
            snapToInterval={312} // Card width (300) + marginRight (12)
            decelerationRate="fast"
          >
          {TRENDING_RECIPES.map((recipe) => {
            // Get full recipe data to check for image
            const fullRecipe = ALL_RECIPES.find(r => r.id === recipe.id);
            return (
              <TouchableOpacity
                key={recipe.id}
                style={dynamicStyles.trendingCardHorizontal}
                onPress={() => router.push(`/recipe/${recipe.id}`)}
              >
                {fullRecipe?.imageUrl ? (
                  <View style={dynamicStyles.trendingImageContainerHorizontal}>
                    <Image source={{ uri: fullRecipe.imageUrl }} style={dynamicStyles.trendingImageHorizontal} />
                  </View>
                ) : (
                  <View style={dynamicStyles.trendingEmojiContainerHorizontal} />
                )}
                <View style={dynamicStyles.trendingInfoHorizontal}>
                  <Text style={dynamicStyles.trendingCardTitle} numberOfLines={2}>{recipe.name}</Text>
                  <Text style={dynamicStyles.trendingSaves}>{recipe.saves} saves</Text>
                </View>
              </TouchableOpacity>
            );
          })}
          </ScrollView>
        </View>

        {/* Chefs You Follow */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionLabel}>CHEFS YOU FOLLOW</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={dynamicStyles.horizontalScrollContainer}
            snapToInterval={312} // Card width (300) + marginRight (12)
            decelerationRate="fast"
          >
            {CHEFS_YOU_FOLLOW.map((chef) => (
              <TouchableOpacity key={chef.id} style={dynamicStyles.chefCardHorizontal}>
                <View style={dynamicStyles.chefImageContainer}>
                  <Image source={{ uri: chef.avatarUrl }} style={dynamicStyles.chefImage} />
                </View>
                <View style={dynamicStyles.chefInfo}>
                  <Text style={dynamicStyles.chefCardName}>{chef.name}</Text>
                  <View style={dynamicStyles.chefInfoRow}>
                    <Text style={dynamicStyles.chefSpecialtyTag}>{chef.specialty}</Text>
                    <Text style={dynamicStyles.chefFollowers}>{(chef.id * 12.4).toFixed(1)}k followers</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Community Picks */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionLabel}>COMMUNITY PICKS</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={dynamicStyles.horizontalScrollContainer}
            snapToInterval={312} // Card width (300) + marginRight (12)
            decelerationRate="fast"
          >
            {ALL_RECIPES.filter(r => r.available).slice(0, 6).map((recipe) => (
              <TouchableOpacity
                key={recipe.id}
                style={dynamicStyles.communityCardHorizontal}
                onPress={() => router.push(`/recipe/${recipe.id}`)}
              >
                {recipe.imageUrl ? (
                  <View style={dynamicStyles.communityImageContainerHorizontal}>
                    <Image source={{ uri: recipe.imageUrl }} style={dynamicStyles.communityImageHorizontal} />
                  </View>
                ) : (
                  <View style={dynamicStyles.communityEmojiContainerHorizontal} />
                )}
                <View style={dynamicStyles.communityInfoHorizontal}>
                  <Text style={dynamicStyles.communityCardTitle} numberOfLines={2}>{recipe.title}</Text>
                  <Text style={dynamicStyles.communityTimeHorizontal}>{recipe.timeDisplay}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Create styles function that accepts dynamic colors
const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.primary,
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
    ...typography.h2,
    fontFamily: fonts.serifBold,
    color: colors.text.secondary,
    flex: 1,
  },
  greetingContainer: {
    flex: 1,
  },
  greetingSub: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: 4,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: colors.border.subtle,
    overflow: 'visible',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: colors.accent.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    maxWidth: 70,
  },
  avatarBadgeText: {
    ...typography.micro,
    color: colors.text.inverse,
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
    backgroundColor: colors.accent.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  browseBtnText: {
    ...typography.bodyMedium,
    color: colors.text.inverse,
  },
  browseLink: {
    ...typography.caption,
    color: colors.accent.primary,
  },
  vibesScroll: {
    paddingHorizontal: layout.screenGutter,
    marginBottom: 32,
  },
  vibeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface.secondary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 22,
    marginRight: 12,
    borderWidth: 2,
    borderColor: colors.neutral[200],
    minHeight: 44,
  },
  vibeEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  vibeLabel: {
    ...typography.bodyMedium,
    color: colors.text.primary,
  },
  section: {
    marginBottom: 48,
  },
  horizontalScrollContainer: {
    paddingHorizontal: layout.screenGutter,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.text.muted,
    marginBottom: 20,
    paddingHorizontal: layout.screenGutter,
  },
  trendingCard: {
    backgroundColor: colors.surface.secondary,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    ...shadows.sm,
  },
  trendingCardHorizontal: {
    width: 300,
    backgroundColor: colors.surface.secondary,
    borderRadius: 16,
    marginRight: 12,
    overflow: 'hidden',
    ...shadows.sm,
  },
  trendingImageContainer: {
    width: '100%',
    aspectRatio: 4/3,
    position: 'relative',
  },
  trendingImageContainerHorizontal: {
    width: '100%',
    aspectRatio: 4/3,
    position: 'relative',
  },
  trendingImage: {
    width: '100%',
    height: '100%',
  },
  trendingImageHorizontal: {
    width: '100%',
    height: '100%',
  },
  trendingCardTitle: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    marginBottom: 4,
  },
  trendingEmojiContainer: {
    width: '100%',
    aspectRatio: 4/3,
    backgroundColor: colors.surface.raised,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendingEmojiContainerHorizontal: {
    width: '100%',
    aspectRatio: 4/3,
    backgroundColor: colors.surface.raised,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendingEmoji: {
    fontSize: 72,
    marginBottom: 8,
  },
  trendingEmojiTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  trendingInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  trendingInfoHorizontal: {
    padding: 12,
    paddingTop: 10,
  },
  trendingSaves: {
    fontSize: 14,
    color: colors.text.muted,
  },
  ratingPreview: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 8,
  },
  stars: {
    fontSize: 16,
    color: colors.accent.primary,
    marginBottom: 2,
  },
  ratingCount: {
    fontSize: 12,
    color: colors.text.muted,
  },
  // Chef Follow Cards
  chefCard: {
    backgroundColor: colors.surface.secondary,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    width: 120,
    alignItems: 'center',
    ...shadows.sm,
  },
  chefAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.border.subtle,
  },
  chefName: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  chefSpecialty: {
    fontSize: 11,
    color: colors.accent.primary,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
  chefLatestContainer: {
    alignItems: 'center',
    width: '100%',
  },
  chefLatestLabel: {
    fontSize: 9,
    color: colors.neutral[400],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  chefLatestRecipe: {
    fontSize: 11,
    color: colors.neutral[600],
    textAlign: 'center',
  },
  chefCardHorizontal: {
    width: 300,
    backgroundColor: colors.surface.secondary,
    borderRadius: 16,
    marginRight: 12,
    overflow: 'hidden',
    ...shadows.sm,
  },
  chefImageContainer: {
    width: '100%',
    aspectRatio: 4/3,
    position: 'relative',
  },
  chefImage: {
    width: '100%',
    height: '100%',
  },
  chefCardName: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    marginBottom: 6,
  },
  chefInfo: {
    padding: 12,
    paddingTop: 10,
  },
  chefInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chefSpecialtyTag: {
    ...typography.micro,
    color: colors.accent.primary,
    backgroundColor: colors.surface.raised,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  chefFollowers: {
    ...typography.caption,
    color: colors.text.muted,
  },
  communityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  communityCardHorizontal: {
    width: 300,
    backgroundColor: colors.surface.secondary,
    borderRadius: 16,
    marginRight: 12,
    overflow: 'hidden',
    ...shadows.sm,
  },
  communityImageContainerHorizontal: {
    width: '100%',
    aspectRatio: 4/3,
    position: 'relative',
  },
  communityImageHorizontal: {
    width: '100%',
    height: '100%',
  },
  communityInfoHorizontal: {
    padding: 12,
    paddingTop: 10,
  },
  communityCardTitle: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    marginBottom: 4,
  },
  communityEmojiContainerHorizontal: {
    width: '100%',
    aspectRatio: 4/3,
    backgroundColor: colors.surface.raised,
    justifyContent: 'center',
    alignItems: 'center',
  },
  communityEmojiHorizontal: {
    fontSize: 48,
  },
  communityTimeHorizontal: {
    ...typography.caption,
    color: colors.text.muted,
  },
});
