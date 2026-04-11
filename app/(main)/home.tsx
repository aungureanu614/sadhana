// app/(main)/home.tsx
import { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../../lib/store';
import { colors, textStyles, spacing, radius } from '../../constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { profile, fetchProfile, fetchPaths, paths } = useStore();

  useEffect(() => {
    fetchProfile();
    fetchPaths();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Greeting */}
      <View style={styles.greeting}>
        <Text style={styles.greetingText}>
          Namaste{profile?.display_name ? `, ${profile.display_name}` : ''}
        </Text>
        <Text style={styles.greetingSubtext}>What calls to your practice today?</Text>
      </View>

      {/* Daily Practice Card */}
      <TouchableOpacity style={styles.dailyCard} activeOpacity={0.8}>
        <Text style={styles.dailyLabel}>TODAY'S PRACTICE</Text>
        <Text style={styles.dailyTitle}>Grounding Flow</Text>
        <Text style={styles.dailyMeta}>15 min · Asana · Beginner</Text>
        <View style={styles.dailyButton}>
          <Text style={styles.dailyButtonText}>Begin Practice</Text>
        </View>
      </TouchableOpacity>

      {/* 8 limbs */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Learning Journey</Text>
        <TouchableOpacity
          style={styles.continueCard}
          activeOpacity={0.7}
          onPress={() => router.push('/(main)/journey')}
        >
          <View style={styles.continueInfo}>
            <Text style={styles.continueModule}>8 Limbs of Yoga</Text>
            <Text style={styles.continuePath}>Liberation path</Text>
            <Text style={styles.continueMeta}>4 lessons</Text>
          </View>
          <View style={styles.continueArrow}>
            <Text style={{ color: colors.clay, fontSize: 20 }}>→</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Chakra system */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.continueCard} activeOpacity={0.7} onPress={() => null}>
          <View style={styles.continueInfo}>
            <Text style={styles.continueModule}>Biopsychology of yoga</Text>
            <Text style={styles.continuePath}>Chakra system</Text>
            <Text style={styles.continueMeta}>coming soon</Text>
          </View>
          <View style={styles.continueArrow}>
            <Text style={{ color: colors.clay, fontSize: 20 }}>→</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* ayurveda*/}
      <View style={styles.section}>
        <TouchableOpacity style={styles.continueCard} activeOpacity={0.7} onPress={() => null}>
          <View style={styles.continueInfo}>
            <Text style={styles.continueModule}>Ayurveda</Text>
            <Text style={styles.continuePath}>Holistic healing</Text>
            <Text style={styles.continueMeta}>coming soon</Text>
          </View>
          <View style={styles.continueArrow}>
            <Text style={{ color: colors.clay, fontSize: 20 }}>→</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* mantras */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.continueCard} activeOpacity={0.7} onPress={() => null}>
          <View style={styles.continueInfo}>
            <Text style={styles.continueModule}>Mantras</Text>
            <Text style={styles.continuePath}>Chanting and Meditation</Text>
            <Text style={styles.continueMeta}>coming soon</Text>
          </View>
          <View style={styles.continueArrow}>
            <Text style={{ color: colors.clay, fontSize: 20 }}>→</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* mudras */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.continueCard} activeOpacity={0.7} onPress={() => null}>
          <View style={styles.continueInfo}>
            <Text style={styles.continueModule}>Mudras</Text>
            <Text style={styles.continuePath}>Energy Gestures</Text>
            <Text style={styles.continueMeta}>coming soon</Text>
          </View>
          <View style={styles.continueArrow}>
            <Text style={{ color: colors.clay, fontSize: 20 }}>→</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* sanskrit basics */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.continueCard} activeOpacity={0.7} onPress={() => null}>
          <View style={styles.continueInfo}>
            <Text style={styles.continueModule}>Sanskrit Basics</Text>
            <Text style={styles.continuePath}>Language and Pronunciation</Text>
            <Text style={styles.continueMeta}>coming soon</Text>
          </View>
          <View style={styles.continueArrow}>
            <Text style={{ color: colors.clay, fontSize: 20 }}>→</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Daily Intention */}
      <View style={styles.section}>
        <View style={styles.intentionCard}>
          <Text style={styles.intentionQuote}>
            "Yoga is the journey of the self, through the self, to the self."
          </Text>
          <Text style={styles.intentionSource}>— Bhagavad Gita</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.sand,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  greeting: {
    marginBottom: spacing.xl,
    marginTop: spacing.sm,
  },
  greetingText: {
    ...textStyles.h1,
    marginBottom: spacing.xs,
  },
  greetingSubtext: {
    ...textStyles.bodySmall,
    fontStyle: 'italic',
  },
  dailyCard: {
    backgroundColor: colors.earth,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  dailyLabel: {
    ...textStyles.caption,
    color: colors.clayLight,
    marginBottom: spacing.sm,
  },
  dailyTitle: {
    ...textStyles.h2,
    color: colors.sand,
    marginBottom: spacing.xs,
  },
  dailyMeta: {
    ...textStyles.bodySmall,
    color: colors.sandDark,
    marginBottom: spacing.lg,
  },
  dailyButton: {
    backgroundColor: colors.clay,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
  },
  dailyButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: 0.3,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...textStyles.caption,
    marginBottom: spacing.md,
  },
  continueCard: {
    backgroundColor: colors.sandLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.sandDark,
  },
  continueInfo: {
    flex: 1,
  },
  continuePath: {
    ...textStyles.bodySmall,
    color: colors.clay,
    fontWeight: '600',
    marginBottom: 2,
  },
  continueModule: {
    ...textStyles.h3,
    marginBottom: spacing.xs,
  },
  continueMeta: {
    ...textStyles.bodySmall,
  },
  continueArrow: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.sandDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  intentionCard: {
    backgroundColor: colors.sandLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.clay,
  },
  intentionQuote: {
    ...textStyles.body,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  intentionSource: {
    ...textStyles.bodySmall,
    color: colors.earthMuted,
  },
});
