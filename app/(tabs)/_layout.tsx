import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Platform, StyleSheet, View,
  TouchableOpacity, useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

export default function TabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";
  const insets = useSafeAreaInsets();

  const tabBarHeight = isWeb ? 64 : 52 + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarLabelStyle: {
          fontFamily: "Poppins_500Medium",
          fontSize: 10,
          marginTop: 2,
        },
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          height: tabBarHeight,
          paddingBottom: isWeb ? 4 : insets.bottom,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={85}
              tint={isDark ? "dark" : "extraLight"}
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.card }]} />
          ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "홈",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="house" tintColor={color} size={22} />
            ) : (
              <Feather name="home" size={21} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="timeline"
        options={{
          title: "타임라인",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="clock" tintColor={color} size={22} />
            ) : (
              <Feather name="clock" size={21} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          title: "",
          tabBarLabel: () => null,
          tabBarIcon: () => null,
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              style={styles.floatingWrap}
              activeOpacity={0.88}
            >
              <View style={[styles.floatingBtn, { backgroundColor: colors.primary }]}>
                <Feather name="plus" size={26} color="white" />
              </View>
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="people"
        options={{
          title: "인연",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="person.2" tintColor={color} size={22} />
            ) : (
              <Feather name="users" size={21} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "프로필",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="person.circle" tintColor={color} size={22} />
            ) : (
              <Feather name="user" size={21} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  floatingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: -20,
  },
  floatingBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF8A65",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 10,
  },
});
