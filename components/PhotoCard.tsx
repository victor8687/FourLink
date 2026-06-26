import { Person, Photo } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface PhotoCardProps {
  photo: Photo;
  people: Person[];
  onPress?: () => void;
  compact?: boolean;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export function PhotoCard({
  photo,
  people,
  onPress,
  compact = false,
}: PhotoCardProps) {
  const colors = useColors();
  const taggedPeople = photo.taggedPeople
    .map((id) => people.find((p) => p.id === id))
    .filter(Boolean) as Person[];

  const maxTags = compact ? 2 : 4;
  const extra = taggedPeople.length - maxTags;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={[
        styles.card,
        compact && styles.compactCard,
        { backgroundColor: colors.card, borderColor: colors.border }
      ]}    >
      <View
        style={[
          styles.filmStrip,
          compact && { height: 130 },
        ]}
      >        <View style={[styles.holes, { backgroundColor: colors.background }]}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={[styles.hole, { backgroundColor: colors.muted }]} />
          ))}
        </View>
        <View style={styles.photoArea}>
          {photo.uri ? (
            <Image source={{ uri: photo.uri }} style={styles.photo} resizeMode="contain" />
          ) : (
            <View style={[styles.noPhoto, { backgroundColor: colors.muted }]}>
              <Feather name="image" size={28} color={colors.mutedForeground} />
            </View>
          )}
        </View>
        <View style={[styles.holes, { backgroundColor: colors.background }]}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={[styles.hole, { backgroundColor: colors.muted }]} />
          ))}
        </View>
      </View>

      <View style={styles.meta}>
        <Text style={[styles.date, { color: colors.mutedForeground }]}>
          {formatDate(photo.date)}
        </Text>
        {taggedPeople.length > 0 && (
          <View style={styles.tags}>
            {taggedPeople.slice(0, maxTags).map((p) => (
              <View key={p.id} style={[styles.tag, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.tagText, { color: colors.primary }]}>{p.name}</Text>
              </View>
            ))}
            {extra > 0 && (
              <Text style={[styles.extra, { color: colors.mutedForeground }]}>+{extra}</Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 14,
  },
  filmStrip: {
    flexDirection: "row",
    height: 140,
  },
  holes: {
    width: 16,
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 14,
  },
  hole: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  photoArea: {
    flex: 1,
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  noPhoto: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  meta: {
    padding: 4,
    gap: 2,
  },
  date: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    alignItems: "center",
  },
  tag: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 11,
    fontFamily: "Poppins_500Medium",
  },
  extra: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
  },
  memo: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: "Poppins_400Regular",
  },
  compactCard: {
    marginBottom: 8,
  },
});
