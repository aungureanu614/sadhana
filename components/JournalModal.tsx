// components/JournalModal.tsx
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useStore } from '../lib/store';
import { colors, textStyles, spacing, radius } from '../constants/theme';

const moods = ['😌 Calm', '⚡ Restless', '🙏 Grateful', '😔 Heavy', '✨ Inspired'];

interface Props {
  visible: boolean;
  onDismiss: () => void;
  prompt?: string;
  lessonId?: string;
}

export default function JournalModal({ visible, onDismiss, prompt, lessonId }: Props) {
  const { session, saveJournalEntry } = useStore();
  const [body, setBody] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!body.trim() || !session) return;
    await saveJournalEntry({
      lessonId: lessonId || undefined,
      prompt: prompt || undefined,
      body: body.trim(),
      mood: selectedMood || undefined,
    });
    setSaved(true);
    setTimeout(() => {
      handleClose();
    }, 1200);
  };

  const handleClose = () => {
    setBody('');
    setSelectedMood(null);
    setSaved(false);
    onDismiss();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Journal</Text>
          <TouchableOpacity onPress={handleSave} disabled={!body.trim() || !session}>
            <Text style={[styles.saveText, (!body.trim() || !session) && { opacity: 0.4 }]}>
              Save
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Saved confirmation */}
          {saved && (
            <View style={styles.savedBanner}>
              <Text style={styles.savedText}>✓ Saved to your journal</Text>
            </View>
          )}

          {/* Prompt */}
          {prompt && <Text style={styles.prompt}>{prompt}</Text>}

          {/* Text input */}
          <TextInput
            style={styles.textArea}
            multiline
            placeholder={prompt ? 'Write your reflection...' : "What's on your mind?"}
            placeholderTextColor={colors.earthMuted}
            value={body}
            onChangeText={setBody}
            textAlignVertical="top"
            autoFocus
          />

          {/* Mood selector */}
          <Text style={styles.moodLabel}>HOW ARE YOU FEELING?</Text>
          <View style={styles.moodRow}>
            {moods.map((m) => {
              const key = m.split(' ')[1].toLowerCase();
              const selected = selectedMood === key;
              return (
                <TouchableOpacity
                  key={m}
                  style={[styles.moodChip, selected && styles.moodChipSelected]}
                  onPress={() => setSelectedMood(selected ? null : key)}
                >
                  <Text style={[styles.moodChipText, selected && styles.moodChipTextSelected]}>
                    {m}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {!session && (
            <View style={styles.anonNote}>
              <Text style={styles.anonNoteText}>Create an account to save journal entries.</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sand },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.sandDark,
  },
  headerTitle: { ...textStyles.h3 },
  cancelText: { color: colors.earthMuted, fontSize: 15 },
  saveText: { color: colors.clay, fontSize: 15, fontWeight: '600' },

  // Body
  body: { flex: 1 },
  bodyContent: { padding: spacing.lg, paddingBottom: spacing.xxl },

  // Saved
  savedBanner: {
    backgroundColor: colors.sage,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  savedText: { color: colors.white, fontWeight: '600', fontSize: 14 },

  // Prompt
  prompt: {
    ...textStyles.body,
    fontStyle: 'italic',
    color: colors.earthLight,
    marginBottom: spacing.md,
    lineHeight: 24,
  },

  // Text area
  textArea: {
    backgroundColor: colors.sandLight,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.sandDark,
    fontSize: 16,
    color: colors.earth,
    lineHeight: 26,
    minHeight: 180,
    marginBottom: spacing.xl,
  },

  // Mood
  moodLabel: { ...textStyles.caption, color: colors.clay, marginBottom: spacing.md },
  moodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl },
  moodChip: {
    backgroundColor: colors.sandLight,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.sandDark,
  },
  moodChipSelected: { backgroundColor: colors.earth, borderColor: colors.earth },
  moodChipText: { fontSize: 13, color: colors.earth },
  moodChipTextSelected: { color: colors.sand },

  // Anon
  anonNote: {
    backgroundColor: colors.sandLight,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.clay,
  },
  anonNoteText: { ...textStyles.bodySmall, color: colors.earthLight, lineHeight: 22 },
});
