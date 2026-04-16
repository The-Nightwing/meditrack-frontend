import { Stack } from 'expo-router';
import { Colors } from '@/styles/colors';

export default function MitigationLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
