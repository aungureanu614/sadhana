// app/index.tsx
import { Redirect } from 'expo-router';
import { useStore } from '../lib/store';

export default function Index() {
  const { session, hasSeenIntention } = useStore();

  if (!session) return <Redirect href="/(auth)/login" />;
  if (!hasSeenIntention) return <Redirect href="/(main)/intention" />;
  return <Redirect href="/(main)/home" />;
}
