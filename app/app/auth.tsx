import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { colors } from '@/theme';

export default function AuthScreen() {
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
          placeholderTextColor={colors.neutral[500]}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor={colors.neutral[500]}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream[50],
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
    color: colors.neutral[700],
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.neutral[500],
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    fontSize: 16,
    color: colors.neutral[900],
  },
  button: {
    backgroundColor: colors.primary[500],
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  secondary: {
    backgroundColor: colors.neutral[700],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  error: {
    color: colors.error,
    marginBottom: 8,
    textAlign: 'center',
  },
  skipBtn: {
    marginTop: 24,
    alignSelf: 'center',
  },
  skipText: {
    color: colors.primary[500],
    fontWeight: '500',
  },
});
