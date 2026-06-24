import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login, signInWithGoogle, isConfigured } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert("입력 오류", "이메일과 비밀번호를 입력해주세요.");
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      Alert.alert(
        "로그인 실패",
        msg.includes("wrong-password") || msg.includes("user-not-found")
          ? "이메일 또는 비밀번호가 올바르지 않습니다."
          : msg.includes("invalid-email")
          ? "올바른 이메일 형식을 입력해주세요."
          : "로그인 중 오류가 발생했습니다. 다시 시도해주세요."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      Alert.alert("Google 로그인 실패", msg);
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoArea}>
          <View style={[styles.logoIcon, { backgroundColor: colors.secondary }]}>
            <Text style={styles.logoEmoji}>📸</Text>
          </View>
          <Text style={[styles.logoText, { color: colors.primary }]}>
            FourLink
          </Text>
          <Text style={[styles.logoSub, { color: colors.mutedForeground }]}>
            소중한 추억을 연결하다
          </Text>
        </View>

        {/* Firebase not configured warning */}
        {!isConfigured && (
          <View style={[styles.warnBox, { backgroundColor: "#FFF3CD", borderColor: "#FFD700" }]}>
            <Feather name="alert-triangle" size={14} color="#B8860B" />
            <Text style={[styles.warnText, { color: "#B8860B" }]}>
              Firebase 설정이 필요합니다. 환경 변수를 확인해주세요.
            </Text>
          </View>
        )}

        {/* Form */}
        <View style={styles.form}>
          {/* Email */}
          <View style={styles.fieldWrap}>
            <Text style={[styles.label, { color: colors.foreground }]}>이메일</Text>
            <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="mail" size={16} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder="이메일 주소"
                placeholderTextColor={colors.mutedForeground}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldWrap}>
            <Text style={[styles.label, { color: colors.foreground }]}>비밀번호</Text>
            <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="lock" size={16} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder="비밀번호"
                placeholderTextColor={colors.mutedForeground}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPw}
                autoComplete="password"
              />
              <TouchableOpacity onPress={() => setShowPw((v) => !v)}>
                <Feather
                  name={showPw ? "eye-off" : "eye"}
                  size={16}
                  color={colors.mutedForeground}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.primaryBtn,
              { backgroundColor: colors.primary },
              loading && styles.btnDisabled,
            ]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.primaryBtnText}>로그인</Text>
            )}
          </TouchableOpacity>

          {/* Sign Up Link */}
          <TouchableOpacity
            style={[styles.outlineBtn, { borderColor: colors.primary }]}
            onPress={() => router.push("/(auth)/signup" as never)}
            activeOpacity={0.8}
          >
            <Text style={[styles.outlineBtnText, { color: colors.primary }]}>
              회원가입
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.mutedForeground }]}>
              또는
            </Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          {/* Google Button */}
          <TouchableOpacity
            style={[styles.socialBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handleGoogle}
            disabled={googleLoading}
            activeOpacity={0.85}
          >
            {googleLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <Text style={styles.googleG}>G</Text>
                <Text style={[styles.socialBtnText, { color: colors.foreground }]}>
                  Google로 계속하기
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Apple Button */}
          <TouchableOpacity
            style={[styles.socialBtn, { backgroundColor: "#000", borderColor: "#000" }]}
            activeOpacity={0.85}
            onPress={() =>
              Alert.alert("Apple 로그인", "곧 지원 예정입니다.")
            }
          >
            <Feather name="smartphone" size={18} color="white" />
            <Text style={[styles.socialBtnText, { color: "white" }]}>
              Apple로 계속하기
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 28, gap: 0 },
  logoArea: { alignItems: "center", marginBottom: 40, gap: 8 },
  logoIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  logoEmoji: { fontSize: 34 },
  logoText: {
    fontSize: 32,
    fontFamily: "Poppins_700Bold",
    letterSpacing: -1,
  },
  logoSub: { fontSize: 14, fontFamily: "Poppins_400Regular" },
  warnBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  warnText: { flex: 1, fontSize: 12, fontFamily: "Poppins_400Regular" },
  form: { gap: 12 },
  fieldWrap: { gap: 6 },
  label: { fontSize: 13, fontFamily: "Poppins_500Medium" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    padding: 0,
  },
  primaryBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 4,
  },
  primaryBtnText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
  btnDisabled: { opacity: 0.7 },
  outlineBtn: {
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1.5,
  },
  outlineBtnText: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 4,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 13, fontFamily: "Poppins_400Regular" },
  socialBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  googleG: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    color: "#4285F4",
  },
  socialBtnText: {
    fontSize: 15,
    fontFamily: "Poppins_500Medium",
  },
});
