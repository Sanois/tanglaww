import { Stack } from "expo-router";

export default function MaterialsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="handout" />
      <Stack.Screen name="recorded-sessions" />
    </Stack>
  );
}
