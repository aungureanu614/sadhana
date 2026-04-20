// app/_layout.tsx
import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';
import { colors } from '../constants/theme';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const {
    session,
    isLoading,
    setSession,
    hasSeenIntention,
    setHasSeenIntention,
    intentionChecked,
    checkIntentionTimestamp,
  } = useStore();

  // Check AsyncStorage for 24-hour intention gating
  useEffect(() => {
    checkIntentionTimestamp();
  }, []);

  // Listen for auth state changes (kept for future use when login is re-enabled)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Redirect — skip auth, go straight to main screens
  useEffect(() => {
    if (isLoading || !intentionChecked) return;

    const inMainGroup = segments[0] === '(main)';
    const inAuthGroup = segments[0] === '(auth)';

    // If user is authenticated and on the auth screen, dismiss the modal
    if (session && inAuthGroup) {
      if (router.canDismiss()) {
        router.dismiss();
      } else {
        router.replace('/(main)/home');
      }
      return;
    }

    // If not in (main) or (auth), redirect to main screens
    if (!inMainGroup && !inAuthGroup) {
      if (hasSeenIntention) {
        router.replace('/(main)/home');
      } else {
        router.replace('/(main)/intention');
      }
    }
  }, [isLoading, segments, hasSeenIntention, intentionChecked]);

  if (isLoading || !intentionChecked) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.sand,
        }}
      >
        <ActivityIndicator size="large" color={colors.clay} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(main)" />
        <Stack.Screen name="(auth)" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}
