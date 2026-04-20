// app/(main)/intention.tsx
import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../../lib/store';
import { Candle } from '../../components/Candle';
import { colors, spacing } from '../../constants/theme';

export default function IntentionScreen() {
  const router = useRouter();
  const { currentQuote, fetchRandomQuote, saveIntentionTimestamp, profile, fetchProfile } =
    useStore();

  const [hasLit, setHasLit] = useState(false);

  // Animations
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const quoteOpacity = useRef(new Animated.Value(0)).current;
  const tapHintOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchRandomQuote();
    fetchProfile();

    // Fade in the screen
    Animated.timing(contentOpacity, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start(() => {
      // Once the screen has faded in, fade in the quote
      Animated.timing(quoteOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    });

    // Pulse the tap hint
    Animated.loop(
      Animated.sequence([
        Animated.timing(tapHintOpacity, {
          toValue: 0.3,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(tapHintOpacity, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const handleCandleTap = () => {
    if (hasLit) return;
    setHasLit(true);

    // Hide the tap hint
    Animated.timing(tapHintOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Fade out the whole screen, then navigate to Today
    setTimeout(() => {
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        saveIntentionTimestamp();
        router.replace('/(main)/home');
      });
    }, 3000);
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: contentOpacity }]}>
        {/* Title + Greeting */}
        <View style={styles.titleArea}>
          <Text style={styles.appTitle}>Sadhana</Text>
          <Text style={styles.greeting}>
            {getGreeting()}
            {profile?.display_name ? `, ${profile.display_name}` : ''}
          </Text>
          {!hasLit && <Text style={styles.subtitle}>Light the candle to get started</Text>}
        </View>

        {/* Candle */}
        <View style={styles.candleArea}>
          <Candle size={220} onPress={handleCandleTap} />

          {/* Tap hint */}
          {!hasLit && (
            <Animated.Text style={[styles.tapHint, { opacity: tapHintOpacity }]}>
              tap the candle
            </Animated.Text>
          )}
        </View>

        {/* Quote — fades in after candle is lit */}
        <Animated.View style={[styles.quoteArea, { opacity: quoteOpacity }]}>
          {currentQuote && (
            <>
              <Text style={styles.quoteText}>"{currentQuote.body}"</Text>
              {currentQuote.source && (
                <Text style={styles.quoteSource}>— {currentQuote.source}</Text>
              )}
            </>
          )}
        </Animated.View>
      </Animated.View>
    </View>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.earthDark,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  titleArea: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: '200',
    color: colors.sand,
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '300',
    color: colors.sand,
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 15,
    color: colors.sandDark,
    fontStyle: 'italic',
    letterSpacing: 0.3,
  },
  candleArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  tapHint: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.sandDark,
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
  quoteArea: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    minHeight: 80,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: colors.sand,
    textAlign: 'center',
    lineHeight: 26,
    letterSpacing: 0.3,
  },
  quoteSource: {
    marginTop: spacing.sm,
    fontSize: 13,
    color: colors.sandDark,
    letterSpacing: 0.5,
  },
});
