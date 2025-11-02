import "../global.css";
import "@/utils/fetch-polyfill";

import { Stack } from "expo-router";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { AuthProvider } from "../context/AuthContext";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export { ErrorBoundary } from "expo-router";

// These are the default stack options for iOS, they disable on other platforms.
const DEFAULT_STACK_HEADER: NativeStackNavigationOptions =
  process.env.EXPO_OS !== "ios"
    ? {}
    : {
      headerTransparent: false,
      headerShadowVisible: true,
      headerLargeTitleShadowVisible: false,
    };

function RootLayout() {
  const { loadAuth } = useAuth();

  useEffect(() => {
    loadAuth();
  }, []);

  return (
    <Stack screenOptions={DEFAULT_STACK_HEADER}>
      <Stack.Screen
        name="index"
        options={{
          title: "EXE+ AI Interview",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          title: "Login",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: "Register",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="exams"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="interviews"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="analytics"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="payments"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}

export default function Layout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootLayout />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
