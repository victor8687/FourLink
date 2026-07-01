import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert, Modal,
  Platform,
  ScrollView,
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

function getDayCount(startDate?: string) {
  if (!startDate) return 0;
  const diff = Date.now() - new Date(startDate).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

function getCoupleMillestones(startDate?: string) {
  if (!startDate) return [];
  const start = new Date(startDate);
  const milestones = [100, 200, 365, 500, 700, 1000];
  return milestones.map((days) => {
    const ms = new Date(start.getTime() + (days - 1) * 86400000);
    const isPast = ms < new Date();
    return { days, date: formatDate(ms.toISOString()), isPast };
  });
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, people, photos, updateUser, setCouple, unsetCouple } = useApp();

  const [editName, setEditName] = useState(false);
  const [nameInput, setNameInput] = useState(user.nickname);
  const [coupleModal, setCoupleModal] = useState(false);
  const [coupleDate, setCoupleDate] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const couple = people.find((p) => p.isCouple);
  const totalPhotos = photos.length;
  const totalPeople = people.length;
  const topPerson = [...people].sort((a, b) => b.photoCount - a.photoCount)[0];

  const monthlyStats = (() => {
    const map = new Map<string, number>();
    for (const p of photos) {
      const d = new Date(p.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 4);
  })();

  const saveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    await updateUser({ nickname: trimmed });
    setEditName(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleSetCouple = async (personId: string) => {
    const trimmed = coupleDate.trim() || new Date().toISOString().split("T")[0];
    await setCouple(personId, trimmed);
    setCoupleModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleUnsetCouple = () => {
    Alert.alert("커플 모드 해제", "커플 모드를 해제할까요?", [
      { text: "취소", style: "cancel" },
      {
        text: "해제",
        style: "destructive",
        onPress: async () => {
          await unsetCouple();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        },
      },
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>프로필</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          Platform.OS === "web" && { paddingBottom: 34 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {user.nickname.charAt(0)}
            </Text>
          </View>
          {editName ? (
            <View style={styles.nameEdit}>
              <TextInput
                style={[styles.nameInput, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.background }]}
                value={nameInput}
                onChangeText={setNameInput}
                autoFocus
                onSubmitEditing={saveName}
                returnKeyType="done"
              />
              <TouchableOpacity onPress={saveName} style={[styles.saveNameBtn, { backgroundColor: colors.primary }]}>
                <Feather name="check" size={16} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.nameRow} onPress={() => { setEditName(true); setNameInput(user.nickname); }}>
              <Text style={[styles.nickname, { color: colors.foreground }]}>{user.nickname}</Text>
              <Feather name="edit-2" size={14} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
          <Text style={[styles.joinDate, { color: colors.mutedForeground }]}>
            {formatDate(user.joinedAt)} 가입
          </Text>
        </View>

        <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>통계</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statItem, { borderColor: colors.border }]}>
              <Text style={[styles.statNum, { color: colors.primary }]}>{totalPhotos}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>총 네컷</Text>
            </View>
            <View style={[styles.statItem, { borderColor: colors.border }]}>
              <Text style={[styles.statNum, { color: colors.primary }]}>{totalPeople}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>함께한 사람</Text>
            </View>
          </View>
          {topPerson && topPerson.photoCount > 0 && (
            <View style={[styles.topPersonRow, { backgroundColor: colors.secondary }]}>
              <Feather name="star" size={14} color={colors.primary} />
              <Text style={[styles.topPersonText, { color: colors.foreground }]}>
                가장 많이 찍은 사람
              </Text>
              <Text style={[styles.topPersonName, { color: colors.primary }]}>
                {topPerson.name} ({topPerson.photoCount}장)
              </Text>
            </View>
          )}
          {monthlyStats.length > 0 && (
            <View style={styles.monthlySection}>
              <Text style={[styles.monthlyTitle, { color: colors.mutedForeground }]}>
                월별 기록
              </Text>
              {monthlyStats.map(([key, count]) => (
                <View key={key} style={styles.monthlyRow}>
                  <Text style={[styles.monthKey, { color: colors.foreground }]}>{key}</Text>
                  <Text style={[styles.monthCount, { color: colors.primary }]}>{count}장</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={[styles.coupleCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Feather name="heart" size={16} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>커플 모드</Text>
          </View>
          {couple ? (
            <>
              <View style={[styles.coupleInfo, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.coupleName, { color: colors.primary }]}>
                  {couple.name}
                </Text>
                <Text style={[styles.coupleDay, { color: colors.foreground }]}>
                  D+{getDayCount(couple.coupleStartDate)}
                </Text>
                <Text style={[styles.coupleDate, { color: colors.mutedForeground }]}>
                  {formatDate(couple.coupleStartDate)} 시작
                </Text>
              </View>
              <View style={styles.milestones}>
                {getCoupleMillestones(couple.coupleStartDate).map((m) => (
                  <View
                    key={m.days}
                    style={[
                      styles.milestone,
                      {
                        backgroundColor: m.isPast ? colors.primary : colors.muted,
                        opacity: m.isPast ? 1 : 0.6,
                      },
                    ]}
                  >
                    <Text style={[styles.milestoneDay, { color: m.isPast ? "white" : colors.mutedForeground }]}>
                      {m.days}일
                    </Text>
                    <Text style={[styles.milestoneDate, { color: m.isPast ? "rgba(255,255,255,0.8)" : colors.mutedForeground }]}>
                      {m.date}
                    </Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                style={[styles.outlineBtn, { borderColor: colors.border }]}
                onPress={handleUnsetCouple}
              >
                <Text style={[styles.outlineBtnText, { color: colors.mutedForeground }]}>
                  커플 모드 해제
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.noCouple}>
              <Text style={[styles.noCoupleText, { color: colors.mutedForeground }]}>
                커플로 지정할 사람을 선택하면{"\n"}기념일과 함께 특별 관리가 돼요
              </Text>
              <TouchableOpacity
                style={[styles.setPeopleBtn, { backgroundColor: colors.primary }]}
                onPress={() => setCoupleModal(true)}
                disabled={people.length === 0}
              >
                <Feather name="heart" size={16} color="white" />
                <Text style={styles.setPeopleBtnText}>커플 지정하기</Text>
              </TouchableOpacity>
              {people.length === 0 && (
                <Text style={[styles.noCoupleHint, { color: colors.mutedForeground }]}>
                  먼저 인연을 추가해주세요
                </Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <Modal visible={coupleModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              커플 지정
            </Text>
            <Text style={[styles.modalSub, { color: colors.mutedForeground }]}>
              함께 시작한 날짜
            </Text>
            <TextInput
              style={[styles.modalInput, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
              value={coupleDate}
              onChangeText={setCoupleDate}
              placeholder={`예: ${new Date().toISOString().split("T")[0]}`}
              placeholderTextColor={colors.mutedForeground}
            />
            <Text style={[styles.modalSub, { color: colors.mutedForeground }]}>
              누구를 커플로 지정할까요?
            </Text>
            {people.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[styles.personOption, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => handleSetCouple(p.id)}
              >
                <Text style={[styles.personOptionText, { color: colors.foreground }]}>{p.name}</Text>
                <Feather name="heart" size={14} color={colors.primary} />
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.outlineBtn, { borderColor: colors.border, marginTop: 8 }]}
              onPress={() => setCoupleModal(false)}
            >
              <Text style={[styles.outlineBtnText, { color: colors.mutedForeground }]}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 14 },
  title: { fontSize: 24, fontFamily: "Poppins_700Bold" },
  scroll: { paddingHorizontal: 20, paddingBottom: 110, gap: 14 },
  profileCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  avatarText: { fontSize: 32, fontFamily: "Poppins_700Bold" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  nickname: { fontSize: 20, fontFamily: "Poppins_700Bold" },
  nameEdit: { flexDirection: "row", gap: 8, alignItems: "center" },
  nameInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    minWidth: 140,
  },
  saveNameBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  joinDate: { fontSize: 12, fontFamily: "Poppins_400Regular" },
  statsCard: { borderRadius: 20, borderWidth: 1, padding: 16, gap: 12 },
  cardTitle: { fontSize: 15, fontFamily: "Poppins_600SemiBold" },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  statsGrid: { flexDirection: "row", gap: 10 },
  statItem: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 3,
  },
  statNum: { fontSize: 24, fontFamily: "Poppins_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Poppins_400Regular" },
  topPersonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 10,
    borderRadius: 12,
    flexWrap: "wrap",
  },
  topPersonText: { fontSize: 12, fontFamily: "Poppins_400Regular", flex: 1 },
  topPersonName: { fontSize: 12, fontFamily: "Poppins_600SemiBold" },
  monthlySection: { gap: 6 },
  monthlyTitle: { fontSize: 11, fontFamily: "Poppins_500Medium" },
  monthlyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  monthKey: { fontSize: 13, fontFamily: "Poppins_400Regular" },
  monthCount: { fontSize: 13, fontFamily: "Poppins_600SemiBold" },
  coupleCard: { borderRadius: 20, borderWidth: 1, padding: 16, gap: 12 },
  coupleInfo: {
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 4,
  },
  coupleName: { fontSize: 18, fontFamily: "Poppins_700Bold" },
  coupleDay: { fontSize: 28, fontFamily: "Poppins_700Bold" },
  coupleDate: { fontSize: 12, fontFamily: "Poppins_400Regular" },
  milestones: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  milestone: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: "center",
    minWidth: 70,
  },
  milestoneDay: { fontSize: 12, fontFamily: "Poppins_700Bold" },
  milestoneDate: { fontSize: 9, fontFamily: "Poppins_400Regular" },
  noCouple: { alignItems: "center", gap: 12 },
  noCoupleText: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  setPeopleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  setPeopleBtnText: { color: "white", fontSize: 14, fontFamily: "Poppins_600SemiBold" },
  noCoupleHint: { fontSize: 11, fontFamily: "Poppins_400Regular" },
  outlineBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  outlineBtnText: { fontSize: 13, fontFamily: "Poppins_500Medium" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 10,
  },
  modalTitle: { fontSize: 18, fontFamily: "Poppins_700Bold", marginBottom: 4 },
  modalSub: { fontSize: 12, fontFamily: "Poppins_400Regular", marginTop: 4 },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
  },
  personOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  personOptionText: { fontSize: 15, fontFamily: "Poppins_500Medium" },
});
