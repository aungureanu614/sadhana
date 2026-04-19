// app/(main)/home.tsx
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../../lib/store';
import { colors, textStyles, spacing, radius } from '../../constants/theme';
import type { Mood } from '../../types';

const MOODS: { key: Mood; label: string; icon: string }[] = [
  { key: 'energized', label: 'Energized', icon: '☀' },
  { key: 'restless', label: 'Restless', icon: '☁' },
  { key: 'heavy', label: 'Heavy', icon: '☾' },
  { key: 'balanced', label: 'Balanced', icon: '◎' },
];

export default function HomeScreen() {
  const router = useRouter();
  const {
    session,
    profile,
    fetchProfile,
    currentQuote,
    fetchRandomQuote,
    todayIntention,
    fetchTodayIntention,
    saveIntention,
    upsertMood,
    recommendedPractice,
    fetchRecommendedPractice,
    nextLesson,
    fetchNextLesson,
  } = useStore();

  const isAuthenticated = !!session;

  useEffect(() => {
    fetchRandomQuote();
    if (isAuthenticated) {
      fetchProfile();
      fetchTodayIntention();
      fetchRecommendedPractice();
      fetchNextLesson();
    }
  }, [isAuthenticated]);

  if (isAuthenticated) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AuthenticatedGreeting name={profile?.display_name} />
        <IntentionCard intention={todayIntention?.intention} onSave={saveIntention} />
        <MoodSelector currentMood={todayIntention?.mood ?? null} onSelect={upsertMood} />
        <RecommendedPracticeCard practice={recommendedPractice} hasDosha={!!profile?.dosha_result} router={router} />
        <ContinueLearningCard nextLesson={nextLesson} router={router} />
        <QuoteBlock quote={currentQuote} />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <AnonymousGreeting />
      <BeginJourneyCard router={router} />
      <DoshaTeaser router={router} />
      <QuoteBlock quote={currentQuote} />
    </ScrollView>
  );
}

// ───── Anonymous Components ─────

function AnonymousGreeting() {
  return (
    <View style={styles.greeting}>
      <Text style={styles.greetingText}>Namaste</Text>
      <Text style={styles.greetingSubtext}>Your practice begins here.</Text>
    </View>
  );
}

function BeginJourneyCard({ router }: { router: any }) {
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.clay }]}
      activeOpacity={0.85}
      onPress={() => router.push('/(main)/journey')}
    >
      <Text style={[textStyles.h2, { color: colors.sand, marginBottom: spacing.xs }]}>
        Explore the 8 Limbs of Yoga
      </Text>
      <Text style={[textStyles.bodySmall, { color: colors.sandDark, marginBottom: spacing.md }]}>
        Start learning with no account needed
      </Text>
      <View style={styles.buttonClay}>
        <Text style={styles.buttonClayText}>Start learning →</Text>
      </View>
    </TouchableOpacity>
  );
}

function DoshaTeaser({ router }: { router: any }) {
  return (
    <TouchableOpacity
      style={[styles.card, styles.outlineCard]}
      activeOpacity={0.8}
      onPress={() => {
        // TODO: navigate to dosha quiz when it exists
      }}
    >
      <Text style={[textStyles.h3, { marginBottom: spacing.xs }]}>Discover your dosha</Text>
      <Text style={[textStyles.bodySmall, { marginBottom: spacing.md }]}>
        Take a 2-minute quiz to unlock personalized practice recommendations.
      </Text>
      <Text style={{ color: colors.clay, fontWeight: '600', fontSize: 15 }}>Take the quiz →</Text>
    </TouchableOpacity>
  );
}

// ───── Authenticated Components ─────

function AuthenticatedGreeting({ name }: { name?: string | null }) {
  return (
    <View style={styles.greeting}>
      <Text style={styles.greetingText}>Namaste{name ? `, ${name}` : ''}</Text>
      <Text style={styles.greetingSubtext}>What calls to your practice today?</Text>
    </View>
  );
}

function IntentionCard({ intention, onSave }: { intention?: string; onSave: (text: string) => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(intention || '');

  useEffect(() => {
    if (intention) setText(intention);
  }, [intention]);

  const handleSave = async () => {
    if (text.trim()) {
      await onSave(text.trim());
    }
    setEditing(false);
    Keyboard.dismiss();
  };

  return (
    <View style={[styles.card, styles.intentionCard]}>
      <Text style={textStyles.caption}>TODAY&apos;S INTENTION</Text>
      {editing ? (
        <View style={{ marginTop: spacing.sm }}>
          <TextInput
            style={styles.intentionInput}
            value={text}
            onChangeText={setText}
            placeholder="What is your intention for today?"
            placeholderTextColor={colors.earthMuted}
            autoFocus
            multiline
            onSubmitEditing={handleSave}
            blurOnSubmit
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      ) : intention ? (
        <TouchableOpacity onPress={() => setEditing(true)} style={{ marginTop: spacing.sm }}>
          <Text style={[textStyles.body, { fontStyle: 'italic' }]}>{intention}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => setEditing(true)} style={{ marginTop: spacing.sm }}>
          <Text style={[textStyles.body, { color: colors.clay }]}>Set your intention for today</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function MoodSelector({ currentMood, onSelect }: { currentMood: Mood | null; onSelect: (m: Mood) => Promise<void> }) {
  return (
    <View style={styles.card}>
      <Text style={[textStyles.caption, { marginBottom: spacing.sm }]}>HOW ARE YOU FEELING?</Text>
      <View style={styles.moodRow}>
        {MOODS.map((m) => {
          const active = currentMood === m.key;
          return (
            <TouchableOpacity
              key={m.key}
              style={[styles.moodButton, active && styles.moodButtonActive]}
              onPress={() => onSelect(m.key)}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 22 }}>{m.icon}</Text>
              <Text style={[styles.moodLabel, active && { color: colors.white }]}>{m.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function RecommendedPracticeCard({ practice, hasDosha, router }: { practice: any; hasDosha: boolean; router: any }) {
  if (!practice) return null;

  const doshaKeys = practice.dosha_affinity ? Object.keys(practice.dosha_affinity) : [];
  const chakra = practice.chakra_affinity;

  return (
    <TouchableOpacity
      style={[styles.card, styles.practiceCard]}
      activeOpacity={0.85}
      onPress={() => {
        // TODO: navigate to practice detail
      }}
    >
      <Text style={[textStyles.caption, { color: colors.clay, marginBottom: spacing.sm }]}>
        RECOMMENDED PRACTICE
      </Text>
      <Text style={[textStyles.h2, { color: colors.sand, marginBottom: spacing.xs }]}>
        {practice.title}
      </Text>
      {practice.description && (
        <Text style={{ color: colors.sandDark, fontSize: 14, marginBottom: spacing.sm }} numberOfLines={1}>
          {practice.description}
        </Text>
      )}
      <Text style={{ color: colors.earthMuted, fontSize: 12, marginBottom: spacing.md }}>
        {practice.duration_minutes} min · {practice.type} · {practice.difficulty}
      </Text>
      <View style={styles.pillRow}>
        {doshaKeys.map((d) => (
          <View key={d} style={styles.pill}>
            <Text style={styles.pillText}>{d}</Text>
          </View>
        ))}
        {chakra?.primary && (
          <View style={styles.pill}>
            <Text style={styles.pillText}>{chakra.primary}</Text>
          </View>
        )}
      </View>
      <View style={[styles.buttonClay, { marginTop: spacing.md }]}>
        <Text style={styles.buttonClayText}>Begin practice</Text>
      </View>
      {!hasDosha && (
        <Text style={{ color: colors.sandDark, fontSize: 12, marginTop: spacing.sm, textAlign: 'center' }}>
          Take the dosha quiz for personalized recommendations
        </Text>
      )}
    </TouchableOpacity>
  );
}

function ContinueLearningCard({ nextLesson, router }: { nextLesson: any; router: any }) {
  if (!nextLesson) {
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => router.push('/(main)/journey')}
      >
        <Text style={textStyles.h3}>Begin your journey</Text>
        <Text style={[textStyles.bodySmall, { marginTop: spacing.xs }]}>
          Explore structured learning paths in the Journey tab.
        </Text>
      </TouchableOpacity>
    );
  }

  const { lesson, moduleName, pathName, completedCount, totalCount } = nextLesson;
  const progress = totalCount > 0 ? completedCount / totalCount : 0;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => {
        // TODO: navigate to lesson detail
      }}
    >
      <Text style={[textStyles.caption, { marginBottom: spacing.xs }]}>CONTINUE LEARNING</Text>
      <Text style={[textStyles.h3, { marginBottom: spacing.xs }]}>{lesson.title}</Text>
      <Text style={[textStyles.bodySmall, { color: colors.clay, marginBottom: spacing.md }]}>
        {pathName} · {moduleName}
      </Text>
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${Math.round(progress * 100)}%` as any }]} />
      </View>
      <Text style={[textStyles.bodySmall, { marginTop: spacing.xs }]}>
        {completedCount}/{totalCount} lessons completed
      </Text>
    </TouchableOpacity>
  );
}

// ───── Shared Components ─────

function QuoteBlock({ quote }: { quote: any }) {
  if (!quote) return null;
  return (
    <View style={styles.quoteContainer}>
      <Text style={styles.quoteBody}>&ldquo;{quote.body}&rdquo;</Text>
      {quote.source && <Text style={styles.quoteSource}>— {quote.source}</Text>}
    </View>
  );
}

// ───── Styles ─────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sand },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  greeting: { marginBottom: spacing.xl, marginTop: spacing.sm },
  greetingText: { ...textStyles.h1, marginBottom: spacing.xs },
  greetingSubtext: { ...textStyles.bodySmall },

  card: {
    backgroundColor: colors.sandLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  outlineCard: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.earthMuted,
  },
  intentionCard: {
    borderLeftWidth: 3,
    borderLeftColor: colors.clay,
  },
  intentionInput: {
    ...textStyles.body,
    borderBottomWidth: 1,
    borderBottomColor: colors.sandDark,
    paddingBottom: spacing.sm,
    minHeight: 40,
  },
  saveButton: {
    alignSelf: 'flex-end' as const,
    marginTop: spacing.sm,
    backgroundColor: colors.clay,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  saveButtonText: { color: colors.white, fontWeight: '600' as const, fontSize: 14 },

  moodRow: { flexDirection: 'row' as const, gap: spacing.sm },
  moodButton: {
    flex: 1,
    alignItems: 'center' as const,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.sandDark,
  },
  moodButtonActive: { backgroundColor: colors.clay },
  moodLabel: { fontSize: 11, marginTop: 4, color: colors.earthLight, fontWeight: '500' as const },

  practiceCard: { backgroundColor: colors.earth },
  pillRow: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: spacing.xs },
  pill: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  pillText: { color: colors.sandDark, fontSize: 11, fontWeight: '500' as const },

  buttonClay: {
    backgroundColor: colors.clay,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignSelf: 'flex-start' as const,
  },
  buttonClayText: { color: colors.white, fontWeight: '600' as const, fontSize: 15 },

  progressBarBg: {
    height: 6,
    backgroundColor: colors.sandDark,
    borderRadius: radius.full,
    overflow: 'hidden' as const,
  },
  progressBarFill: { height: 6, backgroundColor: colors.sage, borderRadius: radius.full },

  quoteContainer: {
    marginTop: spacing.md,
    alignItems: 'center' as const,
    paddingHorizontal: spacing.lg,
  },
  quoteBody: {
    ...textStyles.body,
    fontStyle: 'italic' as const,
    textAlign: 'center' as const,
    color: colors.earthLight,
  },
  quoteSource: {
    ...textStyles.bodySmall,
    marginTop: spacing.xs,
    color: colors.earthMuted,
  },
});
