// app/(main)/path/[moduleSlug].tsx
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useStore } from '../../../lib/store';
import { LessonCard } from '../../../components/LessonCard';
import { ActionRenderer } from '../../../components/ActionRenderer';
import { colors, textStyles, spacing, radius } from '../../../constants/theme';
import type { Lesson } from '../../../types';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function ModuleDetailScreen() {
  const { moduleSlug, moduleId } = useLocalSearchParams<{
    moduleSlug: string;
    moduleId: string;
  }>();
  const router = useRouter();
  const {
    session,
    modules,
    paths,
    lessons,
    fetchLessons,
    getLessonsForModule,
    isLessonCompleted,
    completeLesson,
  } = useStore();

  const isAuthenticated = !!session;
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  const module = modules.find((m) => m.id === moduleId);
  const moduleLessons = getLessonsForModule(moduleId);
  const path = module ? paths.find((p) => p.id === module.path_id) : null;

  // Find first uncompleted lesson
  const nextLessonId = isAuthenticated
    ? (moduleLessons.find((l) => !isLessonCompleted(l.id))?.id ?? null)
    : null;

  const navigation = useNavigation();

  useEffect(() => {
    if (module) {
      navigation.setOptions({ title: module.name });
    }
  }, [module, navigation]);

  useEffect(() => {
    if (moduleId) {
      fetchLessons(moduleId);
    }
  }, [moduleId]);

  const handleLessonComplete = async (lessonId: string, response?: Record<string, unknown>) => {
    await completeLesson(lessonId, response);
    setActiveLesson(null);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Back button */}
      {path && (
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← {path.name}</Text>
        </TouchableOpacity>
      )}

      {/* Module Header */}
      {module && (
        <View style={styles.header}>
          <Text style={styles.title}>{module.name}</Text>
          <Text style={styles.subtitle}>
            {module.name_sanskrit ? `${module.name_sanskrit} · ` : ''}
            {module.subtitle}
          </Text>
          {module.description && <Text style={styles.description}>{module.description}</Text>}

          {/* Progress — authenticated only */}
          {isAuthenticated && moduleLessons.length > 0 && (
            <View style={styles.progressRow}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${(moduleLessons.filter((l) => isLessonCompleted(l.id)).length / moduleLessons.length) * 100}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {moduleLessons.filter((l) => isLessonCompleted(l.id)).length} /{' '}
                {moduleLessons.length}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Lessons */}
      <View style={styles.lessonsList}>
        {moduleLessons.map((lesson, index) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            index={index + 1}
            isCompleted={isLessonCompleted(lesson.id)}
            isNext={lesson.id === nextLessonId}
            isAnonymous={!isAuthenticated}
            onPress={() => setActiveLesson(lesson)}
          />
        ))}
      </View>

      {/* Lesson Modal */}
      <Modal
        visible={activeLesson !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setActiveLesson(null)}
      >
        {activeLesson && (
          <KeyboardAwareScrollView
            style={styles.modalContainer}
            contentContainerStyle={styles.modalContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            enableOnAndroid={true}
            extraScrollHeight={100}
          >
            <ScrollView
              style={styles.modalContainer}
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Close button */}
              <TouchableOpacity style={styles.closeButton} onPress={() => setActiveLesson(null)}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>

              {/* Lesson title */}
              <Text style={styles.lessonTitle}>{activeLesson.title}</Text>
              <Text style={styles.lessonSubtitle}>{activeLesson.subtitle}</Text>

              {/* Teaching content blocks */}
              <View style={styles.teachingContent}>
                {activeLesson.teaching_content.blocks.map((block, i) => (
                  <View key={i}>
                    {block.type === 'text' && (
                      <Text style={styles.teachingText}>{block.content}</Text>
                    )}
                    {block.type === 'highlight' && (
                      <View style={styles.highlightBox}>
                        <Text style={styles.highlightText}>{block.content}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>

              {/* Interactive action */}
              <View style={styles.actionSection}>
                <View style={styles.actionDivider} />
                <ActionRenderer
                  actionType={activeLesson.action_type}
                  actionData={activeLesson.action_data}
                  onComplete={(response) => handleLessonComplete(activeLesson.id, response)}
                />
              </View>
            </ScrollView>
          </KeyboardAwareScrollView>
        )}
      </Modal>
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
  },
  backButton: {
    marginBottom: spacing.lg,
    alignSelf: 'flex-start' as const,
  },
  backButtonText: {
    color: colors.clay,
    fontSize: 15,
    fontWeight: '500' as const,
  },
  title: {
    ...textStyles.h1,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...textStyles.body,
    color: colors.clay,
    fontWeight: '500',
    marginBottom: spacing.md,
  },
  description: {
    ...textStyles.body,
    color: colors.earthLight,
    marginBottom: spacing.lg,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.sandDark,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.sage,
    borderRadius: radius.full,
  },
  progressText: {
    ...textStyles.caption,
    color: colors.sage,
  },
  lessonsList: {
    gap: spacing.md,
  },

  // ---- Modal styles ----
  modalContainer: {
    flex: 1,
    backgroundColor: colors.sand,
  },
  modalContent: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  closeButton: {
    alignSelf: 'flex-end',
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.sandDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  closeButtonText: {
    color: colors.earthLight,
    fontSize: 16,
    fontWeight: '600',
  },
  lessonTitle: {
    ...textStyles.h1,
    marginBottom: spacing.xs,
  },
  lessonSubtitle: {
    ...textStyles.body,
    color: colors.clay,
    fontStyle: 'italic',
    marginBottom: spacing.xl,
  },
  teachingContent: {
    gap: spacing.lg,
  },
  teachingText: {
    ...textStyles.body,
    lineHeight: 28,
  },
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
    fontWeight: '500',
    lineHeight: 26,
  },
  actionSection: {
    marginTop: spacing.xl,
  },
  actionDivider: {
    height: 1,
    backgroundColor: colors.sandDark,
    marginBottom: spacing.xl,
  },
});
