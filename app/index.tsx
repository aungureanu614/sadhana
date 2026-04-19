// app/index.tsx
import { Redirect } from 'expo-router';
import { useStore } from '../lib/store';

export default function Index() {
  const { hasSeenIntention } = useStore();

  if (!hasSeenIntention) return <Redirect href="/(main)/intention" />;
  return <Redirect href="/(main)/home" />;
}
