import { Stack } from 'expo-router';
import { colors } from '../../../constants/theme';

export default function PathLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.sand },
        headerTintColor: colors.earth,
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: '600',
          letterSpacing: 0.5,
        },
        headerBackTitle: '',
        headerBackVisible: false,
      }}
    />
  );
}
