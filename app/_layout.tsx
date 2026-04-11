// app/_layout.tsx
import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';
import { colors } from '../constants/theme';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { session, isLoading, setSession, hasSeenIntention, setHasSeenIntention } = useStore();

  // Listen for auth state changes
  useEffect(() => {
    // Restoring a persisted session (app restart) — skip the candle screen
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setHasSeenIntention(true);
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Only show the candle screen on a fresh SIGNED_IN event
      if (event === 'SIGNED_IN') {
        setHasSeenIntention(false);
      }
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Redirect based on auth state
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      // Send new logins to the intention screen; if already seen today, go home
      if (hasSeenIntention) {
        router.replace('/(main)/home');
      } else {
        router.replace('/(main)/intention');
      }
    }
  }, [session, isLoading, segments]);

  if (isLoading) {
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
      <Slot />
    </>
  );
}
