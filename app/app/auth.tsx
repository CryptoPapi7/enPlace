import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { typography } from '@/theme';
import { useTheme } from '@/providers/ThemeProvider';

export default function AuthScreen() {
  const { colors } = useTheme();
  const { signInWithEmail, signUpWithEmail } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    try {
      setLoading(true);
      setError(null);
      await signInWithEmail(email.trim(), password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp() {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter an email');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await signUpWithEmail(trimmedEmail, password);
      router.replace('/profile');
    } catch (err: any) {
      setError(err.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignIn() {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter an email');
      return;
    }
    if (!password) {
      setError('Please enter a password');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await signInWithEmail(trimmedEmail, password);
      router.replace('/profile');
    } catch (err: any) {
      setError(err.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    router.back();
  }

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Close Button */}
      <Pressable style={styles.closeBtn} onPress={handleClose}>
        <Text style={styles.closeText}>✕</Text>
      </Pressable>

      <View style={styles.content}>
        <Text style={styles.title}>Account</Text>
        <Text style={styles.subtitle}>Sign in to sync your recipes</Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor={colors.text.muted}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor={colors.text.muted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleSignIn} 
          disabled={loading}
        >
          <Text style={styles.buttonText}>Sign In</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.secondary, loading && styles.buttonDisabled]}
          onPress={handleSignUp}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Create Account</Text>
        </Pressable>

        <Pressable style={styles.skipBtn} onPress={handleClose}>
          <Text style={styles.skipText}>Continue without signing in</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.primary,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeText: {
    fontSize: 24,
    color: colors.text.secondary,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    ...typography.display,
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.muted,
    marginBottom: 32,
  },
  input: {
    backgroundColor: colors.surface.secondary,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    fontSize: 16,
    color: colors.text.primary,
  },
  button: {
    backgroundColor: colors.accent.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  secondary: {
    backgroundColor: colors.surface.raised,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...typography.bodyMedium,
    color: colors.text.inverse,
  },
  error: {
    color: colors.accent.error,
    marginBottom: 8,
    textAlign: 'center',
  },
  skipBtn: {
    marginTop: 24,
    alignSelf: 'center',
  },
  skipText: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
  },
});
