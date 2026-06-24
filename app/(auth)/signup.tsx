import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SignUpScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signup } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [profileUri, setProfileUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("권한 필요", "사진 접근 권한이 필요합니다.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setProfileUri(result.assets[0].uri);
    }
  }

  async function handleSignUp() {
    if (!name.trim()) {
      Alert.alert("입력 오류", "이름을 입력해주세요.");
      return;
    }
    if (!email.trim()) {
      Alert.alert("입력 오류", "이메일을 입력해주세요.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("입력 오류", "비밀번호는 6자 이상이어야 합니다.");
      return;
    }
    if (password !== confirmPw) {
      Alert.alert("입력 오류", "비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoading(true);
    try {
      await signup(email.trim(), password, name.trim());
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      Alert.alert(
        "회원가입 실패",
        msg.includes("email-already-in-use")
          ? "이미 사용 중인 이메일입니다."
          : msg.includes("invalid-email")
          ? "올바른 이메일 형식을 입력해주세요."
          : msg.includes("weak-password")
          ? "비밀번호가 너무 짧습니다."
          : "회원가입 중 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
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
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            회원가입
          </Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Profile Image */}
        <View style={styles.avatarArea}>
          <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
            <View
              style={[
                styles.avatarRing,
                { borderColor: colors.primary, backgroundColor: colors.secondary },
              ]}
            >
              {profileUri ? (
                <Image
                  source={{ uri: profileUri }}
                  style={styles.avatarImg}
                />
              ) : (
                <Feather name="user" size={38} color={colors.primary} />
              )}
            </View>
            <View
              style={[styles.avatarEditBadge, { backgroundColor: colors.primary }]}
            >
              <Feather name="camera" size={12} color="white" />
            </View>
          </TouchableOpacity>
          <Text style={[styles.avatarHint, { color: colors.mutedForeground }]}>
            프로필 사진 선택 (선택사항)
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <InputField
            label="이름"
            icon="user"
            placeholder="이름 또는 닉네임"
            value={name}
            onChangeText={setName}
            colors={colors}
          />
          <InputField
            label="이메일"
            icon="mail"
            placeholder="이메일 주소"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            colors={colors}
          />
          <InputField
            label="비밀번호"
            icon="lock"
            placeholder="6자 이상"
            value={password}
            onChangeText={setPassword}
            secure
            showSecure={showPw}
            onToggleSecure={() => setShowPw((v) => !v)}
            colors={colors}
          />
          <InputField
            label="비밀번호 확인"
            icon="lock"
            placeholder="비밀번호 재입력"
            value={confirmPw}
            onChangeText={setConfirmPw}
            secure
            showSecure={showConfirmPw}
            onToggleSecure={() => setShowConfirmPw((v) => !v)}
            colors={colors}
          />

          <TouchableOpacity
            style={[
              styles.primaryBtn,
              { backgroundColor: colors.primary },
              loading && styles.btnDisabled,
            ]}
            onPress={handleSignUp}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.primaryBtnText}>계정 만들기</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => router.back()}
          >
            <Text style={[styles.loginLinkText, { color: colors.mutedForeground }]}>
              이미 계정이 있으신가요?{" "}
              <Text style={{ color: colors.primary, fontFamily: "Poppins_600SemiBold" }}>
                로그인
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

interface InputFieldProps {
  label: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  secure?: boolean;
  showSecure?: boolean;
  onToggleSecure?: () => void;
  keyboardType?: React.ComponentProps<typeof TextInput>["keyboardType"];
  autoCapitalize?: React.ComponentProps<typeof TextInput>["autoCapitalize"];
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
}

function InputField({
  label, icon, placeholder, value, onChangeText,
  secure, showSecure, onToggleSecure, keyboardType, autoCapitalize, colors,
}: InputFieldProps) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
      <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name={icon} size={16} color={colors.mutedForeground} />
        <TextInput
          style={[styles.input, { color: colors.foreground }]}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure && !showSecure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize ?? "words"}
        />
        {secure && (
          <TouchableOpacity onPress={onToggleSecure}>
            <Feather
              name={showSecure ? "eye-off" : "eye"}
              size={16}
              color={colors.mutedForeground}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 24, gap: 0 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: "Poppins_600SemiBold" },
  avatarArea: { alignItems: "center", marginBottom: 28, gap: 8 },
  avatarRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2.5,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImg: { width: 90, height: 90 },
  avatarEditBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  avatarHint: { fontSize: 12, fontFamily: "Poppins_400Regular" },
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
    marginTop: 8,
  },
  primaryBtnText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
  btnDisabled: { opacity: 0.7 },
  loginLink: { alignItems: "center", paddingVertical: 8 },
  loginLinkText: { fontSize: 14, fontFamily: "Poppins_400Regular" },
});
