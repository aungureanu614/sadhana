// components/SignupPrompt.tsx
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, textStyles, spacing, radius } from '../constants/theme';

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

export default function SignupPrompt({ visible, onDismiss }: Props) {
  const router = useRouter();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={[textStyles.h2, { marginBottom: spacing.sm }]}>Save your progress</Text>
          <Text style={[textStyles.body, { marginBottom: spacing.xl, color: colors.earthLight }]}>
            Create a free account to track your journey, set daily intentions, and get personalized
            recommendations.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              onDismiss();
              router.push('/(auth)/login');
            }}
          >
            <Text style={styles.primaryButtonText}>Create account</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.textButton} onPress={onDismiss}>
            <Text style={styles.textButtonText}>Not now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  sheet: {
    backgroundColor: colors.sandLight,
    borderRadius: radius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 360,
  },
  primaryButton: {
    backgroundColor: colors.clay,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  primaryButtonText: { color: colors.white, fontWeight: '600', fontSize: 16 },
  textButton: { alignItems: 'center', paddingVertical: spacing.sm },
  textButtonText: { color: colors.earthMuted, fontSize: 15 },
});
