import { ConnectionMap } from "@/components/ConnectionMap";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
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

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { people, photos, user, isLoaded } = useApp();

  const peopleWithPhotos = useMemo(
    () => people.filter((p) => p.photoCount > 0),
    [people]
  );
  const couple = people.find((p) => p.isCouple);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const recentPhotos = useMemo(
    () =>
      [...photos]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3),
    [photos]
  );

  const topPeople = useMemo(
    () =>
      [...peopleWithPhotos]
        .sort((a, b) => b.photoCount - a.photoCount)
        .slice(0, 5),
    [peopleWithPhotos]
  );

  if (!isLoaded) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <View>
          <Text style={[styles.appTitle, { color: colors.primary }]}>FourLink</Text>
          <Text style={[styles.appSub, { color: colors.mutedForeground }]}>인연 지도</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.bellBtn}>
            <Feather name="bell" size={20} color={colors.foreground} />
          </TouchableOpacity>
          {couple && (
            <TouchableOpacity
              style={[styles.couplePill, { backgroundColor: colors.primary }]}
              onPress={() => router.push(`/person/${couple.id}` as any)}
            >
              <Feather name="heart" size={11} color="white" />
              <Text style={styles.couplePillText}>
                내 D+{getDayCount(couple.coupleStartDate)}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          Platform.OS === "web" && { paddingBottom: 34 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Connection Map */}
        <View style={styles.mapWrap}>
          <ConnectionMap
            people={peopleWithPhotos}
            userName={user.nickname}
            onPersonPress={(id) => router.push(`/person/${id}` as any)}
            onAddPress={() => router.push("/(tabs)/upload" as any)}
          />
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {/* 네컷 */}
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.statIcon, { backgroundColor: "#FFF0E8" }]}>
              <Feather name="camera" size={16} color={colors.primary} />
            </View>
            <Text style={[styles.statNum, { color: colors.foreground }]}>{photos.length}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>네컷</Text>
          </View>
          {/* 인연 */}
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.statIcon, { backgroundColor: "#F0FAF0" }]}>
              <Feather name="users" size={16} color="#66BB6A" />
            </View>
            <Text style={[styles.statNum, { color: colors.foreground }]}>{peopleWithPhotos.length}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>인연</Text>
          </View>
          {/* 일째 */}
          {couple ? (
            <TouchableOpacity
              style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push(`/person/${couple.id}` as any)}
            >
              <View style={[styles.statIcon, { backgroundColor: "#FFF0F5" }]}>
                <Feather name="heart" size={16} color="#F06292" />
              </View>
              <Text style={[styles.statNum, { color: colors.foreground }]}>
                {getDayCount(couple.coupleStartDate)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>일째</Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.statIcon, { backgroundColor: "#FFF0F5" }]}>
                <Feather name="heart" size={16} color="#F06292" />
              </View>
              <Text style={[styles.statNum, { color: colors.foreground }]}>-</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>일째</Text>
            </View>
          )}
        </View>

        {/* Two-column bottom */}
        <View style={styles.twoCol}>
          {/* Recent Photos */}
          <View style={[styles.colCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.colHeader}>
              <Text style={[styles.colTitle, { color: colors.foreground }]}>최근 네컷</Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/timeline" as any)}>
                <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            {recentPhotos.length === 0 ? (
              <View style={styles.colEmpty}>
                <Feather name="camera" size={24} color={colors.border} />
                <Text style={[styles.colEmptyText, { color: colors.mutedForeground }]}>기록 없음</Text>
              </View>
            ) : (
              recentPhotos.map((photo) => {
                const tagged = photo.taggedPeople
                  .map((id) => people.find((p) => p.id === id))
                  .filter(Boolean);
                return (
                  <TouchableOpacity
                    key={photo.id}
                    style={styles.recentItem}
                    onPress={() => router.push(`/photo/${photo.id}` as any)}
                  >
                    <View style={[styles.stripThumb, { backgroundColor: colors.secondary }]}>
                      <Feather name="camera" size={13} color={colors.primary} />
                    </View>
                    <View style={styles.recentInfo}>
                      <Text style={[styles.recentDate, { color: colors.mutedForeground }]}>
                        {formatDate(photo.date)}
                      </Text>

                      <View style={styles.recentPeople}>
                        {tagged.slice(0, 2).map((p, i) =>
                          p ? (
                            <View
                              key={p.id}
                              style={[
                                styles.miniAvatar,
                                { backgroundColor: colors.primary, marginLeft: i > 0 ? -5 : 0 },
                              ]}
                            >
                              <Text style={styles.miniAvatarText}>{p.name.charAt(0)}</Text>
                            </View>
                          ) : null
                        )}
                        {tagged.length > 2 && (
                          <View style={[styles.miniAvatar, { backgroundColor: colors.muted, marginLeft: -5 }]}>
                            <Text style={[styles.miniAvatarText, { color: colors.mutedForeground }]}>
                              +{tagged.length - 2}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <Feather name="chevron-right" size={12} color={colors.border} />
                  </TouchableOpacity>
                );
              })
            )}
            <TouchableOpacity
              style={[styles.colFooter, { borderTopColor: colors.border }]}
              onPress={() => router.push("/(tabs)/timeline" as any)}
            >
              <Text style={[styles.colFooterText, { color: colors.mutedForeground }]}>더보기</Text>
            </TouchableOpacity>
          </View>

          {/* Top People */}
          <View style={[styles.colCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.colHeader}>
              <Text style={[styles.colTitle, { color: colors.foreground }]}>자주 찍은 인연</Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/people" as any)}>
                <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            {topPeople.length === 0 ? (
              <View style={styles.colEmpty}>
                <Feather name="users" size={24} color={colors.border} />
                <Text style={[styles.colEmptyText, { color: colors.mutedForeground }]}>인연 없음</Text>
              </View>
            ) : (
              topPeople.map((person, i) => (
                <TouchableOpacity
                  key={person.id}
                  style={styles.topPersonRow}
                  onPress={() => router.push(`/person/${person.id}` as any)}
                >
                  <Text style={[styles.topPersonRank, { color: colors.mutedForeground }]}>
                    {i + 1}
                  </Text>
                  <Text style={[styles.topPersonName, { color: colors.foreground }]}>
                    {person.name}
                  </Text>
                  {person.isCouple && (
                    <Text style={{ color: "#F06292", fontSize: 10 }}>♥</Text>
                  )}
                  <Text style={[styles.topPersonCount, { color: colors.mutedForeground }]}>
                    {person.photoCount}장
                  </Text>
                </TouchableOpacity>
              ))
            )}
            <TouchableOpacity
              style={[styles.colFooter, { borderTopColor: colors.border }]}
              onPress={() => router.push("/(tabs)/people" as any)}
            >
              <Text style={[styles.colFooterText, { color: colors.mutedForeground }]}>모두 보기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  appTitle: {
    fontSize: 24,
    fontFamily: "Poppins_700Bold",
    letterSpacing: -0.5,
  },
  appSub: { fontSize: 12, fontFamily: "Poppins_400Regular", marginTop: -2 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8, paddingTop: 4 },
  bellBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  couplePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  couplePillText: {
    color: "white",
    fontSize: 11,
    fontFamily: "Poppins_600SemiBold",
  },
  scroll: { paddingHorizontal: 16, paddingBottom: 110, gap: 14 },
  mapWrap: { alignItems: "center", marginTop: -4 },
  statsRow: { flexDirection: "row", gap: 8 },
  statCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    alignItems: "center",
    gap: 3,
    shadowColor: "#FF8A65",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  statNum: { fontSize: 18, fontFamily: "Poppins_700Bold", lineHeight: 22 },
  statLabel: { fontSize: 10, fontFamily: "Poppins_400Regular" },
  twoCol: { flexDirection: "row", gap: 10 },
  colCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    overflow: "hidden",
    shadowColor: "#FF8A65",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  colHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  colTitle: { fontSize: 12, fontFamily: "Poppins_600SemiBold" },
  colEmpty: { alignItems: "center", paddingVertical: 20, gap: 6 },
  colEmptyText: { fontSize: 11, fontFamily: "Poppins_400Regular" },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 7,
  },
  stripThumb: {
    width: 36,
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  recentInfo: { flex: 1, gap: 2 },
  recentDate: { fontSize: 9, fontFamily: "Poppins_400Regular" },
  recentPeople: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  miniAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "white",
  },
  miniAvatarText: { fontSize: 7, color: "white", fontFamily: "Poppins_700Bold" },
  colFooter: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    alignItems: "center",
  },
  colFooterText: { fontSize: 11, fontFamily: "Poppins_500Medium" },
  topPersonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
  },
  topPersonRank: { fontSize: 11, fontFamily: "Poppins_600SemiBold", width: 14 },
  topPersonName: { flex: 1, fontSize: 12, fontFamily: "Poppins_500Medium" },
  topPersonCount: { fontSize: 11, fontFamily: "Poppins_400Regular" },
});
