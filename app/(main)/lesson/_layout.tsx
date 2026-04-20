import { Stack } from 'expo-router';
import { colors } from '../../../constants/theme';

export default function LessonLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.sand },
      }}
    />
  );
}
