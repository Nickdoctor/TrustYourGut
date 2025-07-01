import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth/Register" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <StatusBar style="light" />
      <Toast />
    </>
  );
}
