import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

type UseCase = "friends" | "couple" | "both";

const USE_CASES: { key: UseCase; label: string; emoji: string; desc: string }[] = [
  { key: "friends", label: "친구들과", emoji: "👥", desc: "친구들과 함께한 네컷 사진 기록" },
  { key: "couple", label: "연인과", emoji: "💑", desc: "소중한 연인과의 추억을 기록" },
  { key: "both", label: "모두", emoji: "🌟", desc: "친구, 연인 모두의 추억을 기록" },
];

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, profile, completeOnboarding } = useAuth();

  const [step, setStep] = useState(0);
  const [nickname, setNickname] = useState(
    profile?.nickname ?? user?.displayName ?? ""
  );
  const [useCase, setUseCase] = useState<UseCase | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleFinish() {
    if (!nickname.trim()) {
      Alert.alert("입력 오류", "닉네임을 입력해주세요.");
      return;
    }
    if (!useCase) {
      Alert.alert("선택 오류", "사용 목적을 선택해주세요.");
      return;
    }
    setLoading(true);
    try {
      await completeOnboarding(nickname.trim(), useCase);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      Alert.alert("오류", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View
        style={[
          styles.container,
          { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 32 },
        ]}
      >
        {/* Progress dots */}
        <View style={styles.progress}>
          {[0, 1].map((i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i <= step ? colors.primary : colors.border,
                  width: i === step ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        {step === 0 ? (
          /* Step 1: Nickname */
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepEmoji}>👋</Text>
              <Text style={[styles.stepTitle, { color: colors.foreground }]}>
                어떻게 불러드릴까요?
              </Text>
              <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>
                FourLink에서 사용할 닉네임을 알려주세요
              </Text>
            </View>

            <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="smile" size={18} color={colors.primary} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder="닉네임"
                placeholderTextColor={colors.mutedForeground}
                value={nickname}
                onChangeText={setNickname}
                maxLength={20}
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={[styles.nextBtn, { backgroundColor: colors.primary }]}
              onPress={() => {
                if (!nickname.trim()) {
                  Alert.alert("입력 오류", "닉네임을 입력해주세요.");
                  return;
                }
                setStep(1);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.nextBtnText}>다음</Text>
              <Feather name="arrow-right" size={18} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          /* Step 2: Use Case */
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepEmoji}>📸</Text>
              <Text style={[styles.stepTitle, { color: colors.foreground }]}>
                주로 누구와 함께 사용하시나요?
              </Text>
              <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>
                맞춤형 경험을 제공해 드릴게요
              </Text>
            </View>

            <View style={styles.useCaseList}>
              {USE_CASES.map((item) => {
                const selected = useCase === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.useCaseCard,
                      {
                        backgroundColor: selected ? colors.secondary : colors.card,
                        borderColor: selected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setUseCase(item.key)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.useCaseEmoji}>{item.emoji}</Text>
                    <View style={styles.useCaseInfo}>
                      <Text style={[styles.useCaseLabel, { color: colors.foreground }]}>
                        {item.label}
                      </Text>
                      <Text style={[styles.useCaseDesc, { color: colors.mutedForeground }]}>
                        {item.desc}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.radio,
                        {
                          borderColor: selected ? colors.primary : colors.border,
                          backgroundColor: selected ? colors.primary : "transparent",
                        },
                      ]}
                    >
                      {selected && <Feather name="check" size={10} color="white" />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.btnRow}>
              <TouchableOpacity
                style={[styles.backBtn, { borderColor: colors.border }]}
                onPress={() => setStep(0)}
              >
                <Feather name="arrow-left" size={18} color={colors.foreground} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.finishBtn,
                  { backgroundColor: colors.primary },
                  (!useCase || loading) && styles.btnDisabled,
                ]}
                onPress={handleFinish}
                disabled={!useCase || loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.finishBtnText}>시작하기 🎉</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 28,
  },
  progress: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 48,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  stepContent: { flex: 1, gap: 24 },
  stepHeader: { gap: 8 },
  stepEmoji: { fontSize: 40, marginBottom: 4 },
  stepTitle: {
    fontSize: 24,
    fontFamily: "Poppins_700Bold",
    lineHeight: 32,
  },
  stepSub: { fontSize: 14, fontFamily: "Poppins_400Regular", lineHeight: 20 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
    padding: 0,
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  nextBtnText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
  useCaseList: { gap: 10 },
  useCaseCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 14,
  },
  useCaseEmoji: { fontSize: 28 },
  useCaseInfo: { flex: 1, gap: 2 },
  useCaseLabel: { fontSize: 15, fontFamily: "Poppins_600SemiBold" },
  useCaseDesc: { fontSize: 12, fontFamily: "Poppins_400Regular" },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  btnRow: { flexDirection: "row", gap: 12, marginTop: "auto" },
  backBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  finishBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  finishBtnText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
  btnDisabled: { opacity: 0.5 },
});
