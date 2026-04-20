// app/(auth)/login.tsx
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { useStore } from '../../lib/store';
import { useRouter } from 'expo-router';
import { colors, textStyles, spacing, radius } from '../../constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);
  const [loading, setLoading] = useState(false);
  const { localDoshaResult, saveDoshaResult } = useStore();

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Please fill in all fields');
      return;
    }

    setLoading(true);

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        // Persist local dosha result if it exists
        if (localDoshaResult && data.session) {
          await saveDoshaResult(localDoshaResult);
        }
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) Alert.alert('Error', error.message);
    }

    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Dismiss */}
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={() => {
            if (router.canDismiss()) {
              router.dismiss();
            } else if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(main)/home');
            }
          }}
        >
          <Text style={styles.dismissText}>✕</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appName}>Sadhana</Text>
          <Text style={styles.welcome}>{isSignUp ? 'Welcome to Sadhana' : 'Welcome back'}</Text>
          <Text style={styles.tagline}>
            {isSignUp
              ? 'Begin your journey with a free account.'
              : 'Sign in to continue your practice.'}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.earthMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.earthMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[
              styles.button,
              isSignUp && styles.buttonSignup,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleAuth}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.switchButton} onPress={() => setIsSignUp(!isSignUp)}>
            <Text style={styles.switchText}>
              {isSignUp ? 'Already have an account? Sign in' : 'New to the path? Create an account'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.sand,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  dismissButton: {
    position: 'absolute',
    top: spacing.xxl + spacing.md,
    right: 0,
    padding: spacing.sm,
  },
  dismissText: {
    fontSize: 22,
    color: colors.earthMuted,
    fontWeight: '300',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  appName: {
    fontSize: 40,
    fontWeight: '300',
    color: colors.earth,
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  welcome: {
    ...textStyles.h2,
    marginBottom: spacing.xs,
  },
  tagline: {
    ...textStyles.bodySmall,
    color: colors.earthMuted,
    textAlign: 'center',
  },
  form: {
    gap: spacing.md,
  },
  input: {
    backgroundColor: colors.sandLight,
    borderWidth: 1,
    borderColor: colors.sandDark,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.earth,
  },
  button: {
    backgroundColor: colors.earth,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonSignup: {
    backgroundColor: colors.clay,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.sand,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  switchButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  switchText: {
    ...textStyles.bodySmall,
    color: colors.clay,
  },
});
