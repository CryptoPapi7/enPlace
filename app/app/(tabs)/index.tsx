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
  { id: 'comfort', label: 'Comfort', color: '#FF8C42' },
  { id: 'quick', label: 'Quick Win', color: '#4CAF50' },
  { id: 'impress', label: 'Show Off', color: '#9C27B0' },
  { id: 'mindful', label: 'Mindful', color: '#87CEEB' },
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
              <Text style={dynamicStyles.vibeLabel}>{vibe.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Trending Now */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Trending Now</Text>
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
                    <View style={dynamicStyles.trendingOverlay}>
                      <Text style={dynamicStyles.trendingImageTitle}>{recipe.name}</Text>
                    </View>
                  </View>
                ) : (
                  <View style={dynamicStyles.trendingEmojiContainerHorizontal}>
                    <Text style={dynamicStyles.trendingEmoji}>{recipe.emoji}</Text>
                    <Text style={dynamicStyles.trendingEmojiTitle}>{recipe.name}</Text>
                  </View>
                )}
                <View style={dynamicStyles.trendingInfoHorizontal}>
                  <Text style={dynamicStyles.trendingSaves}>❤️ {recipe.saves} saves</Text>
                </View>
              </TouchableOpacity>
            );
          })}
          </ScrollView>
        </View>

        {/* Chefs You Follow */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Chefs You Follow</Text>
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
                  <View style={dynamicStyles.chefOverlay}>
                    <Text style={dynamicStyles.chefImageName}>{chef.name}</Text>
                  </View>
                </View>
                <View style={dynamicStyles.chefInfo}>
                  <Text style={dynamicStyles.chefSpecialtyTag}>{chef.specialty}</Text>
                  <Text style={dynamicStyles.chefFollowers}>👥 {(chef.id * 12.4).toFixed(1)}k followers</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Community Picks */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Community Picks</Text>
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
                    <View style={dynamicStyles.communityOverlay}>
                      <Text style={dynamicStyles.communityImageTitle} numberOfLines={2}>{recipe.title}</Text>
                    </View>
                  </View>
                ) : (
                  <View style={dynamicStyles.communityEmojiContainerHorizontal}>
                    <Text style={dynamicStyles.communityEmojiHorizontal}>{recipe.emoji}</Text>
                    <Text style={dynamicStyles.communityNameHorizontal} numberOfLines={2}>{recipe.title}</Text>
                  </View>
                )}
                <Text style={dynamicStyles.communityTimeHorizontal}>{recipe.timeDisplay}</Text>
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
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  vibeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isMichelin ? colors.background?.secondary : '#FFF',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 22,
    marginRight: 12,
    borderWidth: 2,
    borderColor: isMichelin ? colors.neutral[300] : '#E8E8E8',
    minHeight: 44,
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
    marginBottom: 40,
  },
  horizontalScrollContainer: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: typography.h3.fontWeight,
    color: colors.neutral[900],
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  trendingCard: {
    backgroundColor: isMichelin ? colors.background?.secondary : '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    ...shadows.sm,
  },
  trendingCardHorizontal: {
    width: 300,
    backgroundColor: isMichelin ? colors.background?.secondary : '#FFF',
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
  trendingOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'flex-end',
    padding: 12,
  },
  trendingImageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  trendingEmojiContainer: {
    width: '100%',
    aspectRatio: 4/3,
    backgroundColor: isMichelin ? colors.background?.tertiary : colors.cream[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendingEmojiContainerHorizontal: {
    width: '100%',
    aspectRatio: 4/3,
    backgroundColor: isMichelin ? colors.background?.tertiary : colors.cream[100],
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
    color: colors.neutral[700],
  },
  trendingInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  trendingInfoHorizontal: {
    padding: 12,
  },
  trendingSaves: {
    fontSize: 14,
    color: colors.neutral[500],
  },
  ratingPreview: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 8,
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
  // Chef Follow Cards
  chefCard: {
    backgroundColor: isMichelin ? colors.background?.secondary : '#FFF',
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
    borderColor: isMichelin ? colors.neutral[300] : colors.cream[200],
  },
  chefName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: 4,
  },
  chefSpecialty: {
    fontSize: 11,
    color: colors.primary[500],
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
    backgroundColor: isMichelin ? colors.background?.secondary : '#FFF',
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
  chefOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'flex-end',
    padding: 12,
  },
  chefImageName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  chefInfo: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chefSpecialtyTag: {
    fontSize: 12,
    color: colors.primary[500],
    fontWeight: '600',
    backgroundColor: isMichelin ? colors.background?.tertiary : colors.cream[100],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  chefFollowers: {
    fontSize: 13,
    color: colors.neutral[500],
  },
  communityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  communityCardHorizontal: {
    width: 300,
    backgroundColor: isMichelin ? colors.background?.secondary : '#FFF',
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
  communityOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
    padding: 8,
  },
  communityImageTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  communityEmojiContainerHorizontal: {
    width: '100%',
    aspectRatio: 4/3,
    backgroundColor: isMichelin ? colors.background?.tertiary : colors.cream[100],
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  communityEmojiHorizontal: {
    fontSize: 48,
    marginBottom: 4,
  },
  communityNameHorizontal: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[700],
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  communityTimeHorizontal: {
    fontSize: 12,
    color: colors.neutral[500],
    padding: 12,
    paddingTop: 8,
  },
});
