import { Person, useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default function PeopleScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { people, photos, isLoaded, addPerson } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState("");

  const sorted = useMemo(() => {
    return [...people].sort((a, b) => {
      const aCount = photos.filter(photo =>
        photo.taggedPeople.includes(a.id)
      ).length;

      const bCount = photos.filter(photo =>
        photo.taggedPeople.includes(b.id)
      ).length;

      return bCount - aCount;
    });
  }, [people, photos]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (!isLoaded) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const handleAddPerson = () => {
    const name = newName.trim();
    if (!name) return;
    addPerson(name);
    setNewName("");
    setModalVisible(false);
  };

  const renderItem = ({ item, index }: { item: Person; index: number }) => {

    const photoCount = photos.filter(photo =>
      photo.taggedPeople.includes(item.id)
    ).length;

    const lastPhoto = photos
      .filter(photo => photo.taggedPeople.includes(item.id))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )[0];

    return (<TouchableOpacity
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
          {photoCount}장의 네컷
          {lastPhoto ? ` · 최근 ${formatDate(lastPhoto.createdAt)}` : ""}
        </Text>
      </View>
      <View style={styles.right}>
        {index === 0 && photoCount > 0 && (
          <View style={[styles.topBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.topBadgeText}>1위</Text>
          </View>
        )}
        <Feather name="chevron-right" size={16} color={colors.border} />
      </View>
    </TouchableOpacity>
    );
  };

    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 8 }]}>
          <Text
            style={[
              styles.title,
              { color: colors.foreground },
            ]}
          >
            인연
          </Text>

          <View style={styles.headerRight}>

            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={[
                styles.addButton,
                {
                  backgroundColor: colors.primary,
                },
              ]}
            >
              <Feather
                name="plus"
                size={18}
                color="white"
              />
            </TouchableOpacity>

            <Text
              style={[
                styles.subtitle,
                { color: colors.mutedForeground },
              ]}
            >
              {people.length}명
            </Text>

          </View>
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
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
        >
          <View
            style={styles.modalBackground}
          >
            <View
              style={[
                styles.modal,
                {
                  backgroundColor: colors.card,
                },
              ]}
            >
              <Text
                style={[
                  styles.modalTitle,
                  {
                    color: colors.foreground,
                  },
                ]}
              >
                새로운 인연
              </Text>

              <TextInput
                value={newName}
                onChangeText={setNewName}
                placeholder="이름 입력"
                style={[
                  styles.input,
                  {
                    borderColor: colors.border,
                    color: colors.foreground,
                  },
                ]}
              />

              <View style={styles.modalButtons}>

                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                >
                  <Text>취소</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleAddPerson}
                >
                  <Text
                    style={{
                      color: colors.primary,
                    }}
                  >
                    추가
                  </Text>
                </TouchableOpacity>

              </View>

            </View>
          </View>
        </Modal>
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
    headerRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },

    addButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      justifyContent: "center",
      alignItems: "center",
    },

    modalBackground: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.35)",
    },

    modal: {
      width: "82%",
      borderRadius: 18,
      padding: 20,
    },

    modalTitle: {
      fontSize: 18,
      fontFamily: "Poppins_600SemiBold",
      marginBottom: 16,
    },

    input: {
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },

    modalButtons: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 20,
      marginTop: 18,
    },
  });
