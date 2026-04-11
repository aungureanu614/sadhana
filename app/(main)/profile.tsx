// app/(main)/profile.tsx
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useStore } from '../../lib/store';
import { colors, textStyles, spacing, radius } from '../../constants/theme';

export default function ProfileScreen() {
  const { profile, progress } = useStore();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => supabase.auth.signOut(),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Profile header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.display_name?.charAt(0)?.toUpperCase() || '🕉'}
            </Text>
          </View>
          <Text style={styles.name}>{profile?.display_name || 'Practitioner'}</Text>
          <Text style={styles.tier}>
            {profile?.tier === 'premium' ? 'Premium Member' : 'Free Path'}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{progress.length}</Text>
            <Text style={styles.statLabel}>Lessons{'\n'}Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNumber}>
              {profile?.dosha_result ? '✓' : '—'}
            </Text>
            <Text style={styles.statLabel}>Dosha{'\n'}Assessment</Text>
          </View>
        </View>

        {/* Dosha result */}
        {profile?.dosha_result && (
          <View style={styles.doshaCard}>
            <Text style={styles.doshaLabel}>YOUR PRAKRITI</Text>
            <Text style={styles.doshaResult}>
              {profile.dosha_result.replace('_', '-').charAt(0).toUpperCase() +
                profile.dosha_result.replace('_', '-').slice(1)}
            </Text>
          </View>
        )}

        {/* Upgrade CTA for free users */}
        {profile?.tier === 'free' && (
          <TouchableOpacity style={styles.upgradeCard} activeOpacity={0.8}>
            <Text style={styles.upgradeTitle}>Unlock Your Sadhana</Text>
            <Text style={styles.upgradeText}>
              Get a personalized daily practice based on your unique constitution.
            </Text>
            <View style={styles.upgradeButton}>
              <Text style={styles.upgradeButtonText}>Learn More</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Sign out */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.sand,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.earth,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    color: colors.sand,
    fontSize: 28,
    fontWeight: '300',
  },
  name: {
    ...textStyles.h2,
    marginBottom: spacing.xs,
  },
  tier: {
    ...textStyles.bodySmall,
    color: colors.clay,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.sandLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.sandDark,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    ...textStyles.h1,
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...textStyles.bodySmall,
    textAlign: 'center',
    fontSize: 12,
    color: colors.earthMuted,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.sandDark,
    marginHorizontal: spacing.md,
  },
  doshaCard: {
    backgroundColor: colors.sandLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.sandDark,
  },
  doshaLabel: {
    ...textStyles.caption,
    color: colors.clay,
    marginBottom: spacing.sm,
  },
  doshaResult: {
    ...textStyles.h2,
  },
  upgradeCard: {
    backgroundColor: colors.earth,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  upgradeTitle: {
    ...textStyles.h3,
    color: colors.sand,
    marginBottom: spacing.sm,
  },
  upgradeText: {
    ...textStyles.bodySmall,
    color: colors.sandDark,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  upgradeButton: {
    backgroundColor: colors.clay,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  signOutButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  signOutText: {
    ...textStyles.bodySmall,
    color: colors.terracotta,
  },
});
