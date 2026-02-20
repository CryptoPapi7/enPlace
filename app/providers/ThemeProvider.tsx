/**
 * Global Theme Provider for EnPlace
 * Supports multiple themes: default (warm) and michelin (fine dining)
 * Persists to Supabase (logged in) or SQLite (logged out)
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getThemeColors, UnifiedColors } from '@/theme';
import { supabase } from '@/lib/supabase';
import { getPreference, setPreference } from '@/database/db';

export type ThemeMode = 'default' | 'michelin';

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  isLoading: boolean;
  colors: UnifiedColors;
  isMichelin: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_PREF_KEY = 'theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('default');
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const systemColorScheme = useColorScheme();

  // Listen for auth changes directly (don't use useAuth to avoid circular dependency)
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user?.id ?? null);
    });

    // Subscribe to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Load saved theme on mount or auth state change
  useEffect(() => {
    loadTheme();
  }, [userId]);

  async function loadTheme() {
    setIsLoading(true);
    try {
      let savedTheme: string | null = null;

      if (userId) {
        // Load from Supabase profiles
        const { data, error } = await supabase
          .from('profiles')
          .select('theme')
          .eq('id', userId)
          .single();
        
        if (!error && data?.theme) {
          savedTheme = data.theme;
        }
      } else {
        // Load from SQLite (anonymous user)
        savedTheme = await getPreference(THEME_PREF_KEY);
      }

      if (savedTheme === 'default' || savedTheme === 'michelin') {
        setThemeModeState(savedTheme);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    // Optimistic update (immediate UI change)
    setThemeModeState(mode);

    try {
      if (userId) {
        // Save to Supabase
        const { error } = await supabase
          .from('profiles')
          .update({ theme: mode })
          .eq('id', userId);
        
        if (error) throw error;
      } else {
        // Save to SQLite
        await setPreference(THEME_PREF_KEY, mode);
      }
    } catch (error) {
      console.error('Failed to save theme:', error);
      // Revert on error
      setThemeModeState(prev => prev);
    }
  }, [userId]);

  // Memoize colors so they don't recalculate on every render
  const colors = useMemo(() => {
    const base = getThemeColors(themeMode) as any;
    // Ensure semantic color tokens exist
    const semantic = {
      text: {
        primary: base.text?.primary ?? base.neutral?.[900] ?? base.white,
        secondary: base.text?.secondary ?? base.neutral?.[700] ?? base.neutral?.[500],
        muted: base.text?.muted ?? base.neutral?.[500],
        inverse: base.text?.inverse ?? base.white,
      },
      surface: {
        primary: base.surface?.primary ?? base.background?.primary ?? base.cream?.[50] ?? base.white,
        secondary: base.surface?.secondary ?? base.background?.secondary ?? base.white,
        raised: base.surface?.raised ?? base.background?.secondary ?? base.white,
        inverse: base.surface?.inverse ?? base.background?.primary ?? base.neutral?.[900],
      },
      border: {
        subtle: base.border?.subtle ?? base.neutral?.[300],
        default: base.border?.default ?? base.neutral?.[400],
        strong: base.border?.strong ?? base.neutral?.[600],
      },
      accent: {
        primary: base.accent?.primary ?? base.primary?.[500],
        success: base.accent?.success ?? base.success,
        error: base.accent?.error ?? base.error,
      },
    };
    return { ...base, ...semantic };
  }, [themeMode]);
  const isMichelin = themeMode === 'michelin';

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, isLoading, colors, isMichelin }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
