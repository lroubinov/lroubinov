import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { Exo2_700Bold, Exo2_800ExtraBold } from '@expo-google-fonts/exo-2';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ BebasNeue_400Regular, Exo2_700Bold, Exo2_800ExtraBold });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#060410' }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false, animation: 'fade_from_bottom', contentStyle: { backgroundColor: '#060410' } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="level-select" />
        <Stack.Screen name="game" options={{ gestureEnabled: false }} />
        <Stack.Screen name="forfeit" options={{ presentation: 'modal', animation: 'slide_from_bottom', gestureEnabled: true }} />
        <Stack.Screen name="results" options={{ gestureEnabled: false }} />
        <Stack.Screen name="prize" options={{ animation: 'slide_from_bottom', gestureEnabled: true }} />
        <Stack.Screen name="settings" options={{ presentation: 'modal', animation: 'slide_from_bottom', gestureEnabled: true }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
