import { PhotoCard } from "@/components/PhotoCard";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function getDayCount(startDate?: string) {
  if (!startDate) return 0;
  const diff = Date.now() - new Date(startDate).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

export default function PersonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { getPersonById, getPhotosForPerson, people } = useApp();

  const person = getPersonById(id ?? "");
  const photos = getPhotosForPerson(id ?? "");
  const sorted = [...photos].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (!person) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 8 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground }]}>인연 없음</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.title, { color: colors.foreground }]}>{person.name}</Text>
          {person.isCouple && (
            <Feather name="heart" size={16} color={colors.primary} />
          )}
        </View>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={[styles.personCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.avatar, { backgroundColor: person.isCouple ? colors.primary : colors.secondary }]}>
              {person.isCouple ? (
                <Feather name="heart" size={22} color="white" />
              ) : (
                <Text style={[styles.avatarText, { color: colors.primary }]}>
                  {person.name.charAt(0)}
                </Text>
              )}
            </View>
            <Text style={[styles.personName, { color: colors.foreground }]}>
              {person.name}
            </Text>
            <View style={styles.statsRow}>
              <View style={[styles.statChip, { backgroundColor: colors.secondary }]}>
                <Text
                  style={[
                    styles.statNum,
                    { color: colors.primary },
                  ]}
                >
                  {photos.length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                  장의 네컷
                </Text>
              </View>
              {person.isCouple && person.coupleStartDate && (
                <View style={[styles.statChip, { backgroundColor: colors.secondary }]}>
                  <Text style={[styles.statNum, { color: colors.primary }]}>
                    D+{getDayCount(person.coupleStartDate)}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                    커플
                  </Text>
                </View>
              )}
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <PhotoCard
            photo={item}
            people={people}
            onPress={() => router.push(`/photo/${item.id}` as any)}
          />
        )}
        contentContainerStyle={[
          styles.list,
          Platform.OS === "web" && { paddingBottom: 34 },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="image" size={32} color={colors.muted} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              함께 찍은 네컷이 없어요
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerCenter: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  title: { fontSize: 20, fontFamily: "Poppins_700Bold" },
  list: { paddingHorizontal: 20, paddingBottom: 50, gap: 0 },
  personCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  avatarText: { fontSize: 28, fontFamily: "Poppins_700Bold" },
  personName: { fontSize: 20, fontFamily: "Poppins_700Bold" },
  statsRow: { flexDirection: "row", gap: 10 },
  statChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    alignItems: "center",
    gap: 2,
  },
  statNum: { fontSize: 20, fontFamily: "Poppins_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Poppins_400Regular" },
  empty: {
    alignItems: "center",
    gap: 8,
    marginTop: 20,
  },
  emptyText: { fontSize: 14, fontFamily: "Poppins_400Regular" },
});
