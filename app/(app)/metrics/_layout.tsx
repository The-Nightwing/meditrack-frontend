import { Stack } from 'expo-router';
import { Colors } from '@/styles/colors';

export default function MetricsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[code]" />
    </Stack>
  );
}
