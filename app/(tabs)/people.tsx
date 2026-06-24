import React, { useMemo } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Platform, ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { Person } from "@/context/AppContext";

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default function PeopleScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { people, isLoaded } = useApp();

  const sorted = useMemo(
    () => [...people].sort((a, b) => b.photoCount - a.photoCount),
    [people]
  );

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (!isLoaded) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const renderItem = ({ item, index }: { item: Person; index: number }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(`/person/${item.id}` as any)}
      activeOpacity={0.85}
    >
      <View style={[styles.avatar, { backgroundColor: item.isCouple ? colors.primary : colors.secondary }]}>
        {item.isCouple ? (
          <Feather name="heart" size={18} color="white" />
        ) : (
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {item.name.charAt(0)}
          </Text>
        )}
      </View>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: colors.foreground }]}>{item.name}</Text>
          {item.isCouple && (
            <View style={[styles.coupleBadge, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.coupleBadgeText, { color: colors.primary }]}>커플</Text>
            </View>
          )}
        </View>
        <Text style={[styles.count, { color: colors.mutedForeground }]}>
          {item.photoCount}장의 네컷
          {item.lastPhotoDate ? ` · 최근 ${formatDate(item.lastPhotoDate)}` : ""}
        </Text>
      </View>
      <View style={styles.right}>
        {index === 0 && item.photoCount > 0 && (
          <View style={[styles.topBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.topBadgeText}>1위</Text>
          </View>
        )}
        <Feather name="chevron-right" size={16} color={colors.border} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>인연</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {people.length}명
        </Text>
      </View>

      {sorted.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="users" size={40} color={colors.muted} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            아직 인연이 없어요
          </Text>
          <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>
            네컷을 추가할 때 사람을 태그하면{"\n"}여기에 나타나요
          </Text>
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.list,
            Platform.OS === "web" && { paddingBottom: 34 },
          ]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!!sorted.length}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  title: { fontSize: 24, fontFamily: "Poppins_700Bold" },
  subtitle: { fontSize: 12, fontFamily: "Poppins_400Regular" },
  list: { paddingHorizontal: 20, paddingBottom: 110, gap: 10 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 18, fontFamily: "Poppins_700Bold" },
  info: { flex: 1, gap: 3 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { fontSize: 15, fontFamily: "Poppins_600SemiBold" },
  coupleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  coupleBadgeText: { fontSize: 10, fontFamily: "Poppins_600SemiBold" },
  count: { fontSize: 12, fontFamily: "Poppins_400Regular" },
  right: { flexDirection: "row", alignItems: "center", gap: 6 },
  topBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  topBadgeText: {
    color: "white",
    fontSize: 10,
    fontFamily: "Poppins_600SemiBold",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingBottom: 80,
  },
  emptyTitle: { fontSize: 16, fontFamily: "Poppins_600SemiBold" },
  emptyBody: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
});
