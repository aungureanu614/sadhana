// app/(main)/practice/[practiceSlug].tsx
import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../../lib/store';
import { colors, textStyles, spacing, radius } from '../../../constants/theme';
import type { PracticeStep } from '../../../types';

const typeEmoji: Record<string, string> = {
  asana: '🧘',
  pranayama: '🌬',
  meditation: '🧠',
  dharana: '🎯',
};

export default function PracticeDetailScreen() {
  const { practiceSlug, practiceId } = useLocalSearchParams<{
    practiceSlug: string;
    practiceId?: string;
  }>();
  const router = useRouter();
  const { practices, fetchPractices } = useStore();

  const practice = practices.find((p) => p.id === practiceId || p.slug === practiceSlug);

  // Timer state
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (practices.length === 0) fetchPractices();
  }, []);

  // Timer tick
  useEffect(() => {
    if (isRunning && secondsLeft > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            // Auto-advance to next step
            if (practice && activeStep !== null) {
              const steps = practice.instructions || [];
              if (activeStep < steps.length - 1) {
                const nextIdx = activeStep + 1;
                setActiveStep(nextIdx);
                setSecondsLeft(steps[nextIdx].duration_seconds);
                setIsRunning(true);
              } else {
                setIsComplete(true);
                setActiveStep(null);
              }
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, activeStep]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const startPractice = () => {
    if (!practice || !practice.instructions?.length) return;
    setIsComplete(false);
    setActiveStep(0);
    setSecondsLeft(practice.instructions[0].duration_seconds);
    setIsRunning(true);
  };

  const togglePause = () => {
    setIsRunning((r) => !r);
  };

  const stopPractice = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setActiveStep(null);
    setSecondsLeft(0);
  };

  if (!practice) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={textStyles.body}>Loading practice...</Text>
      </View>
    );
  }

  const steps: PracticeStep[] = practice.instructions || [];
  const doshaKeys = practice.dosha_affinity
    ? Object.entries(practice.dosha_affinity)
        .filter(([, v]) => (v as number) > 0)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .map(([k]) => k)
    : [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Back */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      {/* Header */}
      <Text style={styles.emoji}>{typeEmoji[practice.type] || '🧘'}</Text>
      <Text style={styles.title}>{practice.title}</Text>

      {/* Meta pills */}
      <View style={styles.metaRow}>
        <View style={styles.pill}>
          <Text style={styles.pillText}>
            {practice.type.charAt(0).toUpperCase() + practice.type.slice(1)}
          </Text>
        </View>
        <View style={styles.pill}>
          <Ionicons name="time-outline" size={12} color={colors.earthMuted} />
          <Text style={styles.pillText}>{practice.duration_minutes} min</Text>
        </View>
        <View style={styles.pill}>
          <Text style={styles.pillText}>
            {practice.difficulty.charAt(0).toUpperCase() + practice.difficulty.slice(1)}
          </Text>
        </View>
      </View>

      {/* Dosha tags */}
      {doshaKeys.length > 0 && (
        <View style={styles.doshaRow}>
          {doshaKeys.map((d) => (
            <View
              key={d}
              style={[
                styles.doshaPill,
                {
                  backgroundColor:
                    d === 'vata' ? colors.vata : d === 'pitta' ? colors.pitta : colors.kapha,
                },
              ]}
            >
              <Text style={styles.doshaPillText}>{d.charAt(0).toUpperCase() + d.slice(1)}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Description */}
      {practice.description && <Text style={styles.description}>{practice.description}</Text>}

      {/* Divider */}
      <View style={styles.divider} />

      {/* Timer / Active step */}
      {activeStep !== null && (
        <View style={styles.timerCard}>
          <Text style={styles.timerStepLabel}>
            STEP {activeStep + 1} OF {steps.length}
          </Text>
          <Text style={styles.timerStepName}>{steps[activeStep].name}</Text>
          <Text style={styles.timerStepDesc}>{steps[activeStep].description}</Text>
          <Text style={styles.timerDisplay}>{formatTime(secondsLeft)}</Text>
          <View style={styles.timerControls}>
            <TouchableOpacity style={styles.timerBtn} onPress={togglePause}>
              <Ionicons name={isRunning ? 'pause' : 'play'} size={22} color={colors.sand} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.timerBtn, { backgroundColor: colors.terracotta }]}
              onPress={stopPractice}
            >
              <Ionicons name="stop" size={22} color={colors.sand} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Completion */}
      {isComplete && (
        <View style={styles.completeCard}>
          <Ionicons name="checkmark-circle" size={44} color={colors.sage} />
          <Text style={styles.completeTitle}>Practice Complete</Text>
          <Text style={styles.completeBody}>Well done. Take a moment to notice how you feel.</Text>
        </View>
      )}

      {/* Instructions list */}
      <Text style={styles.sectionLabel}>INSTRUCTIONS</Text>
      {steps.length === 0 ? (
        <Text style={styles.emptyText}>No steps available for this practice.</Text>
      ) : (
        steps.map((step, i) => {
          const isActive = activeStep === i;
          return (
            <View key={i} style={[styles.stepCard, isActive && styles.stepCardActive]}>
              <View style={[styles.stepNumber, isActive && styles.stepNumberActive]}>
                <Text style={[styles.stepNumberText, isActive && { color: colors.sand }]}>
                  {step.step || i + 1}
                </Text>
              </View>
              <View style={styles.stepInfo}>
                <Text style={[styles.stepName, isActive && { color: colors.clay }]}>
                  {step.name}
                </Text>
                <Text style={styles.stepDesc}>{step.description}</Text>
                <Text style={styles.stepDuration}>
                  {step.duration_seconds >= 60
                    ? `${Math.floor(step.duration_seconds / 60)} min ${step.duration_seconds % 60 ? `${step.duration_seconds % 60}s` : ''}`
                    : `${step.duration_seconds}s`}
                </Text>
              </View>
            </View>
          );
        })
      )}

      {/* Begin button */}
      {activeStep === null && !isComplete && steps.length > 0 && (
        <TouchableOpacity style={styles.beginButton} onPress={startPractice} activeOpacity={0.8}>
          <Text style={styles.beginButtonText}>Begin Practice</Text>
        </TouchableOpacity>
      )}

      {isComplete && (
        <TouchableOpacity
          style={styles.beginButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.beginButtonText}>Done</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sand },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl + 40 },

  backButton: { marginBottom: spacing.lg, alignSelf: 'flex-start' },
  backText: { color: colors.clay, fontSize: 15, fontWeight: '500' },

  emoji: { fontSize: 40, marginBottom: spacing.sm },
  title: { ...textStyles.h1, marginBottom: spacing.md },

  // Meta
  metaRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm, flexWrap: 'wrap' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.sandLight,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 1,
    borderWidth: 1,
    borderColor: colors.sandDark,
  },
  pillText: { ...textStyles.bodySmall, fontSize: 12, color: colors.earthLight },

  doshaRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  doshaPill: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  doshaPillText: { color: colors.white, fontSize: 11, fontWeight: '600', letterSpacing: 0.3 },

  description: {
    ...textStyles.body,
    color: colors.earthLight,
    lineHeight: 26,
    marginBottom: spacing.md,
  },
  divider: { height: 1, backgroundColor: colors.sandDark, marginVertical: spacing.xl },

  // Timer
  timerCard: {
    backgroundColor: colors.earth,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  timerStepLabel: { ...textStyles.caption, color: colors.clay, marginBottom: spacing.sm },
  timerStepName: { ...textStyles.h2, color: colors.sand, marginBottom: spacing.xs },
  timerStepDesc: {
    ...textStyles.bodySmall,
    color: colors.sandDark,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  timerDisplay: {
    fontSize: 48,
    fontWeight: '200',
    color: colors.sand,
    letterSpacing: 2,
    marginBottom: spacing.lg,
  },
  timerControls: { flexDirection: 'row', gap: spacing.md },
  timerBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.clay,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Complete
  completeCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  completeTitle: { ...textStyles.h2, color: colors.sage },
  completeBody: { ...textStyles.bodySmall, textAlign: 'center', paddingHorizontal: spacing.lg },

  // Steps
  sectionLabel: { ...textStyles.caption, color: colors.clay, marginBottom: spacing.md },
  emptyText: { ...textStyles.bodySmall, color: colors.earthMuted },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: colors.sandLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.sandDark,
  },
  stepCardActive: { borderColor: colors.clay, borderWidth: 1.5 },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.sandDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    marginTop: 2,
  },
  stepNumberActive: { backgroundColor: colors.clay },
  stepNumberText: { fontSize: 14, fontWeight: '600', color: colors.earth },
  stepInfo: { flex: 1 },
  stepName: { ...textStyles.h3, fontSize: 15, marginBottom: 2 },
  stepDesc: { ...textStyles.bodySmall, lineHeight: 20, marginBottom: spacing.xs },
  stepDuration: { ...textStyles.caption, fontSize: 11, color: colors.earthMuted },

  // Begin
  beginButton: {
    backgroundColor: colors.clay,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  beginButtonText: { color: colors.white, fontWeight: '600', fontSize: 16 },
});
