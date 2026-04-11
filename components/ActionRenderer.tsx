// components/ActionRenderer.tsx
import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { colors, textStyles, spacing, radius } from '../constants/theme';
import type {
  ActionType,
  QuizAction,
  ReflectionAction,
  ChallengeAction,
  JournalAction,
} from '../types';

interface ActionRendererProps {
  actionType: ActionType;
  actionData: QuizAction | ReflectionAction | ChallengeAction | JournalAction;
  onComplete: (response?: Record<string, unknown>) => void;
}

export function ActionRenderer({ actionType, actionData, onComplete }: ActionRendererProps) {
  switch (actionType) {
    case 'quiz':
      return <QuizRenderer data={actionData as QuizAction} onComplete={onComplete} />;
    case 'reflection':
      return <ReflectionRenderer data={actionData as ReflectionAction} onComplete={onComplete} />;
    case 'challenge':
      return <ChallengeRenderer data={actionData as ChallengeAction} onComplete={onComplete} />;
    case 'journal':
      return <JournalRenderer data={actionData as JournalAction} onComplete={onComplete} />;
    default:
      return null;
  }
}

// ---- Quiz ----

function QuizRenderer({
  data,
  onComplete,
}: {
  data: QuizAction;
  onComplete: (response?: Record<string, unknown>) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (index: number) => {
    if (revealed) return;
    setSelected(index);
  };

  const handleCheck = () => {
    setRevealed(true);
  };

  const isCorrect = selected === data.correct_index;

  return (
    <View style={styles.actionContainer}>
      <Text style={styles.actionLabel}>REFLECT & RESPOND</Text>
      <Text style={styles.questionText}>{data.question}</Text>

      <View style={styles.optionsContainer}>
        {data.options.map((option, index) => {
          let optionStyle = styles.option;
          let textStyle = styles.optionText;

          if (revealed) {
            if (index === data.correct_index) {
              optionStyle = { ...styles.option, ...styles.optionCorrect };
              textStyle = { ...styles.optionText, ...styles.optionTextSelected };
            } else if (index === selected && !isCorrect) {
              optionStyle = { ...styles.option, ...styles.optionIncorrect };
              textStyle = { ...styles.optionText, ...styles.optionTextSelected };
            }
          } else if (index === selected) {
            optionStyle = { ...styles.option, ...styles.optionSelected };
            textStyle = { ...styles.optionText, ...styles.optionTextSelected };
          }

          return (
            <TouchableOpacity
              key={index}
              style={optionStyle}
              activeOpacity={0.7}
              onPress={() => handleSelect(index)}
              disabled={revealed}
            >
              <Text style={textStyle}>{option}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {selected !== null && !revealed && (
        <TouchableOpacity style={styles.primaryButton} onPress={handleCheck}>
          <Text style={styles.primaryButtonText}>Check Answer</Text>
        </TouchableOpacity>
      )}

      {revealed && (
        <View style={styles.explanationBox}>
          <Text style={styles.explanationText}>{data.explanation}</Text>
          <TouchableOpacity
            style={[styles.primaryButton, { marginTop: spacing.lg }]}
            onPress={() => onComplete({ selected, correct: isCorrect })}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ---- Reflection ----

function ReflectionRenderer({
  data,
  onComplete,
}: {
  data: ReflectionAction;
  onComplete: (response?: Record<string, unknown>) => void;
}) {
  const [text, setText] = useState('');

  return (
    <View style={styles.actionContainer}>
      <Text style={styles.actionLabel}>PAUSE & REFLECT</Text>
      <Text style={styles.promptText}>{data.prompt}</Text>

      <TextInput
        style={styles.textArea}
        multiline
        numberOfLines={6}
        placeholder="Write your reflection here..."
        placeholderTextColor={colors.earthMuted}
        value={text}
        onChangeText={setText}
        textAlignVertical="top"
      />

      <TouchableOpacity
        style={[styles.primaryButton, !text.trim() && styles.buttonDisabled]}
        onPress={() => onComplete({ reflection: text, saved_to_journal: data.save_to_journal })}
        disabled={!text.trim()}
      >
        <Text style={styles.primaryButtonText}>
          {data.save_to_journal ? 'Save to Journal & Complete' : 'Complete'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ---- Challenge ----

function ChallengeRenderer({
  data,
  onComplete,
}: {
  data: ChallengeAction;
  onComplete: (response?: Record<string, unknown>) => void;
}) {
  const [accepted, setAccepted] = useState(false);
  const [checkInText, setCheckInText] = useState('');

  if (!accepted) {
    return (
      <View style={styles.actionContainer}>
        <Text style={styles.actionLabel}>CHALLENGE</Text>
        <Text style={styles.challengeTitle}>{data.title}</Text>
        <Text style={styles.promptText}>{data.description}</Text>
        <Text style={styles.challengeDuration}>
          Duration: {data.duration_hours} hours
        </Text>

        <TouchableOpacity style={styles.primaryButton} onPress={() => setAccepted(true)}>
          <Text style={styles.primaryButtonText}>Accept Challenge</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.actionContainer}>
      <Text style={styles.actionLabel}>CHECK IN</Text>
      <Text style={styles.promptText}>{data.check_in_prompt}</Text>

      <TextInput
        style={styles.textArea}
        multiline
        numberOfLines={6}
        placeholder="How did it go?"
        placeholderTextColor={colors.earthMuted}
        value={checkInText}
        onChangeText={setCheckInText}
        textAlignVertical="top"
      />

      <TouchableOpacity
        style={[styles.primaryButton, !checkInText.trim() && styles.buttonDisabled]}
        onPress={() => onComplete({ challenge_response: checkInText })}
        disabled={!checkInText.trim()}
      >
        <Text style={styles.primaryButtonText}>Complete Challenge</Text>
      </TouchableOpacity>
    </View>
  );
}

// ---- Journal ----

function JournalRenderer({
  data,
  onComplete,
}: {
  data: JournalAction;
  onComplete: (response?: Record<string, unknown>) => void;
}) {
  const [entries, setEntries] = useState<string[]>(data.prompts.map(() => ''));

  const updateEntry = (index: number, text: string) => {
    const updated = [...entries];
    updated[index] = text;
    setEntries(updated);
  };

  const allFilled = entries.every((e) => e.trim().length > 0);

  return (
    <View style={styles.actionContainer}>
      <Text style={styles.actionLabel}>JOURNAL</Text>

      {data.prompts.map((prompt, index) => (
        <View key={index} style={styles.journalPromptBlock}>
          <Text style={styles.promptText}>{prompt}</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={5}
            placeholder="Write freely..."
            placeholderTextColor={colors.earthMuted}
            value={entries[index]}
            onChangeText={(text) => updateEntry(index, text)}
            textAlignVertical="top"
          />
        </View>
      ))}

      <TouchableOpacity
        style={[styles.primaryButton, !allFilled && styles.buttonDisabled]}
        onPress={() => onComplete({ journal_entries: entries })}
        disabled={!allFilled}
      >
        <Text style={styles.primaryButtonText}>Save to Journal</Text>
      </TouchableOpacity>
    </View>
  );
}

// ---- Shared styles ----

const styles = StyleSheet.create({
  actionContainer: {
    gap: spacing.md,
  },
  actionLabel: {
    ...textStyles.caption,
    color: colors.clay,
    marginBottom: spacing.xs,
  },
  questionText: {
    ...textStyles.h3,
    lineHeight: 26,
    marginBottom: spacing.sm,
  },
  promptText: {
    ...textStyles.body,
    lineHeight: 26,
    fontStyle: 'italic',
  },
  challengeTitle: {
    ...textStyles.h2,
    marginBottom: spacing.xs,
  },
  challengeDuration: {
    ...textStyles.bodySmall,
    color: colors.earthMuted,
  },
  optionsContainer: {
    gap: spacing.sm,
  },
  option: {
    backgroundColor: colors.sandLight,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.sandDark,
  },
  optionSelected: {
    backgroundColor: colors.earth,
    borderColor: colors.earth,
  },
  optionCorrect: {
    backgroundColor: colors.sage,
    borderColor: colors.sage,
  },
  optionIncorrect: {
    backgroundColor: colors.terracotta,
    borderColor: colors.terracotta,
  },
  optionText: {
    ...textStyles.body,
    fontSize: 15,
  },
  optionTextSelected: {
    color: colors.white,
  },
  explanationBox: {
    backgroundColor: colors.sandLight,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.sage,
    marginTop: spacing.sm,
  },
  explanationText: {
    ...textStyles.body,
    color: colors.earthLight,
    lineHeight: 24,
  },
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
  },
  journalPromptBlock: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.earth,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.sand,
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: 0.3,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
});
