// app/(main)/quiz.tsx
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../lib/store';
import { colors, textStyles, spacing, radius } from '../../constants/theme';

const doshaDescriptions: Record<string, string> = {
  vata: 'Creative, energetic, and quick-thinking. You thrive with routine, warmth, and grounding practices.',
  pitta:
    'Focused, driven, and passionate. You benefit from cooling, calming practices that balance intensity.',
  kapha:
    'Steady, nurturing, and strong. You flourish with stimulating, energizing practices that inspire movement.',
};

export default function QuizScreen() {
  const router = useRouter();
  const { session, doshaQuestions, fetchDoshaQuestions, setLocalDoshaResult, saveDoshaResult } =
    useStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [scores, setScores] = useState<{ vata: number; pitta: number; kapha: number } | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (doshaQuestions.length === 0) {
      fetchDoshaQuestions().then(() => {
        // Check if still empty after fetch
        setTimeout(() => {
          if (useStore.getState().doshaQuestions.length === 0) {
            setLoadError(true);
          }
        }, 500);
      });
    }
  }, []);

  const questions = doshaQuestions;
  const total = questions.length;
  const question = questions[currentIndex];
  const selectedAnswer = answers[currentIndex] ?? null;
  const isFinished = scores !== null;

  const selectOption = (optionIndex: number) => {
    const updated = [...answers];
    updated[currentIndex] = optionIndex;
    setAnswers(updated);
  };

  const goNext = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      calculateResults();
    }
  };

  const goBack = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const calculateResults = () => {
    let vata = 0,
      pitta = 0,
      kapha = 0;
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const chosen = answers[i];
      if (chosen !== undefined && q.options[chosen]) {
        vata += q.options[chosen].vata_score;
        pitta += q.options[chosen].pitta_score;
        kapha += q.options[chosen].kapha_score;
      }
    }
    const result = { vata, pitta, kapha };
    setScores(result);

    if (session) {
      saveDoshaResult(result);
    } else {
      setLocalDoshaResult(result);
    }
  };

  // Loading
  if (total === 0) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
        ]}
      >
        {loadError ? (
          <>
            <Text style={[textStyles.h3, { marginBottom: spacing.sm, textAlign: 'center' }]}>
              Quiz not available yet
            </Text>
            <Text
              style={[
                textStyles.bodySmall,
                { textAlign: 'center', marginBottom: spacing.xl, color: colors.earthMuted },
              ]}
            >
              The dosha questions haven't been added to the database yet. Check that the
              dosha_questions table exists and has data.
            </Text>
            <TouchableOpacity style={styles.navNextBtn} onPress={() => router.back()}>
              <Text style={styles.navNextText}>Go back</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={textStyles.body}>Loading questions...</Text>
        )}
      </View>
    );
  }

  // Results
  if (isFinished && scores) {
    const maxScore = Math.max(scores.vata, scores.pitta, scores.kapha);
    const primary =
      scores.vata === maxScore ? 'vata' : scores.pitta === maxScore ? 'pitta' : 'kapha';
    const allScores = [
      { label: 'Vata', value: scores.vata, color: colors.vata },
      { label: 'Pitta', value: scores.pitta, color: colors.pitta },
      { label: 'Kapha', value: scores.kapha, color: colors.kapha },
    ];
    const totalScore = scores.vata + scores.pitta + scores.kapha || 1;

    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.resultHeader}>
          <Ionicons name="sparkles" size={40} color={colors.clay} />
          <Text style={styles.resultTitle}>Your Dosha</Text>
          <Text style={styles.resultPrimary}>
            {primary.charAt(0).toUpperCase() + primary.slice(1)}
          </Text>
        </View>

        <Text style={styles.resultDesc}>{doshaDescriptions[primary]}</Text>

        {/* Score bars */}
        <View style={styles.barsSection}>
          {allScores.map((s) => (
            <View key={s.label} style={styles.barRow}>
              <Text style={styles.barLabel}>{s.label}</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      backgroundColor: s.color,
                      width: `${Math.round((s.value / totalScore) * 100)}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.barValue}>{s.value}</Text>
            </View>
          ))}
        </View>

        {!session && (
          <View style={styles.anonNote}>
            <Text style={styles.anonNoteText}>
              Create an account to save your results and get personalized recommendations.
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.doneButton} onPress={() => router.back()}>
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // Question
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Discover your dosha</Text>

      {/* Progress */}
      <View style={styles.progressRow}>
        <View style={styles.progressTrack}>
          <View
            style={[styles.progressFill, { width: `${((currentIndex + 1) / total) * 100}%` }]}
          />
        </View>
        <Text style={styles.progressText}>
          {currentIndex + 1} / {total}
        </Text>
      </View>

      {/* Question */}
      <View style={styles.questionCard}>
        <Text style={styles.questionText}>{question.question}</Text>
      </View>

      {/* Options */}
      <View style={styles.options}>
        {question.options.map((opt: any, i: number) => {
          const selected = selectedAnswer === i;
          return (
            <TouchableOpacity
              key={i}
              style={[styles.option, selected && styles.optionSelected]}
              activeOpacity={0.7}
              onPress={() => selectOption(i)}
            >
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                {opt.text}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Navigation */}
      <View style={styles.navRow}>
        {currentIndex > 0 ? (
          <TouchableOpacity style={styles.navBackBtn} onPress={goBack}>
            <Text style={styles.navBackText}>Back</Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}
        <TouchableOpacity
          style={[styles.navNextBtn, selectedAnswer === null && styles.navNextDisabled]}
          disabled={selectedAnswer === null}
          onPress={goNext}
        >
          <Text style={styles.navNextText}>
            {currentIndex === total - 1 ? 'See Results' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sand },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl + 40 },

  backButton: { marginBottom: spacing.lg, alignSelf: 'flex-start' },
  backText: { color: colors.clay, fontSize: 15, fontWeight: '500' },

  title: { ...textStyles.h1, marginBottom: spacing.md },

  // Progress
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.sandDark,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: { height: 6, backgroundColor: colors.sage, borderRadius: radius.full },
  progressText: { ...textStyles.bodySmall, color: colors.earthMuted, fontSize: 13 },

  // Question
  questionCard: {
    backgroundColor: colors.sandLight,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.sandDark,
    marginBottom: spacing.lg,
  },
  questionText: { ...textStyles.h3, lineHeight: 26 },

  // Options
  options: { gap: spacing.sm, marginBottom: spacing.xl },
  option: {
    backgroundColor: colors.sandLight,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.sandDark,
  },
  optionSelected: { backgroundColor: colors.earth, borderColor: colors.earth },
  optionText: { ...textStyles.body, fontSize: 15 },
  optionTextSelected: { color: colors.sand },

  // Nav
  navRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  navBackBtn: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  navBackText: { color: colors.earthMuted, fontWeight: '500', fontSize: 15 },
  navNextBtn: {
    backgroundColor: colors.clay,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  navNextDisabled: { opacity: 0.4 },
  navNextText: { color: colors.white, fontWeight: '600', fontSize: 15 },

  // Results
  resultHeader: { alignItems: 'center', marginBottom: spacing.lg, marginTop: spacing.md },
  resultTitle: {
    ...textStyles.caption,
    color: colors.clay,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  resultPrimary: { ...textStyles.h1, fontSize: 36 },
  resultDesc: {
    ...textStyles.body,
    color: colors.earthLight,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.sm,
  },

  // Bars
  barsSection: { gap: spacing.md, marginBottom: spacing.xl },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  barLabel: { ...textStyles.bodySmall, width: 48, fontWeight: '500' },
  barTrack: {
    flex: 1,
    height: 12,
    backgroundColor: colors.sandDark,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  barFill: { height: 12, borderRadius: radius.full },
  barValue: { ...textStyles.bodySmall, width: 28, textAlign: 'right', fontWeight: '600' },

  // Anon note
  anonNote: {
    backgroundColor: colors.sandLight,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.clay,
    marginBottom: spacing.lg,
  },
  anonNoteText: { ...textStyles.bodySmall, color: colors.earthLight, lineHeight: 22 },

  // Done
  doneButton: {
    backgroundColor: colors.earth,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  doneButtonText: { color: colors.sand, fontWeight: '600', fontSize: 16 },
});
