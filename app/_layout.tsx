import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false, animation: 'fade_from_bottom', contentStyle: { backgroundColor: '#0A0010' } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="level-select" />
        <Stack.Screen name="game" options={{ gestureEnabled: false }} />
        <Stack.Screen name="forfeit" options={{ presentation: 'modal', animation: 'slide_from_bottom', gestureEnabled: true }} />
        <Stack.Screen name="results" options={{ gestureEnabled: false }} />
        <Stack.Screen name="settings" options={{ presentation: 'modal', animation: 'slide_from_bottom', gestureEnabled: true }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
