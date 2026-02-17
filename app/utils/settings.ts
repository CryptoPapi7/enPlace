import { supabase, getCurrentUser } from '../lib/supabase';
import { getPreference, setPreference } from '../database/db';
import { Alert } from 'react-native';

export type UnitSystem = 'metric' | 'imperial' | 'baker';

export interface UserSettings {
  unitSystem: UnitSystem;
  defaultServings: number;
}

const DEFAULT_SETTINGS: UserSettings = {
  unitSystem: 'metric',
  defaultServings: 4,
};

const SETTINGS_KEY = 'user_settings';

const showLoginRequired = () => {
  Alert.alert(
    '👨‍🍳 Chef\'s Preference',
    'Your personal settings are saved to your account. Sign in to keep your preferences across devices.',
    [
      { text: 'Maybe Later', style: 'cancel' },
      { text: 'Sign In', onPress: () => { /* Could navigate to auth */ } }
    ]
  );
};

// Check if user is logged in
async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}

// Get current user ID
async function getUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id || null;
}

// Load settings from Supabase (logged-in) or SQLite (logged-out)
export async function loadSettings(): Promise<UserSettings> {
  // For guest users, load from SQLite
  if (!await isAuthenticated()) {
    try {
      const json = await getPreference(SETTINGS_KEY);
      if (json) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(json) };
      }
    } catch (e) {
      console.error('Failed to load settings from SQLite', e);
    }
    return DEFAULT_SETTINGS;
  }

  // For logged-in users, load from Supabase profiles
  const userId = await getUserId();
  if (!userId) return DEFAULT_SETTINGS;

  try {
    console.log('[settings] Loading from Supabase for user:', userId);
    const { data, error } = await supabase
      .from('profiles')
      .select('unit_system, default_servings')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('[settings] Supabase error:', error);
      return DEFAULT_SETTINGS;
    }

    console.log('[settings] Raw data from Supabase:', data);
    const result = {
      unitSystem: (data?.unit_system as UnitSystem) || DEFAULT_SETTINGS.unitSystem,
      defaultServings: data?.default_servings ?? DEFAULT_SETTINGS.defaultServings,
    };
    console.log('[settings] Parsed settings:', result);
    return result;
  } catch (e) {
    console.error('[settings] Failed to load settings', e);
    return DEFAULT_SETTINGS;
  }
}

// Save settings
export async function saveSettings(settings: UserSettings): Promise<boolean> {
  // For guest users, save to SQLite
  if (!await isAuthenticated()) {
    try {
      await setPreference(SETTINGS_KEY, JSON.stringify(settings));
      return true;
    } catch (e) {
      console.error('Failed to save settings to SQLite', e);
      return false;
    }
  }

  // For logged-in users, save to Supabase
  const userId = await getUserId();
  if (!userId) return false;

  try {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        unit_system: settings.unitSystem,
        default_servings: settings.defaultServings,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error saving settings:', error);
      return false;
    }

    return true;
  } catch (e) {
    console.error('Failed to save settings', e);
    return false;
  }
}

// Update a single setting
export async function updateSetting<K extends keyof UserSettings>(
  key: K, 
  value: UserSettings[K]
): Promise<boolean> {
  const settings = await loadSettings();
  const newSettings = { ...settings, [key]: value };
  return saveSettings(newSettings);
}

// Get unit system (convenience method)
export async function getUnitSystem(): Promise<UnitSystem> {
  const settings = await loadSettings();
  return settings.unitSystem;
}
