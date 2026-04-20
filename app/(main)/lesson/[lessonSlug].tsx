// app/(main)/lesson/[lessonSlug].tsx
import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Keyboard,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../../lib/store';
import { colors, textStyles, spacing, radius } from '../../../constants/theme';
import SignupPrompt from '../../../components/SignupPrompt';
import type {
  Lesson,
  QuizAction,
  ChallengeAction,
  ReflectionAction,
  JournalAction,
} from '../../../types';

type Section = 'teaching' | 'quiz' | 'challenge' | 'journal' | 'complete';

export default function LessonDetailScreen() {
  const { lessonSlug, lessonId, moduleId } = useLocalSearchParams<{
    lessonSlug: string;
    lessonId: string;
    moduleId: string;
  }>();
  const router = useRouter();
  const {
    session,
    lessons,
    modules,
    paths,
    fetchLessons,
    completeLesson,
    saveJournalEntry,
    hasSeenSignupPrompt,
    setHasSeenSignupPrompt,
  } = useStore();

  const isAuthenticated = !!session;
  const scrollRef = useRef<ScrollView>(null);
  const [showSignup, setShowSignup] = useState(false);

  // Find lesson
  const lesson = lessons.find((l) => l.id === lessonId || l.slug === lessonSlug);
  const module = lesson ? modules.find((m) => m.id === lesson.module_id) : null;
  const path = module ? paths.find((p) => p.id === module.path_id) : null;

  // Section progression
  const [currentSection, setCurrentSection] = useState<Section>('teaching');
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizRevealed, setQuizRevealed] = useState(false);
  const [challengeAccepted, setChallengeAccepted] = useState(false);
  const [journalText, setJournalText] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  // Fetch lessons if needed
  useEffect(() => {
    if (moduleId && lessons.filter((l) => l.module_id === moduleId).length === 0) {
      fetchLessons(moduleId);
    }
  }, [moduleId]);

  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300);
  };

  // Determine what action data we have
  const quizData = lesson?.action_type === 'quiz' ? (lesson.action_data as QuizAction) : null;
  const challengeData =
    lesson?.action_type === 'challenge' ? (lesson.action_data as ChallengeAction) : null;
  const reflectionData =
    lesson?.action_type === 'reflection' ? (lesson.action_data as ReflectionAction) : null;
  const journalData =
    lesson?.action_type === 'journal' ? (lesson.action_data as JournalAction) : null;

  // The scaffold says quiz + challenge are always present, but data may not have them.
  // We'll show what's available, then journal/reflection if present, then completion.

  const advanceSection = () => {
    if (currentSection === 'teaching') {
      // Move to quiz if available, otherwise challenge, otherwise journal, otherwise complete
      if (quizData) {
        setCurrentSection('quiz');
        scrollToBottom();
        return;
      }
      if (challengeData) {
        setCurrentSection('challenge');
        scrollToBottom();
        return;
      }
      if (reflectionData || journalData) {
        setCurrentSection('journal');
        scrollToBottom();
        return;
      }
      handleComplete();
    } else if (currentSection === 'quiz') {
      if (challengeData) {
        setCurrentSection('challenge');
        scrollToBottom();
        return;
      }
      if (reflectionData || journalData) {
        setCurrentSection('journal');
        scrollToBottom();
        return;
      }
      handleComplete();
    } else if (currentSection === 'challenge') {
      if (reflectionData || journalData) {
        setCurrentSection('journal');
        scrollToBottom();
        return;
      }
      handleComplete();
    } else if (currentSection === 'journal') {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    const response: Record<string, unknown> = {};
    if (quizAnswer !== null) response.quiz_answer = quizAnswer;
    if (journalText.trim()) response.reflection = journalText;

    if (isAuthenticated && lesson) {
      await completeLesson(lesson.id, response);
    }
    setCurrentSection('complete');
    setIsCompleted(true);
    scrollToBottom();

    // Show signup prompt for anonymous users (once per session)
    if (!isAuthenticated && !hasSeenSignupPrompt) {
      setShowSignup(true);
      setHasSeenSignupPrompt(true);
    }
  };

  const handleSaveJournal = async () => {
    if (isAuthenticated && lesson && journalText.trim()) {
      const prompt = reflectionData?.prompt || journalData?.prompts?.[0] || undefined;
      await saveJournalEntry({
        lessonId: lesson.id,
        prompt,
        body: journalText.trim(),
      });
    }
    advanceSection();
  };

  if (!lesson) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={textStyles.body}>Loading lesson...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← {module?.name || 'Back'}</Text>
      </TouchableOpacity>

      {/* Lesson title */}
      <Text style={styles.title}>{lesson.title}</Text>
      {lesson.subtitle && <Text style={styles.subtitle}>{lesson.subtitle}</Text>}
      {lesson.estimated_minutes && (
        <Text style={styles.meta}>{lesson.estimated_minutes} min read</Text>
      )}

      {/* ─── Teaching content ─── */}
      <View style={styles.teachingContent}>
        {lesson.teaching_content.blocks.map((block, i) => (
          <View key={i}>
            {block.type === 'text' && <Text style={styles.bodyText}>{block.content}</Text>}
            {block.type === 'highlight' && (
              <View style={styles.highlightBox}>
                <Text style={styles.highlightText}>{block.content}</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Continue to quiz */}
      {currentSection === 'teaching' && (
        <TouchableOpacity style={styles.continueButton} onPress={advanceSection}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      )}

      {/* ─── Quiz section ─── */}
      {currentSection !== 'teaching' && quizData && (
        <View style={styles.section}>
          <View style={styles.divider} />
          <Text style={styles.sectionLabel}>REFLECT & RESPOND</Text>
          <Text style={styles.questionText}>{quizData.question}</Text>

          <View style={styles.optionsContainer}>
            {quizData.options.map((option, index) => {
              let style = styles.option;
              let txtStyle = styles.optionText;

              if (quizRevealed) {
                if (index === quizData.correct_index) {
                  style = { ...styles.option, ...styles.optionCorrect };
                  txtStyle = { ...styles.optionText, color: colors.white };
                } else if (index === quizAnswer && index !== quizData.correct_index) {
                  style = { ...styles.option, ...styles.optionIncorrect };
                  txtStyle = { ...styles.optionText, color: colors.white };
                }
              } else if (index === quizAnswer) {
                style = { ...styles.option, ...styles.optionSelected };
                txtStyle = { ...styles.optionText, color: colors.white };
              }

              return (
                <TouchableOpacity
                  key={index}
                  style={style}
                  activeOpacity={0.7}
                  onPress={() => !quizRevealed && setQuizAnswer(index)}
                  disabled={quizRevealed}
                >
                  <Text style={txtStyle}>{option}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {quizAnswer !== null && !quizRevealed && (
            <TouchableOpacity style={styles.continueButton} onPress={() => setQuizRevealed(true)}>
              <Text style={styles.continueButtonText}>Check Answer</Text>
            </TouchableOpacity>
          )}

          {quizRevealed && (
            <>
              <View style={styles.explanationBox}>
                <Text style={styles.explanationText}>{quizData.explanation}</Text>
              </View>
              {currentSection === 'quiz' && (
                <TouchableOpacity style={styles.continueButton} onPress={advanceSection}>
                  <Text style={styles.continueButtonText}>Continue</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      )}

      {/* ─── Challenge section ─── */}
      {(currentSection === 'challenge' ||
        currentSection === 'journal' ||
        currentSection === 'complete') &&
        challengeData && (
          <View style={styles.section}>
            <View style={styles.divider} />
            <Text style={styles.sectionLabel}>CHALLENGE</Text>
            <Text style={styles.challengeTitle}>{challengeData.title}</Text>
            <Text style={styles.bodyText}>{challengeData.description}</Text>
            <View style={styles.durationBadge}>
              <Ionicons name="time-outline" size={14} color={colors.earthMuted} />
              <Text style={styles.durationText}>{challengeData.duration_hours}-hour challenge</Text>
            </View>

            {!challengeAccepted && currentSection === 'challenge' ? (
              <TouchableOpacity
                style={styles.continueButton}
                onPress={() => {
                  setChallengeAccepted(true);
                  advanceSection();
                }}
              >
                <Text style={styles.continueButtonText}>Accept Challenge</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.acceptedBadge}>
                <Ionicons name="checkmark-circle" size={18} color={colors.sage} />
                <Text style={styles.acceptedText}>Challenge accepted</Text>
              </View>
            )}
          </View>
        )}

      {/* ─── Journal / Reflection section ─── */}
      {(currentSection === 'journal' || currentSection === 'complete') &&
        (reflectionData || journalData) && (
          <View style={styles.section}>
            <View style={styles.divider} />
            <Text style={styles.sectionLabel}>JOURNAL REFLECTION</Text>
            <Text style={styles.promptText}>
              {reflectionData?.prompt ||
                journalData?.prompts?.[0] ||
                'Reflect on what you learned.'}
            </Text>

            {currentSection === 'journal' && (
              <>
                <TextInput
                  style={styles.textArea}
                  multiline
                  numberOfLines={6}
                  placeholder="Write your reflection..."
                  placeholderTextColor={colors.earthMuted}
                  value={journalText}
                  onChangeText={setJournalText}
                  textAlignVertical="top"
                />
                <View style={styles.journalActions}>
                  <TouchableOpacity
                    style={[styles.continueButton, { flex: 1 }]}
                    onPress={handleSaveJournal}
                  >
                    <Text style={styles.continueButtonText}>
                      {journalText.trim() ? 'Save Reflection' : 'Skip'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {currentSection === 'complete' && journalText.trim() && (
              <View style={styles.savedReflection}>
                <Text style={[styles.bodyText, { fontStyle: 'italic' }]}>{journalText}</Text>
              </View>
            )}
          </View>
        )}

      {/* ─── Completion ─── */}
      {currentSection === 'complete' && (
        <View style={styles.completionSection}>
          <View style={styles.divider} />
          <View style={styles.completionCard}>
            <Ionicons name="checkmark-circle" size={48} color={colors.sage} />
            <Text style={styles.completionTitle}>Lesson Complete</Text>
            <Text style={styles.completionBody}>
              {isAuthenticated
                ? 'Your progress has been saved.'
                : 'Create an account to save your progress.'}
            </Text>
            <TouchableOpacity style={styles.continueButton} onPress={() => router.back()}>
              <Text style={styles.continueButtonText}>Back to Module</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <SignupPrompt visible={showSignup} onDismiss={() => setShowSignup(false)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sand },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl + 40 },

  backButton: { marginBottom: spacing.lg, alignSelf: 'flex-start' as const },
  backButtonText: { color: colors.clay, fontSize: 15, fontWeight: '500' as const },

  title: { ...textStyles.h1, marginBottom: spacing.xs },
  subtitle: {
    ...textStyles.body,
    color: colors.clay,
    fontStyle: 'italic' as const,
    marginBottom: spacing.sm,
  },
  meta: { ...textStyles.bodySmall, color: colors.earthMuted, marginBottom: spacing.xl },

  // Teaching
  teachingContent: { gap: spacing.lg, marginBottom: spacing.lg },
  bodyText: { ...textStyles.body, lineHeight: 28 },
  highlightBox: {
    backgroundColor: colors.sandLight,
    borderLeftWidth: 3,
    borderLeftColor: colors.clay,
    borderRadius: radius.sm,
    padding: spacing.lg,
  },
  highlightText: {
    ...textStyles.body,
    color: colors.earth,
    fontWeight: '500' as const,
    lineHeight: 26,
  },

  // Sections
  section: { marginBottom: spacing.lg },
  divider: { height: 1, backgroundColor: colors.sandDark, marginVertical: spacing.xl },
  sectionLabel: { ...textStyles.caption, color: colors.clay, marginBottom: spacing.md },

  // Quiz
  questionText: { ...textStyles.h3, lineHeight: 26, marginBottom: spacing.md },
  optionsContainer: { gap: spacing.sm, marginBottom: spacing.md },
  option: {
    backgroundColor: colors.sandLight,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.sandDark,
  },
  optionSelected: { backgroundColor: colors.earth, borderColor: colors.earth },
  optionCorrect: { backgroundColor: colors.sage, borderColor: colors.sage },
  optionIncorrect: { backgroundColor: colors.terracotta, borderColor: colors.terracotta },
  optionText: { ...textStyles.body, fontSize: 15 },
  explanationBox: {
    backgroundColor: colors.sandLight,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.sage,
    marginTop: spacing.sm,
  },
  explanationText: { ...textStyles.body, color: colors.earthLight, lineHeight: 24 },

  // Challenge
  challengeTitle: { ...textStyles.h2, marginBottom: spacing.xs },
  durationBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.xs,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  durationText: { ...textStyles.bodySmall, color: colors.earthMuted },
  acceptedBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  acceptedText: { color: colors.sage, fontWeight: '500' as const, fontSize: 14 },

  // Journal
  promptText: { ...textStyles.body, fontStyle: 'italic' as const, marginBottom: spacing.md },
  textArea: {
    backgroundColor: colors.sandLight,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.sandDark,
    fontSize: 16,
    color: colors.earth,
    lineHeight: 24,
    minHeight: 140,
    marginBottom: spacing.md,
  },
  journalActions: { flexDirection: 'row' as const, gap: spacing.sm },
  savedReflection: {
    backgroundColor: colors.sandLight,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginTop: spacing.sm,
  },

  // Completion
  completionSection: { marginBottom: spacing.xl },
  completionCard: {
    alignItems: 'center' as const,
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  completionTitle: { ...textStyles.h2, color: colors.sage },
  completionBody: {
    ...textStyles.bodySmall,
    textAlign: 'center' as const,
    paddingHorizontal: spacing.lg,
  },

  // Shared
  continueButton: {
    backgroundColor: colors.earth,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center' as const,
    marginTop: spacing.md,
  },
  continueButtonText: {
    color: colors.sand,
    fontWeight: '600' as const,
    fontSize: 15,
    letterSpacing: 0.3,
  },
});
