import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { AuthProvider } from '@/providers/AuthProvider';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { getNavigationTheme } from '@/theme';
import { ThemeProvider, useTheme } from '@/providers/ThemeProvider';

SplashScreen.preventAutoHideAsync();

// Wrapper component to access theme context
function ThemedNavigation() {
  const { themeMode, isLoading } = useTheme();
  const colorScheme = useColorScheme();

  if (isLoading) {
    return null;
  }

  const navigationTheme = getNavigationTheme(themeMode);

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style={navigationTheme.dark ? 'light' : 'dark'} />
      </AuthProvider>
    </NavigationThemeProvider>
  );
}

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Inter_18pt-Regular': require('../assets/fonts/Inter_18pt-Regular.ttf'),
    'Inter_18pt-Medium': require('../assets/fonts/Inter_18pt-Medium.ttf'),
    'Inter_18pt-SemiBold': require('../assets/fonts/Inter_18pt-SemiBold.ttf'),
    'PlayfairDisplay-Regular': require('../assets/fonts/PlayfairDisplay-Regular.ttf'),
    'PlayfairDisplay-Bold': require('../assets/fonts/PlayfairDisplay-Bold.ttf'),
    'JetBrainsMono-Regular': require('../assets/fonts/JetBrainsMono-Regular.ttf'),
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  SplashScreen.hideAsync();

  return (
    <ThemeProvider>
      <ThemedNavigation />
    </ThemeProvider>
  );
}
