// app/index.tsx
import { Redirect } from 'expo-router';
import { useStore } from '../lib/store';

export default function Index() {
  const { session } = useStore();
  return <Redirect href={session ? '/(main)/home' : '/(auth)/login'} />;
}
