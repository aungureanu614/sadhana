// app/(main)/library.tsx
import { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useStore } from '../../lib/store';
import { colors, textStyles, spacing, radius } from '../../constants/theme';

const practiceTypeLabels = {
  asana: { label: 'Asana', emoji: '🧘' },
  pranayama: { label: 'Pranayama', emoji: '🌬' },
  meditation: { label: 'Meditation', emoji: '🧠' },
  dharana: { label: 'Dharana', emoji: '🎯' },
};

export default function LibraryScreen() {
  const { practices, fetchPractices } = useStore();

  useEffect(() => {
    fetchPractices();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Practice Library</Text>
      <Text style={styles.subtitle}>
        Explore asana, pranayama, meditation, and concentration practices.
      </Text>

      {practices.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Loading practices...</Text>
        </View>
      ) : (
        <View style={styles.practiceList}>
          {practices.map((practice) => {
            const typeInfo = practiceTypeLabels[practice.type];
            return (
              <TouchableOpacity
                key={practice.id}
                style={styles.practiceCard}
                activeOpacity={0.7}
              >
                <View style={styles.practiceEmoji}>
                  <Text style={{ fontSize: 24 }}>{typeInfo.emoji}</Text>
                </View>
                <View style={styles.practiceInfo}>
                  <Text style={styles.practiceTitle}>{practice.title}</Text>
                  <Text style={styles.practiceMeta}>
                    {typeInfo.label} · {practice.duration_minutes} min · {practice.difficulty}
                  </Text>
                  {practice.description && (
                    <Text style={styles.practiceDescription} numberOfLines={2}>
                      {practice.description}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
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
  title: {
    ...textStyles.h1,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  subtitle: {
    ...textStyles.body,
    color: colors.earthLight,
    marginBottom: spacing.xl,
  },
  emptyState: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    ...textStyles.bodySmall,
    color: colors.earthMuted,
  },
  practiceList: {
    gap: spacing.md,
  },
  practiceCard: {
    flexDirection: 'row',
    backgroundColor: colors.sandLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.sandDark,
  },
  practiceEmoji: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.sand,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  practiceInfo: {
    flex: 1,
  },
  practiceTitle: {
    ...textStyles.h3,
    fontSize: 16,
    marginBottom: 2,
  },
  practiceMeta: {
    ...textStyles.bodySmall,
    color: colors.earthMuted,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  practiceDescription: {
    ...textStyles.bodySmall,
    lineHeight: 20,
  },
});
