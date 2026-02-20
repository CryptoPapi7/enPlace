import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Switch, Image, Alert, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { getAvatar, saveAvatar, clearAvatar } from '@/utils/avatar';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { typography } from '@/theme';
import { supabase } from '@/lib/supabase';
import { loadSettings, saveSettings, UnitSystem } from '@/utils/settings';

const THEME_OPTIONS = [
  { id: 'default', label: 'Classic', description: 'Warm & inviting' },
  { id: 'michelin', label: 'Michelin Star', description: 'Fine dining elegance' },
] as const;

const MEASUREMENT_OPTIONS = [
  { id: 'metric', label: 'Metric', suffix: 'kg/ml' },
  { id: 'imperial', label: 'US Imperial', suffix: 'lb/cup' },
  { id: 'baker', label: 'Baker', suffix: 'g/ml' },
];

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { colors, themeMode, setThemeMode } = useTheme();
  const isMichelin = false;
  const dynamicStyles = createStyles(colors, isMichelin);

  const [settings, setSettings] = useState({
    unitSystem: 'metric' as UnitSystem,
    defaultServings: 4,
    dietary: { vegetarian: false, vegan: false, glutenFree: false, dairyFree: false },
    notifications: { mealReminders: true, shoppingReminders: true, newRecipes: false },
  });
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  useEffect(() => {
    loadAvatar();
    loadUserSettings();
    if (user) {
      loadProfile();
    }
  }, [user]);

  async function loadUserSettings() {
    setIsLoadingSettings(true);
    const savedSettings = await loadSettings();
    setSettings(prev => ({
      ...prev,
      unitSystem: savedSettings.unitSystem,
      defaultServings: savedSettings.defaultServings,
    }));
    setIsLoadingSettings(false);
  }

  async function handleDefaultServingsChange(newServings: number) {
    if (!user) {
      Alert.alert(
        '👨‍🍳 Guest Chef Mode',
        'Your preferences are saved locally. Sign in to sync across all your devices.',
        [
          { text: 'Got it', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/auth') },
      ]
      );
    }

    setSettings(prev => ({ ...prev, defaultServings: newServings }));
    await saveSettings({ 
      unitSystem: settings.unitSystem,
      defaultServings: newServings 
    });
  }

  async function handleUnitSystemChange(unitSystem: UnitSystem) {
    if (!user) {
      // Guest users can still set preference locally, but show a nudge
      Alert.alert(
        '👨‍🍳 Guest Chef Mode',
        'Your preferences are saved locally. Sign in to sync across all your devices.',
        [
          { text: 'Got it', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/auth') },
      ]
      );
    }

    setSettings(prev => ({ ...prev, unitSystem }));
    await saveSettings({ unitSystem });
  }

  async function loadAvatar() {
    const avatar = await getAvatar();
    if (avatar) setAvatarUri(avatar.uri);
  }

  async function loadProfile() {
    const { data } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user!.id)
      .single();
    
    if (data?.display_name) {
      setDisplayName(data.display_name);
    }
  }

  async function saveDisplayName() {
    if (!user) return;
    
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        display_name: tempName.trim() || null,
      });
    
    if (error) {
      Alert.alert('Error', 'Failed to save nickname');
      return;
    }

    setDisplayName(tempName.trim());
    setIsEditingName(false);
  }

  function startEditingName() {
    setTempName(displayName);
    setIsEditingName(true);
  }

  function cancelEditingName() {
    setIsEditingName(false);
    setTempName('');
  }

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant photo permissions to change avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      await saveAvatar(uri);
      setAvatarUri(uri);
    }
  }

  async function removeAvatar() {
    await clearAvatar();
    setAvatarUri(null);
  }

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <StatusBar style={isMichelin ? 'light' : 'dark'} />
      <ScrollView style={dynamicStyles.scrollView}>
        {/* Header */}
      <View style={dynamicStyles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={dynamicStyles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={dynamicStyles.title}>Profile & Settings</Text>
        </View>

        {/* Avatar & Auth Section */}
      <View style={dynamicStyles.avatarSection}>
          <TouchableOpacity style={dynamicStyles.avatarLarge} onPress={pickImage}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={dynamicStyles.avatarImage} />
            ) : (
              <Text style={dynamicStyles.avatarEmoji}>👤</Text>
            )}

        </TouchableOpacity>
          <Text style={dynamicStyles.avatarHint}>Tap to change photo</Text>

          {avatarUri && (
            <TouchableOpacity style={dynamicStyles.removeBtn} onPress={removeAvatar}>
              <Text style={dynamicStyles.removeText}>Remove Photo</Text>
            </TouchableOpacity>
          )}

          {/* Chef Nickname */}
          {user && (
            <View style={dynamicStyles.nicknameSection}>
              <Text style={dynamicStyles.nicknameLabel}>Chef Name</Text>
              {isEditingName ? (
                <View style={dynamicStyles.nicknameEditRow}>
                  <TextInput
                    style={dynamicStyles.nicknameInput}
                    value={tempName}
                    onChangeText={setTempName}
                    placeholder="Enter your chef name"
                    placeholderTextColor={colors.neutral[500]}
                    autoFocus
                  />
                  <TouchableOpacity style={dynamicStyles.nicknameSaveBtn} onPress={saveDisplayName}>
                    <Text style={dynamicStyles.nicknameSaveText}>✓</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={dynamicStyles.nicknameCancelBtn} onPress={cancelEditingName}>
                    <Text style={dynamicStyles.nicknameCancelText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={dynamicStyles.nicknameDisplay} onPress={startEditingName}>
                  <Text style={dynamicStyles.nicknameText}>
                    {displayName || 'Tap to set chef name'},
                </Text>
                  <Text style={dynamicStyles.nicknameEditIcon}>✎</Text>
                </TouchableOpacity>
              )}

          </View>
          )}

          {user ? (
            <View style={dynamicStyles.authSection}>
              <Text style={dynamicStyles.userEmail}>{user.email}</Text>
              <TouchableOpacity style={dynamicStyles.signOutBtn} onPress={signOut}>
                <Text style={dynamicStyles.signOutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={dynamicStyles.authSection}>
              <Text style={dynamicStyles.guestText}>Guest Chef</Text>
              <TouchableOpacity style={dynamicStyles.signInBtn} onPress={() => router.push('/auth')}>
                <Text style={dynamicStyles.signInText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          )}
      </View>

        {/* Default Measurements */}
      <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>⚖️ Default Measurements</Text>
          <Text style={dynamicStyles.sectionSub}>Applies to all recipes</Text>

          {MEASUREMENT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
            style={[
                dynamicStyles.optionRow,
                settings.unitSystem === option.id && dynamicStyles.optionRowActive
              ]}
              onPress={() => handleUnitSystemChange(option.id as UnitSystem)}
            >
              <View>
                <Text style={[
                  dynamicStyles.optionLabel,
                  settings.unitSystem === option.id && dynamicStyles.optionLabelActive
                ]}>
                  {option.label}
              </Text>
                <Text style={dynamicStyles.optionSuffix}>{option.suffix}</Text>
              </View>
              {settings.unitSystem === option.id && (
                <Text style={dynamicStyles.checkmark}>✓</Text>
              )}

          </TouchableOpacity>
          ))}

      </View>

        {/* Default Servings */}
      <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>👥 Default Servings</Text>
          <Text style={dynamicStyles.sectionSub}>Starting amount for all recipes</Text>
          
          <View style={dynamicStyles.servingsControl}>
            <TouchableOpacity
              style={dynamicStyles.servingsButton}
              onPress={() => handleDefaultServingsChange(Math.max(1, settings.defaultServings - 1))}
            >
              <Text style={dynamicStyles.servingsButtonText}>−</Text>
            </TouchableOpacity>
            
            <Text style={dynamicStyles.servingsValue}>{settings.defaultServings}</Text>
            
            <TouchableOpacity
              style={dynamicStyles.servingsButton}
              onPress={() => handleDefaultServingsChange(Math.min(20, settings.defaultServings + 1))}
            >
              <Text style={dynamicStyles.servingsButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dietary Preferences */}
      <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>🥗 Dietary Preferences</Text>
          <Text style={dynamicStyles.sectionSub}>Filter recipes automatically</Text>

          {Object.entries(settings.dietary).map(([key, value]) => (
            <View key={key} style={dynamicStyles.toggleRow}>
              <Text style={dynamicStyles.toggleLabel}>
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}

            </Text>
              <Switch
                value={value}
                onValueChange={(v) => setSettings(s => ({
                  ...s,
                  dietary: { ...s.dietary, [key]: v },
                }))}
                trackColor={{ false: colors.neutral[300], true: colors.primary[500] }}
                thumbColor="#FFF"
              />
            </View>
          ))}

      </View>

        {/* Notifications */}
      <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>🔔 Notifications</Text>

          {Object.entries(settings.notifications).map(([key, value]) => (
            <View key={key} style={dynamicStyles.toggleRow}>
              <Text style={dynamicStyles.toggleLabel}>
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}

            </Text>
              <Switch
                value={value}
              onValueChange={(v) => setSettings(s => ({
                  ...s,
                  notifications: { ...s.notifications, [key]: v },
              }))}

              trackColor={{ false: colors.neutral[300], true: colors.primary[500] }}
              thumbColor="#FFF"
              />
            </View>
          ))}

      </View>

        {/* Theme Selection */}
      <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>✨ App Theme</Text>
          <Text style={dynamicStyles.sectionSub}>Choose your preferred visual style</Text>
          {THEME_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
            style={[
                dynamicStyles.optionRow,
                themeMode === option.id && dynamicStyles.optionRowActive
              ]}
            onPress={() => setThemeMode(option.id)}

          >
              <View>
                <Text style={[
                  dynamicStyles.optionLabel,
                  themeMode === option.id && dynamicStyles.optionLabelActive
                ]}>
                  {option.label}
              </Text>
                <Text style={dynamicStyles.optionSuffix}>{option.description}</Text>
              </View>
              {themeMode === option.id && (
                <Text style={dynamicStyles.checkmark}>✓</Text>
              )}

          </TouchableOpacity>
          ))}

      </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any, isMichelin: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.primary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
  },
  backText: {
    ...typography.bodyMedium,
    color: colors.primary[500],
  },
  title: {
    ...typography.h2,
    color: isMichelin ? colors.white : colors.neutral[900],
    marginLeft: 12,
  },
  avatarSection: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.surface.primary,
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  avatarLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.cream[100],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.neutral[200],
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarEmoji: {
    fontSize: 48,
  },
  avatarHint: {
    marginTop: 12,
    color: colors.neutral[700],
    fontSize: 14,
  },
  removeBtn: {
    marginTop: 8,
  },
  removeText: {
    color: colors.error,
    fontSize: 14,
  },
  nicknameSection: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  nicknameLabel: {
    fontSize: 12,
    color: colors.neutral[700],
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  nicknameDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface.raised,
    borderRadius: 12,
  },
  nicknameText: {
    ...typography.h3,
    color: isMichelin ? colors.white : colors.neutral[900],
  },
  nicknameEditIcon: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.primary[500],
  },
  nicknameEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
  },
  nicknameInput: {
    flex: 1,
    fontSize: 18,
    padding: 12,
    backgroundColor: colors.surface.primary,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary[500],
    color: isMichelin ? colors.white : colors.neutral[900],
  },
  nicknameSaveBtn: {
    marginLeft: 8,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nicknameSaveText: {
    fontSize: 20,
    color: '#FFF',
  },
  nicknameCancelBtn: {
    marginLeft: 8,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.neutral[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  nicknameCancelText: {
    fontSize: 20,
    color: '#FFF',
  },
  authSection: {
    marginTop: 16,
    alignItems: 'center',
  },
  userEmail: {
    fontSize: 16,
    color: colors.neutral[700],
    marginBottom: 8,
  },
  guestText: {
    ...typography.h3,
    color: isMichelin ? colors.white : colors.neutral[900],
    marginBottom: 8,
  },
  signInBtn: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  signInText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  signOutBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  signOutText: {
    color: colors.error,
    fontWeight: '600',
    fontSize: 16,
  },
  section: {
    backgroundColor: colors.surface.primary,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    ...typography.h3,
    color: isMichelin ? colors.white : colors.neutral[900],
    marginBottom: 4,
  },
  sectionSub: {
    ...typography.caption,
    color: colors.neutral[700],
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.surface.primary,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  optionRowActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.surface.raised,
  },
  optionLabel: {
    ...typography.bodyMedium,
    color: colors.neutral[900],
  },
  optionLabelActive: {
    color: isMichelin ? colors.gold?.[400] : colors.primary[600],
  },
  optionSuffix: {
    fontSize: 12,
    color: isMichelin ? colors.neutral[500] : colors.neutral[500],
    marginTop: 2,
  },
  checkmark: {
    ...typography.bodyMedium,
    color: colors.primary[500],
  },
  servingsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  servingOption: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: colors.surface.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  servingOptionActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.surface.raised,
  },
  servingText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  servingTextActive: {
    color: isMichelin ? colors.gold?.[400] : colors.primary[600],
  },
  servingsControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginTop: 8,
  },
  servingsButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  servingsButtonText: {
    ...typography.h3,
    color: '#FFF',
  },
servingsValue: {
    ...typography.display,
    color: colors.neutral[900],
    minWidth: 48,
    textAlign: 'center',
  },
toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: isMichelin ? colors.neutral[700] : colors.cream[100],
  },
  toggleLabel: {
    ...typography.body,
    color: colors.neutral[900],
  }
});
