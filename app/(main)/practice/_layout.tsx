// app/(main)/practice/_layout.tsx
import { Stack } from 'expo-router';
import { colors } from '../../../constants/theme';

export default function PracticeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.sand },
      }}
    />
  );
}
