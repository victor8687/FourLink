import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient();

function AuthGate() {
  const { user, profile, loading, isConfigured } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuth = segments[0] === "(auth)";

    if (!isConfigured) {
      // Firebase not configured — let users access the app in demo mode
      return;
    }

    if (!user) {
      // Not logged in → go to login
      if (!inAuth) router.replace("/(auth)/login");
    } else if (!profile?.onboardingCompleted) {
      // Logged in but onboarding not done
      if (segments[1] !== "onboarding") {
        router.replace("/(auth)/onboarding");
      }
    } else {
      // Fully authenticated
      if (inAuth) router.replace("/(tabs)");
    }
  }, [user, profile, loading, isConfigured, segments]);

  return null;
}

function RootLayoutNav() {
  return (
    <>
      <AuthGate />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="person/[id]"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="photo/[id]"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded, fontError]);

  // Show cream background only while fonts load (max 1 render cycle)
  if (!fontsLoaded && !fontError) {
    return <View style={{ flex: 1, backgroundColor: "#FAF8F5" }} />;
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
              <AuthProvider>
                <AppProvider>
                  <RootLayoutNav />
                </AppProvider>
              </AuthProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
