// app/(main)/profile.tsx
import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useStore } from '../../lib/store';
import { colors, textStyles, spacing, radius } from '../../constants/theme';

// ── Helpers ──

function formatMonth(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function computeStreak(progress: { completed_at: string }[]): number {
  if (progress.length === 0) return 0;
  const days = new Set(progress.map((p) => p.completed_at.split('T')[0]));
  const sorted = Array.from(days).sort().reverse();
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < sorted.length; i++) {
    const expected = new Date(today);
    expected.setDate(today.getDate() - i);
    const expectedStr = expected.toISOString().split('T')[0];
    if (sorted[i] === expectedStr) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function computeMinutes(
  progress: { lesson_id: string }[],
  lessons: { id: string; estimated_minutes: number | null }[],
): number {
  let total = 0;
  const lessonMap = new Map(lessons.map((l) => [l.id, l.estimated_minutes || 0]));
  for (const p of progress) {
    total += lessonMap.get(p.lesson_id) || 5;
  }
  return total;
}

// ── Anonymous Profile ──

function AnonymousProfile() {
  const router = useRouter();
  const { localDoshaResult } = useStore();

  const features = [
    'Save your lesson progress',
    'Set daily intentions',
    'Track your mood',
    'Keep a private journal',
    'Get personalized recommendations',
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={styles.anonHero}>
        <View style={styles.anonAvatar}>
          <Ionicons name="person-outline" size={36} color={colors.earthMuted} />
        </View>
        <Text style={styles.anonHeadline}>Your practice, saved</Text>
        <Text style={styles.anonBody}>
          Create a free account to track your progress, save journal reflections, and get
          personalized recommendations.
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.8}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.primaryButtonText}>Create free account</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.signInLink}>Already have an account? Sign in</Text>
        </TouchableOpacity>
      </View>

      {/* Dosha teaser */}
      <TouchableOpacity
        style={styles.doshaTeaser}
        activeOpacity={0.7}
        onPress={() => router.push('/(main)/quiz' as any)}
      >
        <Text style={styles.doshaTeaserTitle}>
          {localDoshaResult ? 'Your dosha result' : 'Discover your dosha'}
        </Text>
        <Text style={styles.doshaTeaserSubtitle}>
          {localDoshaResult
            ? `Primary: ${Object.entries(localDoshaResult).reduce((a, b) => (b[1] > a[1] ? b : a))[0]}`
            : 'Take a 2-minute quiz to unlock personalized practice recommendations.'}
        </Text>
        {!localDoshaResult && <Text style={styles.doshaTeaserButton}>Take the quiz</Text>}
      </TouchableOpacity>

      {/* Feature list */}
      <View style={styles.featureSection}>
        <Text style={styles.featureLabel}>WHAT YOU'LL UNLOCK</Text>
        {features.map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color={colors.sage} />
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// ── Authenticated Profile ──

function AuthenticatedProfile() {
  const router = useRouter();
  const { profile, progress, lessons } = useStore();

  const streak = useMemo(() => computeStreak(progress as any), [progress]);
  const minutes = useMemo(() => computeMinutes(progress, lessons), [progress, lessons]);

  const doshaName = profile?.dosha_result
    ? profile.dosha_result.replace(/_/g, '-').replace(/\b\w/g, (c) => c.toUpperCase())
    : null;

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => supabase.auth.signOut() },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.screenTitle}>Profile</Text>

      {/* User header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile?.display_name?.charAt(0)?.toUpperCase() || '🕉'}
          </Text>
        </View>
        <Text style={styles.displayName}>{profile?.display_name || 'Practitioner'}</Text>
        {profile?.created_at && (
          <Text style={styles.since}>Practicing since {formatMonth(profile.created_at)}</Text>
        )}
        <View style={styles.tierBadge}>
          <Text style={styles.tierBadgeText}>
            {profile?.tier === 'premium' ? 'Premium' : 'Free'}
          </Text>
        </View>
      </View>

      {/* Stats row — 3 cards */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{progress.length}</Text>
          <Text style={styles.statLabel}>Lessons</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={[styles.statNumber, { color: colors.clay }]}>{streak}</Text>
          <Text style={styles.statLabel}>Day streak</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{minutes}</Text>
          <Text style={styles.statLabel}>Minutes</Text>
        </View>
      </View>

      {/* Dosha card or teaser */}
      {doshaName ? (
        <View style={styles.doshaCard}>
          <Text style={styles.doshaCardLabel}>YOUR CONSTITUTION</Text>
          <Text style={styles.doshaCardName}>{doshaName}</Text>
          <TouchableOpacity onPress={() => router.push('/(main)/quiz' as any)}>
            <Text style={styles.retakeLink}>Retake quiz →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.doshaTeaser}
          activeOpacity={0.7}
          onPress={() => router.push('/(main)/quiz' as any)}
        >
          <Text style={styles.doshaTeaserTitle}>Discover your dosha</Text>
          <Text style={styles.doshaTeaserSubtitle}>
            Take a 2-minute quiz to unlock personalized practice recommendations.
          </Text>
          <Text style={styles.doshaTeaserButton}>Take the quiz</Text>
        </TouchableOpacity>
      )}

      {/* Settings */}
      <View style={styles.settingsSection}>
        <Text style={styles.settingsLabel}>SETTINGS</Text>
        <View style={styles.settingsList}>
          <View style={styles.settingsItem}>
            <Text style={styles.settingsItemText}>Edit profile</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.earthMuted} />
          </View>
          <View style={styles.settingsItemBorder} />
          <View style={styles.settingsItem}>
            <Text style={styles.settingsItemText}>Subscription</Text>
            <Text style={styles.settingsItemValue}>
              {profile?.tier === 'premium' ? 'Premium' : 'Free'}
            </Text>
          </View>
          <View style={styles.settingsItemBorder} />
          <View style={styles.settingsItem}>
            <Text style={styles.settingsItemText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.earthMuted} />
          </View>
        </View>
      </View>

      {/* Sign out */}
      <TouchableOpacity style={styles.signOutCard} onPress={handleSignOut} activeOpacity={0.7}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ── Main export ──

export default function ProfileScreen() {
  const { session } = useStore();
  return session ? <AuthenticatedProfile /> : <AnonymousProfile />;
}

// ── Styles ──

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sand },
  scrollContent: { padding: spacing.lg, paddingBottom: spacing.xxl + 40 },

  screenTitle: { ...textStyles.h1, marginBottom: spacing.lg, marginTop: spacing.sm },

  // ── Anonymous ──
  anonHero: { alignItems: 'center', marginBottom: spacing.xl },
  anonAvatar: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.sandDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  anonHeadline: { ...textStyles.h2, marginBottom: spacing.sm, textAlign: 'center' },
  anonBody: {
    ...textStyles.body,
    color: colors.earthLight,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
    lineHeight: 24,
  },
  primaryButton: {
    backgroundColor: colors.clay,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    marginBottom: spacing.md,
    width: '100%',
  },
  primaryButtonText: { color: colors.white, fontWeight: '600', fontSize: 16 },
  signInLink: { color: colors.earthMuted, fontSize: 14, marginTop: spacing.xs },

  // Dosha teaser (shared)
  doshaTeaser: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.clay,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  doshaTeaserTitle: { ...textStyles.h3, marginBottom: spacing.xs },
  doshaTeaserSubtitle: {
    ...textStyles.bodySmall,
    color: colors.earthLight,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  doshaTeaserButton: { color: colors.clay, fontWeight: '600', fontSize: 15 },

  // Feature list
  featureSection: { marginBottom: spacing.xl },
  featureLabel: { ...textStyles.caption, color: colors.clay, marginBottom: spacing.md },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm + 2,
  },
  featureText: { ...textStyles.body, fontSize: 15 },

  // ── Authenticated ──
  header: { alignItems: 'center', marginBottom: spacing.xl },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.earth,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: { color: colors.sand, fontSize: 28, fontWeight: '300' },
  displayName: { ...textStyles.h2, marginBottom: spacing.xs },
  since: { ...textStyles.bodySmall, color: colors.earthMuted, marginBottom: spacing.sm },
  tierBadge: {
    backgroundColor: colors.sage,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  tierBadgeText: { color: colors.white, fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.sandLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.sandDark,
  },
  stat: { flex: 1, alignItems: 'center' },
  statNumber: { ...textStyles.h1, fontSize: 24, marginBottom: spacing.xs },
  statLabel: {
    ...textStyles.bodySmall,
    textAlign: 'center',
    fontSize: 12,
    color: colors.earthMuted,
  },
  statDivider: { width: 1, backgroundColor: colors.sandDark, marginHorizontal: spacing.sm },

  // Dosha card (auth)
  doshaCard: {
    backgroundColor: colors.earth,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  doshaCardLabel: { ...textStyles.caption, color: colors.clay, marginBottom: spacing.sm },
  doshaCardName: { ...textStyles.h1, color: colors.sand, marginBottom: spacing.md },
  retakeLink: { color: colors.clayLight, fontSize: 14, fontWeight: '500' },

  // Settings
  settingsSection: { marginBottom: spacing.lg },
  settingsLabel: { ...textStyles.caption, color: colors.clay, marginBottom: spacing.md },
  settingsList: {
    backgroundColor: colors.sandLight,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.sandDark,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
  },
  settingsItemBorder: { height: 1, backgroundColor: colors.sandDark, marginHorizontal: spacing.lg },
  settingsItemText: { ...textStyles.body, fontSize: 15 },
  settingsItemValue: { ...textStyles.bodySmall, color: colors.earthMuted },

  // Sign out
  signOutCard: {
    borderWidth: 1,
    borderColor: colors.terracotta,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  signOutText: { color: colors.terracotta, fontWeight: '500', fontSize: 15 },
});
