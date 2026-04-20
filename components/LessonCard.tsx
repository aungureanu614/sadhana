// components/LessonCard.tsx
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, textStyles, spacing, radius } from '../constants/theme';
import type { ActionType, Lesson } from '../types';

const actionLabels: Record<ActionType, { label: string; color: string }> = {
  quiz: { label: 'Quiz', color: colors.indigo },
  reflection: { label: 'Reflection', color: colors.clay },
  challenge: { label: 'Challenge', color: colors.terracotta },
  journal: { label: 'Journal', color: colors.sage },
};

interface LessonCardProps {
  lesson: Lesson;
  index: number;
  isCompleted: boolean;
  isNext?: boolean;
  isAnonymous?: boolean;
  onPress: () => void;
}

export function LessonCard({
  lesson,
  index,
  isCompleted,
  isNext,
  isAnonymous,
  onPress,
}: LessonCardProps) {
  const actionInfo = actionLabels[lesson.action_type] || {
    label: lesson.action_type,
    color: colors.earthMuted,
  };

  return (
    <TouchableOpacity
      style={[styles.card, isNext && styles.cardNext]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      {/* Status dot */}
      {!isAnonymous ? (
        <View
          style={[
            styles.number,
            isCompleted && styles.numberCompleted,
            isNext && styles.numberNext,
          ]}
        >
          {isCompleted ? (
            <Text style={styles.checkmark}>✓</Text>
          ) : isNext ? (
            <Text style={[styles.numberText, { color: colors.white }]}>→</Text>
          ) : (
            <Text style={styles.numberText}>{index}</Text>
          )}
        </View>
      ) : (
        <View style={styles.number}>
          <Text style={styles.numberText}>{index}</Text>
        </View>
      )}

      {/* Lesson info */}
      <View style={styles.info}>
        <Text style={styles.title}>{lesson.title}</Text>
        {lesson.subtitle && <Text style={styles.subtitle}>{lesson.subtitle}</Text>}
        <View style={styles.meta}>
          <View style={[styles.actionBadge, { backgroundColor: actionInfo.color + '18' }]}>
            <Text style={[styles.actionBadgeText, { color: actionInfo.color }]}>
              {actionInfo.label}
            </Text>
          </View>
          {lesson.estimated_minutes && (
            <Text style={styles.duration}>{lesson.estimated_minutes} min</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.sandLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.sandDark,
  },
  cardCompleted: {
    opacity: 0.7,
  },
  cardNext: {
    borderColor: colors.clay,
    borderWidth: 1.5,
  },
  number: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.sand,
    borderWidth: 1.5,
    borderColor: colors.sandDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  numberCompleted: {
    backgroundColor: colors.sage,
    borderColor: colors.sage,
  },
  numberNext: {
    backgroundColor: colors.clay,
    borderColor: colors.clay,
  },
  numberText: {
    ...textStyles.bodySmall,
    fontWeight: '600',
    color: colors.earthMuted,
  },
  checkmark: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  title: {
    ...textStyles.h3,
    fontSize: 16,
    marginBottom: 2,
  },
  subtitle: {
    ...textStyles.bodySmall,
    color: colors.earthMuted,
    marginBottom: spacing.sm,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionBadge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  actionBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  duration: {
    ...textStyles.bodySmall,
    fontSize: 12,
    color: colors.earthMuted,
  },
});
