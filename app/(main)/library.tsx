// app/(main)/library.tsx
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../lib/store';
import { colors, textStyles, spacing, radius } from '../../constants/theme';

const needs = ['Calm', 'Energy', 'Grounding', 'Focus', 'Release', 'Rest'] as const;
const typeChips = ['All', 'Asana', 'Pranayama', 'Meditation', 'Dharana'] as const;
const typeEmoji: Record<string, string> = {
  asana: '🧘',
  pranayama: '🌬',
  meditation: '🧠',
  dharana: '🎯',
};

export default function LibraryScreen() {
  const router = useRouter();
  const {
    practices,
    resources,
    fetchPractices,
    fetchResources,
    fetchPracticesByNeed,
    fetchPracticesByType,
  } = useStore();
  const [view, setView] = useState<'needs' | 'browse'>('needs');
  const [selectedNeed, setSelectedNeed] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState('All');

  useEffect(() => {
    fetchPractices();
    fetchResources();
  }, []);

  const handleNeed = (need: string) => {
    if (selectedNeed === need) {
      setSelectedNeed(null);
      fetchPractices();
    } else {
      setSelectedNeed(need);
      fetchPracticesByNeed(need.toLowerCase());
    }
  };

  const handleType = (type: string) => {
    setSelectedType(type);
    type === 'All' ? fetchPractices() : fetchPracticesByType(type.toLowerCase());
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Toggle */}
      <View style={styles.toggle}>
        <TouchableOpacity
          style={[styles.toggleBtn, view === 'needs' && styles.toggleBtnActive]}
          onPress={() => setView('needs')}
        >
          <Text style={[styles.toggleText, view === 'needs' && styles.toggleTextActive]}>
            I need...
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, view === 'browse' && styles.toggleBtnActive]}
          onPress={() => setView('browse')}
        >
          <Text style={[styles.toggleText, view === 'browse' && styles.toggleTextActive]}>
            Browse
          </Text>
        </TouchableOpacity>
      </View>

      {/* Needs view */}
      {view === 'needs' && (
        <>
          <Text style={styles.sectionLabel}>What do you need right now?</Text>
          <View style={styles.needsGrid}>
            {needs.map((need) => (
              <TouchableOpacity
                key={need}
                style={[styles.needBtn, selectedNeed === need && styles.needBtnActive]}
                onPress={() => handleNeed(need)}
              >
                <Text style={[styles.needText, selectedNeed === need && styles.needTextActive]}>
                  {need}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Browse view */}
      {view === 'browse' && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
          contentContainerStyle={styles.chipRow}
        >
          {typeChips.map((chip) => (
            <TouchableOpacity
              key={chip}
              style={[styles.chip, selectedType === chip && styles.chipActive]}
              onPress={() => handleType(chip)}
            >
              <Text style={[styles.chipText, selectedType === chip && styles.chipTextActive]}>
                {chip}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Practice cards */}
      {practices.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            {selectedNeed ? 'No practices found for this need.' : 'Loading practices...'}
          </Text>
        </View>
      ) : (
        <View style={styles.practiceList}>
          {practices.map((practice) => (
            <TouchableOpacity
              key={practice.id}
              style={styles.practiceCard}
              activeOpacity={0.7}
              onPress={() =>
                router.push({
                  pathname: '/(main)/practice/[practiceSlug]' as any,
                  params: { practiceSlug: practice.slug, practiceId: practice.id },
                })
              }
            >
              <View style={styles.practiceEmoji}>
                <Text style={{ fontSize: 24 }}>{typeEmoji[practice.type] || '🕉'}</Text>
              </View>
              <View style={styles.practiceInfo}>
                <Text style={styles.practiceTitle}>{practice.title}</Text>
                <Text style={styles.practiceMeta}>
                  {practice.type.charAt(0).toUpperCase() + practice.type.slice(1)} ·{' '}
                  {practice.duration_minutes} min · {practice.difficulty}
                </Text>
                {practice.description && (
                  <Text style={styles.practiceDescription} numberOfLines={2}>
                    {practice.description}
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.earthMuted} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Recommended reading */}
      {resources.length > 0 && (
        <>
          <Text style={[styles.sectionLabel, { marginTop: spacing.xl }]}>RECOMMENDED READING</Text>
          <View style={styles.practiceList}>
            {resources.map((res) => (
              <TouchableOpacity
                key={res.id}
                style={styles.resourceCard}
                activeOpacity={0.7}
                onPress={() => res.url && Linking.openURL(res.url)}
              >
                <View style={styles.resourceIcon}>
                  <Ionicons name="book-outline" size={20} color={colors.clay} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.practiceTitle}>{res.title}</Text>
                  {res.author && <Text style={styles.practiceMeta}>{res.author}</Text>}
                  {res.curator_note && <Text style={styles.curatorNote}>{res.curator_note}</Text>}
                  {res.category && (
                    <View style={styles.tagPill}>
                      <Text style={styles.tagText}>{res.category}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sand },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  title: { ...textStyles.h1, marginBottom: spacing.md, marginTop: spacing.sm },
  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.sandDark,
    borderRadius: radius.full,
    padding: 3,
    marginBottom: spacing.xl,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.full,
    alignItems: 'center',
  },
  toggleBtnActive: { backgroundColor: colors.earth },
  toggleText: { ...textStyles.bodySmall, color: colors.earthMuted, fontWeight: '600' },
  toggleTextActive: { color: colors.sand },
  sectionLabel: { ...textStyles.caption, color: colors.clay, marginBottom: spacing.md },
  needsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl },
  needBtn: {
    width: '31%',
    paddingVertical: spacing.md,
    backgroundColor: colors.sandLight,
    borderRadius: radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.sandDark,
  },
  needBtnActive: { backgroundColor: colors.earth, borderColor: colors.earth },
  needText: { ...textStyles.body, fontSize: 14, fontWeight: '500' },
  needTextActive: { color: colors.sand },
  chipScroll: { marginBottom: spacing.lg },
  chipRow: { gap: spacing.sm, paddingRight: spacing.lg },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.sandLight,
    borderWidth: 1,
    borderColor: colors.sandDark,
  },
  chipActive: { backgroundColor: colors.earth, borderColor: colors.earth },
  chipText: { ...textStyles.bodySmall, fontWeight: '500' },
  chipTextActive: { color: colors.sand },
  emptyState: { padding: spacing.xxl, alignItems: 'center' },
  emptyText: { ...textStyles.bodySmall, color: colors.earthMuted },
  practiceList: { gap: spacing.md },
  practiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  practiceInfo: { flex: 1 },
  practiceTitle: { ...textStyles.h3, fontSize: 16, marginBottom: 2 },
  practiceMeta: {
    ...textStyles.bodySmall,
    color: colors.earthMuted,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  practiceDescription: { ...textStyles.bodySmall, lineHeight: 20 },
  resourceCard: {
    flexDirection: 'row',
    backgroundColor: colors.sandLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.sandDark,
  },
  resourceIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.sand,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  curatorNote: {
    ...textStyles.bodySmall,
    fontStyle: 'italic',
    color: colors.earthLight,
    marginTop: spacing.xs,
  },
  tagPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.sandDark,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginTop: spacing.xs,
  },
  tagText: { ...textStyles.caption, fontSize: 10 },
});
