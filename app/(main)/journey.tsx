// app/(main)/journey.tsx
import { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../lib/store';
import { colors, textStyles, spacing, radius } from '../../constants/theme';

export default function JourneyScreen() {
  const router = useRouter();
  const {
    session,
    paths,
    modules,
    lessons,
    progress,
    fetchPaths,
    fetchModules,
    fetchLessons,
    fetchProgress,
    getModulesForPath,
  } = useStore();

  const isAuthenticated = !!session;

  useEffect(() => {
    fetchPaths();
    if (isAuthenticated) fetchProgress();
  }, [isAuthenticated]);

  // When paths load, fetch modules for all paths
  useEffect(() => {
    paths.forEach((p) => fetchModules(p.id));
  }, [paths]);

  // Fetch lessons for all loaded modules
  useEffect(() => {
    modules.forEach((m) => {
      const hasLessons = lessons.some((l) => l.module_id === m.id);
      if (!hasLessons) fetchLessons(m.id);
    });
  }, [modules]);

  // Determine active path: first path with user progress, or first published path
  const activePath = useMemo(() => {
    if (!isAuthenticated || progress.length === 0) return paths[0] || null;
    for (const p of progress) {
      const lesson = lessons.find((l) => l.id === p.lesson_id);
      if (lesson) {
        const mod = modules.find((m) => m.id === lesson.module_id);
        if (mod) {
          const path = paths.find((pt) => pt.id === mod.path_id);
          if (path) return path;
        }
      }
    }
    return paths[0] || null;
  }, [paths, progress, lessons, modules, isAuthenticated]);

  const otherPaths = paths.filter((p) => p.id !== activePath?.id);
  const activeModules = activePath ? getModulesForPath(activePath.id) : [];

  // Compute lesson counts and completion per module
  const moduleStats = useMemo(() => {
    const completedIds = new Set(progress.map((p) => p.lesson_id));
    const stats: Record<string, { total: number; completed: number }> = {};
    for (const m of activeModules) {
      const moduleLessons = lessons.filter((l) => l.module_id === m.id);
      stats[m.id] = {
        total: moduleLessons.length,
        completed: isAuthenticated ? moduleLessons.filter((l) => completedIds.has(l.id)).length : 0,
      };
    }
    return stats;
  }, [activeModules, lessons, progress, isAuthenticated]);

  const totalLessons = Object.values(moduleStats).reduce((s, v) => s + v.total, 0);
  const totalCompleted = Object.values(moduleStats).reduce((s, v) => s + v.completed, 0);

  // Find first module with uncompleted lessons
  const activeModuleId = useMemo(() => {
    for (const m of activeModules) {
      const s = moduleStats[m.id];
      if (s && s.total > 0 && s.completed < s.total) return m.id;
    }
    return null;
  }, [activeModules, moduleStats]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Active path hero */}
      {activePath && (
        <View style={styles.heroCard}>
          {activePath.name_sanskrit && (
            <Text style={styles.heroSanskrit}>{activePath.name_sanskrit}</Text>
          )}
          <Text style={styles.heroName}>{activePath.name}</Text>
          {activePath.description && (
            <Text style={styles.heroDescription} numberOfLines={2}>
              {activePath.description}
            </Text>
          )}
          {isAuthenticated && totalLessons > 0 && (
            <View style={styles.heroProgress}>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.round((totalCompleted / totalLessons) * 100)}%` as any },
                  ]}
                />
              </View>
              <Text style={styles.heroProgressLabel}>
                {totalCompleted} / {totalLessons} lessons
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Module list */}
      <View style={styles.modulesList}>
        {activeModules.map((module, index) => {
          const stats = moduleStats[module.id];
          const hasLessons = stats && stats.total > 0;
          const isCompleted = hasLessons && stats.completed === stats.total;
          const isActive = module.id === activeModuleId;

          return (
            <TouchableOpacity
              key={module.id}
              style={[
                styles.moduleCard,
                isActive && styles.moduleCardActive,
                !hasLessons && styles.moduleCardDisabled,
              ]}
              activeOpacity={hasLessons ? 0.7 : 1}
              disabled={!hasLessons}
              onPress={() =>
                router.push({
                  pathname: '/(main)/path/[moduleSlug]',
                  params: { moduleSlug: module.slug, moduleId: module.id },
                })
              }
            >
              {/* Number circle */}
              <View style={[styles.moduleNumber, isCompleted && styles.moduleNumberCompleted]}>
                {isCompleted ? (
                  <Ionicons name="checkmark" size={18} color={colors.white} />
                ) : (
                  <Text
                    style={[styles.moduleNumberText, !hasLessons && { color: colors.earthMuted }]}
                  >
                    {index + 1}
                  </Text>
                )}
              </View>

              {/* Info */}
              <View style={styles.moduleInfo}>
                <Text style={[styles.moduleName, !hasLessons && { color: colors.earthMuted }]}>
                  {module.name}
                </Text>
                {module.subtitle && <Text style={styles.moduleSubtitle}>{module.subtitle}</Text>}
                <Text style={styles.moduleMeta}>
                  {hasLessons
                    ? `${stats.total} lesson${stats.total !== 1 ? 's' : ''}`
                    : 'Coming soon'}
                </Text>
              </View>

              {/* Arrow / check */}
              <View style={styles.moduleArrow}>
                {isCompleted ? (
                  <Ionicons name="checkmark-circle" size={20} color={colors.sage} />
                ) : hasLessons ? (
                  <Ionicons name="chevron-forward" size={18} color={colors.clay} />
                ) : (
                  <Ionicons name="chevron-forward" size={18} color={colors.sandDark} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* More paths */}
      {otherPaths.length > 0 && (
        <View style={styles.morePaths}>
          <Text style={[textStyles.caption, { marginBottom: spacing.md }]}>MORE PATHS</Text>
          {otherPaths.map((path) => {
            const pathModules = getModulesForPath(path.id);
            const hasContent = pathModules.some((m) => lessons.some((l) => l.module_id === m.id));
            return (
              <View key={path.id} style={styles.morePathCard}>
                <View style={{ flex: 1 }}>
                  <Text style={textStyles.h3}>{path.name}</Text>
                  {path.description && (
                    <Text style={[textStyles.bodySmall, { marginTop: 2 }]} numberOfLines={1}>
                      {path.description}
                    </Text>
                  )}
                </View>
                {!hasContent && (
                  <View style={styles.comingSoonBadge}>
                    <Text style={styles.comingSoonText}>Coming soon</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sand },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  screenTitle: {
    ...textStyles.h1,
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },

  // Hero
  heroCard: {
    backgroundColor: colors.earth,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  heroSanskrit: {
    ...textStyles.caption,
    color: colors.clay,
    marginBottom: spacing.xs,
  },
  heroName: {
    ...textStyles.h1,
    color: colors.sand,
    marginBottom: spacing.xs,
  },
  heroDescription: {
    ...textStyles.bodySmall,
    color: colors.sandDark,
  },
  heroProgress: { marginTop: spacing.md },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.full,
    overflow: 'hidden' as const,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: colors.sage,
    borderRadius: radius.full,
  },
  heroProgressLabel: {
    ...textStyles.bodySmall,
    color: colors.sandDark,
    marginTop: spacing.xs,
  },

  // Modules
  modulesList: { gap: spacing.sm, marginBottom: spacing.xl },
  moduleCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: colors.sandLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.sandDark,
  },
  moduleCardActive: {
    borderColor: colors.clay,
  },
  moduleCardDisabled: {
    opacity: 0.6,
  },
  moduleNumber: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.earth,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: spacing.md,
  },
  moduleNumberCompleted: {
    backgroundColor: colors.sage,
  },
  moduleNumberText: {
    color: colors.sand,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  moduleInfo: { flex: 1 },
  moduleName: {
    ...textStyles.h3,
    marginBottom: 2,
  },
  moduleSubtitle: {
    ...textStyles.bodySmall,
    color: colors.earthMuted,
    marginBottom: 2,
  },
  moduleMeta: {
    fontSize: 12,
    color: colors.earthMuted,
    fontWeight: '500' as const,
  },
  moduleArrow: { paddingLeft: spacing.sm },

  // More paths
  morePaths: { marginTop: spacing.md },
  morePathCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: colors.sandLight,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.sandDark,
  },
  comingSoonBadge: {
    backgroundColor: colors.sandDark,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    marginLeft: spacing.sm,
  },
  comingSoonText: {
    fontSize: 11,
    color: colors.earthMuted,
    fontWeight: '500' as const,
  },
});
