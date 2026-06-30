import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function UploadScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { people, addPhotos, addPerson } = useApp();

  const [imageUris, setImageUris] =
    useState<string[]>([]); const [date, setDate] = useState(todayStr());
  const [memo, setMemo] = useState("");
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const pickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("권한 필요", "사진 라이브러리 접근 권한이 필요해요.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      allowsMultipleSelection: true,
      selectionLimit: 0,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUris(result.assets.map(asset => asset.uri));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const togglePerson = (id: string) => {
    setSelectedPeople((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    Haptics.selectionAsync();
  };

  const addNewPerson = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const person = addPerson(trimmed);
    if (!selectedPeople.includes(person.id)) {
      setSelectedPeople((prev) => [...prev, person.id]);
    }
    setNewName("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const reset = () => {
    setImageUris([]);
    setDate(todayStr());
    setMemo("");
    setSelectedPeople([]);
    setNewName("");
  };

  const handleSave = async () => {
    if (imageUris.length === 0) {
      Alert.alert("사진을 선택해주세요");
      return;
    }
    setSaving(true);
    try {
      await addPhotos(
        imageUris.map((uri) => ({
          uri,
          date,
          memo: memo.trim() || undefined,
          taggedPeople: selectedPeople,
        }))
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      reset();
      router.push("/(tabs)/timeline" as any);
    } catch (e) {
      Alert.alert("저장 실패", "다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>네컷 추가</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          Platform.OS === "web" && { paddingBottom: 34 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={[
            styles.imagePicker,
            {
              backgroundColor: imageUris.length ? "transparent" : colors.card,
              borderColor: colors.border,
            },
          ]}
          onPress={pickImage}
          activeOpacity={0.85}
        >
          {imageUris.length > 0 ? (
            <>
              <FlatList
                data={imageUris}
                keyExtractor={(item, index) => index.toString()}
                numColumns={3}
                scrollEnabled={false}
                contentContainerStyle={styles.grid}
                renderItem={({ item }) => (
                  <Image
                    source={{ uri: item }}
                    style={styles.gridImage}
                  />
                )}
              />

              <Text style={styles.countText}>
                선택한 사진 {imageUris.length}장
              </Text>

              <TouchableOpacity
                style={[styles.changeBtn, { backgroundColor: colors.primary }]}
                onPress={pickImage}
              >
                <Feather
                  name="refresh-cw"
                  size={14}
                  color="white"
                />
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.emptyPicker}>
              <View style={[styles.plusCircle, { backgroundColor: colors.secondary }]}>
                <Feather name="camera" size={28} color={colors.primary} />
              </View>
              <Text style={[styles.pickerLabel, { color: colors.foreground }]}>
                네컷 사진 선택
              </Text>
              <Text style={[styles.pickerSub, { color: colors.mutedForeground }]}>
                갤러리에서 사진을 골라주세요
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.form}>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: saving ? 0.7 : 1 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Feather name="save" size={18} color="white" />
              <Text style={styles.saveBtnText}>저장하기</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 14 },
  title: { fontSize: 24, fontFamily: "Poppins_700Bold" },
  scroll: { paddingHorizontal: 20, paddingBottom: 110, gap: 18 },
  imagePicker: {
    height: 260,
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: "hidden",
    borderStyle: "dashed",
  },
  preview: { width: "100%", height: "100%" },
  changeBtn: {
    position: "absolute",
    bottom: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyPicker: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  plusCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  pickerLabel: { fontSize: 16, fontFamily: "Poppins_600SemiBold" },
  pickerSub: { fontSize: 12, fontFamily: "Poppins_400Regular" },
  form: { gap: 16 },
  field: { gap: 6 },
  label: { fontSize: 13, fontFamily: "Poppins_600SemiBold" },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
  },
  textarea: { height: 80, paddingTop: 11 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipText: { fontSize: 13, fontFamily: "Poppins_500Medium" },
  addPerson: { flexDirection: "row", gap: 8 },
  nameInput: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
  },
  addBtn: {
    width: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
  },
  saveBtnText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
  grid: {
  padding: 12,
},

gridImage: {
  width: "31%",
  aspectRatio: 1,
  margin: "1%",
  borderRadius: 10,
},

countText: {
  textAlign: "center",
  marginBottom: 12,
  fontSize: 14,
  fontFamily: "Poppins_500Medium",
},
});
