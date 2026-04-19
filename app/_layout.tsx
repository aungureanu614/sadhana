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

  // Listen for auth state changes (kept for future use when login is re-enabled)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setHasSeenIntention(true);
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setHasSeenIntention(false);
      }
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Redirect — skip auth, go straight to main screens
  useEffect(() => {
    if (isLoading) return;

    const inMainGroup = segments[0] === '(main)';

    // If not already in (main), redirect to intention or home
    if (!inMainGroup) {
      if (hasSeenIntention) {
        router.replace('/(main)/home');
      } else {
        router.replace('/(main)/intention');
      }
    }
  }, [isLoading, segments, hasSeenIntention]);

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
