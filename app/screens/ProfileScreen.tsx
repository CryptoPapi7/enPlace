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

export default function ProfileScreen({ navigation }: any) {
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
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
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
              trackColor={{ false: '#E0E0E0', true: '#FF8C42' }}
              thumbColor="#FFF"
            />
          </View>
          
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Vegan</Text>
            <Switch
              value={settings.dietary.vegan}
              onValueChange={(v) => updateDietary('vegan', v)}
              trackColor={{ false: '#E0E0E0', true: '#FF8C42' }}
              thumbColor="#FFF"
            />
          </View>
          
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Gluten-Free</Text>
            <Switch
              value={settings.dietary.glutenFree}
              onValueChange={(v) => updateDietary('glutenFree', v)}
              trackColor={{ false: '#E0E0E0', true: '#FF8C42' }}
              thumbColor="#FFF"
            />
          </View>
          
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Dairy-Free</Text>
            <Switch
              value={settings.dietary.dairyFree}
              onValueChange={(v) => updateDietary('dairyFree', v)}
              trackColor={{ false: '#E0E0E0', true: '#FF8C42' }}
              thumbColor="#FFF"
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
              trackColor={{ false: '#E0E0E0', true: '#FF8C42' }}
              thumbColor="#FFF"
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
              trackColor={{ false: '#E0E0E0', true: '#FF8C42' }}
              thumbColor="#FFF"
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
              trackColor={{ false: '#E0E0E0', true: '#FF8C42' }}
              thumbColor="#FFF"
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E7',
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
    color: '#87CEEB',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#5D4E37',
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 3,
    borderColor: '#E8E8E8',
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
  changeAvatarText: {
    fontSize: 14,
    color: '#87CEEB',
    fontWeight: '600',
    marginBottom: 16,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5D4E37',
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  editBtn: {
    backgroundColor: '#FF8C42',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
  },
  editBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5D4E37',
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 13,
    color: '#999',
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionRowActive: {
    borderColor: '#FF8C42',
    backgroundColor: '#FFF8E7',
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5D4E37',
  },
  optionLabelActive: {
    color: '#FF8C42',
  },
  optionSuffix: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  checkmark: {
    fontSize: 18,
    color: '#FF8C42',
    fontWeight: 'bold',
  },
  servingsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  servingOption: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  servingOptionActive: {
    borderColor: '#FF8C42',
    backgroundColor: '#FF8C42',
  },
  servingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5D4E37',
  },
  servingTextActive: {
    color: '#FFF',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#5D4E37',
  },
  toggleSub: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuLabel: {
    fontSize: 16,
    color: '#5D4E37',
  },
  menuArrow: {
    fontSize: 16,
    color: '#87CEEB',
  },
  signOutBtn: {
    marginHorizontal: 24,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#FF6B6B',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
  },
});
