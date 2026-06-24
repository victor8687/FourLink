import { PhotoCard } from "@/components/PhotoCard";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MONTHS = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

export default function TimelineScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { photos, people, isLoaded } = useApp();

  const sortedPhotos = useMemo(() => {
    return [...photos].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [photos]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (!isLoaded) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>타임라인</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {photos.length}장의 네컷
        </Text>
      </View>

      {sortedPhotos.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="clock" size={40} color={colors.muted} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            아직 기록이 없어요
          </Text>
          <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>
            첫 네컷을 추가하면 타임라인이 시작돼요
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedPhotos}
          numColumns={2}
          keyExtractor={(item) => item.id}
          columnWrapperStyle={{
            justifyContent: "space-between",
          }}
          renderItem={({ item }) => (
            <View style={{ width: "48%" }}>
              <PhotoCard
                photo={item}
                people={people}
                compact
                onPress={() => router.push(`/photo/${item.id}` as any)}
              />
            </View>
          )}
          contentContainerStyle={[
            styles.list,
            Platform.OS === "web" && { paddingBottom: 34 },
          ]}
          showsVerticalScrollIndicator={false}
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
  list: { paddingHorizontal: 20, paddingBottom: 110 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 4,
  },
  sectionTitle: { fontSize: 15, fontFamily: "Poppins_600SemiBold" },
  sectionCount: { fontSize: 12, fontFamily: "Poppins_400Regular" },
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
