import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PhotoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { photos, people, deletePhoto, updatePhoto, addPerson } = useApp();
  const [newPersonName, setNewPersonName] = React.useState("");
  const photo = photos.find((p) => p.id === id);
  const [selectedPeople, setSelectedPeople] = React.useState<string[]>(
    photo?.taggedPeople ?? []
  );
  const [modalVisible, setModalVisible] = React.useState(false);
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

  const handleSave = async () => {
    if (!photo) return;

    await updatePhoto(photo.id, {
      taggedPeople: selectedPeople,
    });

    Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success
    );

    Alert.alert("저장되었습니다.");
  };

  const handleAddPerson = () => {
    const name = newPersonName.trim();

    if (!name) return;

    const person = addPerson(name);

    if (!selectedPeople.includes(person.id)) {
      setSelectedPeople((prev) => [...prev, person.id]);
    }

    setNewPersonName("");

    Haptics.impactAsync(
      Haptics.ImpactFeedbackStyle.Light
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 8 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            사진 정보
          </Text>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
            <Feather name="trash-2" size={18} color={colors.destructive} />
          </TouchableOpacity>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.scroll,
            { flexGrow: 1 },
            Platform.OS === "web" && { paddingBottom: 34 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.filmStrip, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.filmHoles, { backgroundColor: colors.background }]}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
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
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <View key={i} style={[styles.hole, { backgroundColor: colors.muted }]} />
              ))}
            </View>
          </View>

          <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.detailSection}>
              <Text
                style={[
                  styles.detailLabel,
                  { color: colors.mutedForeground },
                ]}
              >
                함께한 사람
              </Text>

              <View style={styles.tags}>
                {selectedPeople.map((id) => {
                  const person = people.find((p) => p.id === id);

                  if (!person) return null;

                  return (
                    <TouchableOpacity
                      key={id}
                      style={[
                        styles.tag,
                        {
                          backgroundColor: colors.secondary,
                        },
                      ]}
                      onPress={() => {
                        Haptics.selectionAsync();

                        setSelectedPeople((prev) =>
                          prev.filter((personId) => personId !== id)
                        );
                      }}
                    >
                      <Text
                        style={[
                          styles.tagText,
                          {
                            color: colors.primary,
                          },
                        ]}
                      >
                        {person.name}
                      </Text>

                      <Feather
                        name="x"
                        size={14}
                        color={colors.primary}
                        style={{ marginLeft: 4 }}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={[
                  styles.selectPeopleBtn,
                  {
                    backgroundColor: colors.secondary,
                  },
                ]}
                onPress={() => setModalVisible(true)}
              >
                <Feather
                  name="users"
                  size={18}
                  color={colors.primary}
                />

                <Text
                  style={{
                    color: colors.primary,
                    fontWeight: "600",
                  }}
                >
                  사람 선택
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[
                styles.saveBtn,
                { backgroundColor: colors.primary },
              ]}
              onPress={handleSave}
            >
              <Feather
                name="save"
                size={18}
                color="white"
              />

              <Text style={styles.saveText}>
                저장하기
              </Text>
            </TouchableOpacity>

            <View style={styles.detailSection}>
              <Text
                style={[
                  styles.detailLabel,
                  { color: colors.mutedForeground },
                ]}
              >
                새로운 사람
              </Text>

              <View style={styles.addPersonRow}>
                <TextInput
                  value={newPersonName}
                  onChangeText={setNewPersonName}
                  placeholder="이름 입력"
                  style={[
                    styles.input,
                    {
                      borderColor: colors.border,
                      color: colors.foreground,
                    },
                  ]}
                />

                <TouchableOpacity
                  style={[
                    styles.addBtn,
                    {
                      backgroundColor: colors.primary,
                    },
                  ]}
                  onPress={handleAddPerson}
                >
                  <Feather
                    name="plus"
                    size={18}
                    color="white"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent
        >
          <View
            style={{
              flex: 1,
              justifyContent: "flex-end",
              backgroundColor: "rgba(0,0,0,0.35)",
            }}
          >

            <View
              style={{
                backgroundColor: colors.card,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                padding: 20,
                maxHeight: "70%",
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  marginBottom: 20,
                  color: colors.foreground,
                }}
              >
                함께한 사람 선택
              </Text>

              <ScrollView>
                {people.map((person) => {
                  const selected = selectedPeople.includes(person.id);

                  return (
                    <TouchableOpacity
                      key={person.id}
                      onPress={() => {
                        if (selected) {
                          setSelectedPeople(prev =>
                            prev.filter(id => id !== person.id)
                          );
                        } else {
                          setSelectedPeople(prev => [...prev, person.id]);
                        }
                      }}
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingVertical: 14,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border,
                      }}
                    >
                      <Text
                        style={{
                          color: colors.foreground,
                          fontSize: 16,
                        }}
                      >
                        {person.name}
                      </Text>

                      {selected && (
                        <Feather
                          name="check"
                          size={20}
                          color={colors.primary}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <TouchableOpacity
                style={{
                  marginTop: 20,
                  backgroundColor: colors.primary,
                  borderRadius: 12,
                  padding: 14,
                  alignItems: "center",
                }}
                onPress={() => setModalVisible(false)}
              >
                <Text
                  style={{
                    color: "white",
                    fontWeight: "600",
                  }}
                >
                  완료
                </Text>
              </TouchableOpacity>

            </View>

          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 15, fontFamily: "Poppins_600SemiBold" },
  deleteBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  scroll: { paddingHorizontal: 20, paddingBottom: 40, gap: 16 },
  filmStrip: {
    flexDirection: "row", borderRadius: 20, borderWidth: 1, overflow: "hidden", height: 450,
  },
  filmHoles: {
    width: 18, justifyContent: "space-around", alignItems: "center", paddingVertical: 14,
  },
  hole: { width: 10, height: 10, borderRadius: 5 },
  imageWrap: { flex: 1 },
  image: { width: "100%", height: "100%" },
  noImage: {
    flex: 1, alignItems: "center", justifyContent: "center",
  },
  detailCard: {
    borderRadius: 20, borderWidth: 1, padding: 16, gap: 14,
  },
  detailSection: { gap: 8 },
  detailLabel: { fontSize: 11, fontFamily: "Poppins_500Medium" },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
  },
  tagText: { fontSize: 13, fontFamily: "Poppins_500Medium" },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
  notFoundText: { fontSize: 14, fontFamily: "Poppins_400Regular" },
  saveBtn: {
    flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, borderRadius: 14, paddingVertical: 14,
  },
  saveText: {
    color: "white", fontSize: 15, fontFamily: "Poppins_600SemiBold",
  },
  selectPeopleBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 14,
  },
  addPersonRow: {
    flexDirection: "row", gap: 8,
  },
  input: {
    flex: 1, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14,
  },
  addBtn: {
    width: 46, borderRadius: 12, justifyContent: "center", alignItems: "center",
  },
});