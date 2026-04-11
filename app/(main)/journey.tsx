// app/(main)/journey.tsx
import { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../../lib/store';
import { colors, textStyles, spacing, radius } from '../../constants/theme';

// Limb number to icon mapping — customize these later
const limbIcons: Record<number, string> = {
  1: '🕊',  // Yama — peace, ethics
  2: '🔥',  // Niyama — inner fire, discipline
  3: '🧘',  // Asana — posture
  4: '🌬',  // Pranayama — breath
  5: '🌙',  // Pratyahara — withdrawal, inward
  6: '🎯',  // Dharana — focus
  7: '🧠',  // Dhyana — meditation
  8: '✨',  // Samadhi — liberation
};

export default function JourneyScreen() {
  const router = useRouter();
  const { paths, modules, fetchPaths, fetchModules, getModulesForPath } = useStore();

  useEffect(() => {
    fetchPaths();
  }, []);

  // When paths load, fetch modules for the first path
  useEffect(() => {
    if (paths.length > 0) {
      fetchModules(paths[0].id);
    }
  }, [paths]);

  const eightLimbsPath = paths.find((p) => p.slug === 'eight-limbs');
  const pathModules = eightLimbsPath ? getModulesForPath(eightLimbsPath.id) : [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Path Header */}
      {eightLimbsPath && (
        <View style={styles.header}>
          <Text style={styles.pathSanskrit}>{eightLimbsPath.name_sanskrit}</Text>
          <Text style={styles.pathName}>{eightLimbsPath.name}</Text>
          <Text style={styles.pathDescription}>{eightLimbsPath.description}</Text>
        </View>
      )}

      {/* Modules List */}
      <View style={styles.modulesList}>
        {pathModules.map((module, index) => (
          <TouchableOpacity
            key={module.id}
            style={styles.moduleCard}
            activeOpacity={0.7}
            onPress={() =>
              router.push({
                pathname: '/(main)/path/[moduleSlug]',
                params: { moduleSlug: module.slug, moduleId: module.id },
              })
            }
          >
            {/* Connecting line between modules */}
            {index < pathModules.length - 1 && <View style={styles.connector} />}

            <View style={styles.moduleNumber}>
              <Text style={styles.moduleEmoji}>{limbIcons[module.sort_order] || '○'}</Text>
            </View>

            <View style={styles.moduleInfo}>
              <Text style={styles.moduleSanskrit}>{module.name_sanskrit}</Text>
              <Text style={styles.moduleName}>{module.name}</Text>
              <Text style={styles.moduleSubtitle}>{module.subtitle}</Text>
            </View>

            <View style={styles.moduleArrow}>
              <Text style={{ color: colors.earthMuted, fontSize: 16 }}>›</Text>
            </View>
          </TouchableOpacity>
        ))}
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
  header: {
    marginBottom: spacing.xl,
    marginTop: spacing.sm,
  },
  pathSanskrit: {
    ...textStyles.sanskrit,
    marginBottom: spacing.xs,
  },
  pathName: {
    ...textStyles.h1,
    marginBottom: spacing.sm,
  },
  pathDescription: {
    ...textStyles.body,
    color: colors.earthLight,
  },
  modulesList: {
    gap: spacing.sm,
  },
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.sandLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.sandDark,
    position: 'relative',
  },
  connector: {
    position: 'absolute',
    left: spacing.lg + 20,  // center of the emoji circle
    bottom: -spacing.sm,
    width: 1,
    height: spacing.sm,
    backgroundColor: colors.sandDark,
  },
  moduleNumber: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.sand,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.sandDark,
  },
  moduleEmoji: {
    fontSize: 20,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleSanskrit: {
    ...textStyles.sanskrit,
    fontSize: 12,
    marginBottom: 1,
  },
  moduleName: {
    ...textStyles.h3,
    marginBottom: 2,
  },
  moduleSubtitle: {
    ...textStyles.bodySmall,
    color: colors.earthMuted,
  },
  moduleArrow: {
    paddingLeft: spacing.sm,
  },
});
