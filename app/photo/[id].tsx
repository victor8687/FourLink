import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default function PhotoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { photos, people, deletePhoto } = useApp();

  const photo = photos.find((p) => p.id === id);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (!photo) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 8 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </TouchableOpacity>
        </View>
        <View style={styles.notFound}>
          <Text style={[styles.notFoundText, { color: colors.mutedForeground }]}>
            사진을 찾을 수 없어요
          </Text>
        </View>
      </View>
    );
  }

  const taggedPeople = photo.taggedPeople
    .map((pid) => people.find((p) => p.id === pid))
    .filter(Boolean);

  const handleDelete = () => {
    Alert.alert("네컷 삭제", "이 네컷을 삭제할까요? 복구할 수 없어요.", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          await deletePhoto(photo.id);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          router.back();
        },
      },
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerDate, { color: colors.foreground }]}>
          {formatDate(photo.date)}
        </Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
          <Feather name="trash-2" size={18} color={colors.destructive} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          Platform.OS === "web" && { paddingBottom: 34 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.filmStrip, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.filmHoles, { backgroundColor: colors.background }]}>
            {[0,1,2,3,4,5].map((i) => (
              <View key={i} style={[styles.hole, { backgroundColor: colors.muted }]} />
            ))}
          </View>
          <View style={styles.imageWrap}>
            {photo.uri ? (
              <Image
                source={{ uri: photo.uri }}
                style={styles.image}
                resizeMode="contain"
              />
            ) : (
              <View style={[styles.noImage, { backgroundColor: colors.muted }]}>
                <Feather name="image" size={40} color={colors.mutedForeground} />
              </View>
            )}
          </View>
          <View style={[styles.filmHoles, { backgroundColor: colors.background }]}>
            {[0,1,2,3,4,5].map((i) => (
              <View key={i} style={[styles.hole, { backgroundColor: colors.muted }]} />
            ))}
          </View>
        </View>

        <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
 
          {taggedPeople.length > 0 && (
            <View style={styles.detailSection}>
              <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>
                함께한 사람
              </Text>
              <View style={styles.tags}>
                {taggedPeople.map((p) => p && (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.tag, { backgroundColor: colors.secondary }]}
                    onPress={() => router.push(`/person/${p.id}` as any)}
                  >
                    <Text style={[styles.tagText, { color: colors.primary }]}>{p.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {photo.memo && (
            <View style={styles.detailSection}>
              <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>
                메모
              </Text>
              <Text style={[styles.memoText, { color: colors.foreground }]}>
                {photo.memo}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerDate: { flex: 1, textAlign: "center", fontSize: 15, fontFamily: "Poppins_600SemiBold" },
  deleteBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  scroll: { paddingHorizontal: 20, paddingBottom: 40, gap: 16 },
  filmStrip: {
    flexDirection: "row",
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    height: 450,
  },
  filmHoles: {
    width: 18,
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 14,
  },
  hole: { width: 10, height: 10, borderRadius: 5 },
  imageWrap: { flex: 1 },
  image: { width: "100%", height: "100%" },
  noImage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  detailCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  detailSection: { gap: 8 },
  detailLabel: { fontSize: 11, fontFamily: "Poppins_500Medium" },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  tagText: { fontSize: 13, fontFamily: "Poppins_500Medium" },
  memoText: { fontSize: 14, lineHeight: 22, fontFamily: "Poppins_400Regular" },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
  notFoundText: { fontSize: 14, fontFamily: "Poppins_400Regular" },
});
