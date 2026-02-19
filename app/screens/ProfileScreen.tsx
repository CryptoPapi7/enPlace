import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Switch, Image, Alert } from "react-native";
import { useState, useEffect } from "react";
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { getAvatar, saveAvatar, clearAvatar } from "../utils/avatar";

const MEASUREMENT_OPTIONS = [
  { id: 'metric', label: 'Metric', suffix: 'kg/ml' },
  { id: 'imperial', label: 'US Imperial', suffix: 'lb/cup' },
  { id: 'baker', label: 'Baker', suffix: 'g/ml' },
];

interface Settings {
  unitSystem: 'metric' | 'imperial' | 'baker';
  defaultServings: number;
  dietary: {
    vegetarian: boolean;
    vegan: boolean;
    glutenFree: boolean;
    dairyFree: boolean;
  };
  notifications: {
    mealReminders: boolean;
    shoppingReminders: boolean;
    newRecipes: boolean;
  };
}

import { useTheme } from '../providers/ThemeProvider';
import { layout } from '../theme/spacing';

export default function ProfileScreen({ navigation }: any) {
  const { colors, isMichelin, setThemeMode } = useTheme();

  const [settings, setSettings] = useState<Settings>({
    unitSystem: 'imperial',
    defaultServings: 4,
    dietary: {
      vegetarian: false,
      vegan: false,
      glutenFree: false,
      dairyFree: false,
    },
    notifications: {
      mealReminders: true,
      shoppingReminders: true,
      newRecipes: false,
    },
  });
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  useEffect(() => {
    loadAvatar();
  }, []);

  const loadAvatar = async () => {
    const avatar = await getAvatar();
    if (avatar) {
      setAvatarUri(avatar.uri);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to upload an avatar.');
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
  };

  const removeAvatar = async () => {
    await clearAvatar();
    setAvatarUri(null);
  };

  // Create styles based on current theme
  const styles = createStyles(colors, isMichelin);

  const updateSetting = (key: keyof Settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateDietary = (key: keyof Settings['dietary'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      dietary: { ...prev.dietary, [key]: value }
    }));
  };

  const updateNotifications = (key: keyof Settings['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value }
    }));
  };

  return (
    <SafeAreaView style={styles.container} key={isMichelin ? 'michelin' : 'classic'}>
      <StatusBar style={isMichelin ? 'light' : 'dark'} />
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Profile & Settings</Text>
        </View>

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarLarge} onPress={pickImage}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarEmoji}>👤</Text>
            )}
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Tap to change photo</Text>
          <Text style={styles.username}>Chef Guest</Text>
          <Text style={styles.joinDate}>Joined February 2025</Text>
          {avatarUri && (
            <TouchableOpacity style={styles.removeBtn} onPress={() => {
              clearAvatar();
              setAvatarUri(null);
            }}>
              <Text style={styles.removeBtnText}>Remove Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Theme Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 Theme</Text>
          <Text style={styles.sectionSub}>Customize your cooking experience</Text>
          
          <View style={styles.themeRow}>
            <TouchableOpacity
              style={[
                styles.themeOption,
                !isMichelin && styles.themeOptionActive
              ]}
              onPress={() => setThemeMode('default')}
            >
              <Text style={styles.themeEmoji}>☀️</Text>
              <Text style={[
                styles.themeLabel,
                !isMichelin && styles.themeLabelActive
              ]}>
                Classic
              </Text>
              <Text style={styles.themeSub}>Warm & Cozy</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.themeOption,
                isMichelin && styles.themeOptionActive
              ]}
              onPress={() => setThemeMode('michelin')}
            >
              <Text style={styles.themeEmoji}>🍷</Text>
              <Text style={[
                styles.themeLabel,
                isMichelin && styles.themeLabelActive
              ]}>
                Michelin
              </Text>
              <Text style={styles.themeSub}>Fine Dining</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Default Measurements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚖️ Default Measurements</Text>
          <Text style={styles.sectionSub}>Applies to all recipes</Text>
          
          {MEASUREMENT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionRow,
                settings.unitSystem === option.id && styles.optionRowActive
              ]}
              onPress={() => updateSetting('unitSystem', option.id)}
            >
              <View>
                <Text style={[
                  styles.optionLabel,
                  settings.unitSystem === option.id && styles.optionLabelActive
                ]}>
                  {option.label}
                </Text>
                <Text style={styles.optionSuffix}>{option.suffix}</Text>
              </View>
              {settings.unitSystem === option.id && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Default Servings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 Default Servings</Text>
          <View style={styles.servingsRow}>
            {[2, 4, 6, 8].map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.servingOption,
                  settings.defaultServings === num && styles.servingOptionActive
                ]}
                onPress={() => updateSetting('defaultServings', num)}
              >
                <Text style={[
                  styles.servingText,
                  settings.defaultServings === num && styles.servingTextActive
                ]}>
                  {num}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Dietary Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🥗 Dietary Preferences</Text>
          <Text style={styles.sectionSub}>Filter recipes automatically</Text>
          
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Vegetarian</Text>
            <Switch
              value={settings.dietary.vegetarian}
              onValueChange={(v) => updateDietary('vegetarian', v)}
              trackColor={{ false: colors.neutral[200], true: colors.primary[500] }}
              thumbColor={colors.white}
            />
          </View>
          
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Vegan</Text>
            <Switch
              value={settings.dietary.vegan}
              onValueChange={(v) => updateDietary('vegan', v)}
              trackColor={{ false: colors.neutral[200], true: colors.primary[500] }}
              thumbColor={colors.white}
            />
          </View>
          
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Gluten-Free</Text>
            <Switch
              value={settings.dietary.glutenFree}
              onValueChange={(v) => updateDietary('glutenFree', v)}
              trackColor={{ false: colors.neutral[200], true: colors.primary[500] }}
              thumbColor={colors.white}
            />
          </View>
          
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Dairy-Free</Text>
            <Switch
              value={settings.dietary.dairyFree}
              onValueChange={(v) => updateDietary('dairyFree', v)}
              trackColor={{ false: colors.neutral[200], true: colors.primary[500] }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 Notifications</Text>
          
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>Meal Reminders</Text>
              <Text style={styles.toggleSub}>30 min before cooking</Text>
            </View>
            <Switch
              value={settings.notifications.mealReminders}
              onValueChange={(v) => updateNotifications('mealReminders', v)}
              trackColor={{ false: colors.neutral[200], true: colors.primary[500] }}
              thumbColor={colors.white}
            />
          </View>
          
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>Shopping Reminders</Text>
              <Text style={styles.toggleSub}>Day before grocery run</Text>
            </View>
            <Switch
              value={settings.notifications.shoppingReminders}
              onValueChange={(v) => updateNotifications('shoppingReminders', v)}
              trackColor={{ false: colors.neutral[200], true: colors.primary[500] }}
              thumbColor={colors.white}
            />
          </View>
          
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>New Recipes</Text>
              <Text style={styles.toggleSub}>Weekly fresh drops</Text>
            </View>
            <Switch
              value={settings.notifications.newRecipes}
              onValueChange={(v) => updateNotifications('newRecipes', v)}
              trackColor={{ false: colors.neutral[200], true: colors.primary[500] }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Account</Text>
          <TouchableOpacity style={styles.menuRow}>
            <Text style={styles.menuLabel}>Export My Data</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuRow}>
            <Text style={styles.menuLabel}>Privacy Policy</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuRow}>
            <Text style={styles.menuLabel}>Terms of Service</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutBtn}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Use plain object instead of StyleSheet.create for dynamic theming
const createStyles = (colors: any, isMichelin: boolean) => ({
  container: {
    flex: 1,
    backgroundColor: isMichelin ? colors.background?.primary : colors.cream[50],
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 20,
  },
  backText: {
    fontSize: 16,
    color: colors.primary[400],
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.neutral[900],
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: isMichelin ? colors.background?.secondary : colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 3,
    borderColor: colors.neutral[200],
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarEmoji: {
    fontSize: 50,
  },
  avatarHint: {
    fontSize: 14,
    color: colors.primary[400],
    fontWeight: '600',
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.neutral[900],
    marginBottom: 4,
    marginTop: 12,
  },
  joinDate: {
    fontSize: 14,
    color: colors.neutral[700],
    marginBottom: 16,
  },
  removeBtn: {
    marginTop: 8,
  },
  removeBtnText: {
    fontSize: 14,
    color: colors.error,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: layout.screenGutter,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 13,
    color: colors.neutral[700],
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: isMichelin ? colors.background?.secondary : colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionRowActive: {
    borderColor: colors.primary[500],
    backgroundColor: isMichelin ? colors.background?.tertiary : colors.cream[50],
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  optionLabelActive: {
    color: colors.primary[500],
  },
  optionSuffix: {
    fontSize: 13,
    color: colors.neutral[700],
    marginTop: 2,
  },
  checkmark: {
    fontSize: 18,
    color: colors.primary[500],
    fontWeight: 'bold',
  },
  servingsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  servingOption: {
    flex: 1,
    backgroundColor: isMichelin ? colors.background?.secondary : colors.white,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  servingOptionActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[500],
  },
  servingText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  servingTextActive: {
    color: colors.white,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: isMichelin ? colors.background?.secondary : colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.neutral[900],
  },
  toggleSub: {
    fontSize: 13,
    color: colors.neutral[700],
    marginTop: 2,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: isMichelin ? colors.background?.secondary : colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuLabel: {
    fontSize: 16,
    color: colors.neutral[900],
  },
  menuArrow: {
    fontSize: 16,
    color: colors.primary[400],
  },
  signOutBtn: {
    marginHorizontal: 24,
    backgroundColor: isMichelin ? colors.background?.secondary : colors.white,
    borderWidth: 2,
    borderColor: colors.error,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  themeOption: {
    flex: 1,
    backgroundColor: isMichelin ? colors.background?.secondary : colors.white,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeOptionActive: {
    borderColor: colors.primary[500],
    backgroundColor: isMichelin ? colors.background?.tertiary : colors.cream[50],
  },
  themeEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  themeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  themeLabelActive: {
    color: colors.primary[500],
  },
  themeSub: {
    fontSize: 13,
    color: colors.neutral[700],
    marginTop: 2,
  },
});
