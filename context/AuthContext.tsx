import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
  User,
  updateProfile as firebaseUpdateProfile,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { auth, db, FIREBASE_CONFIGURED } from "@/services/firebase";

WebBrowser.maybeCompleteAuthSession();

export interface UserProfile {
  uid: string;
  nickname: string;
  email: string;
  profileImage: string;
  createdAt: unknown;
  totalPhotos: number;
  totalConnections: number;
  onboardingCompleted: boolean;
  useCase?: "friends" | "couple" | "both";
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: (
    nickname: string,
    useCase: "friends" | "couple" | "both"
  ) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "";

async function fetchProfile(uid: string): Promise<UserProfile | null> {
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? (snap.data() as UserProfile) : null;
  } catch {
    return null;
  }
}

async function createProfile(
  uid: string,
  data: Partial<UserProfile>
): Promise<UserProfile> {
  const profile: UserProfile = {
    uid,
    nickname: data.nickname ?? "나",
    email: data.email ?? "",
    profileImage: data.profileImage ?? "",
    createdAt: db ? serverTimestamp() : new Date().toISOString(),
    totalPhotos: 0,
    totalConnections: 0,
    onboardingCompleted: false,
    ...data,
  };
  if (db) {
    await setDoc(doc(db, "users", uid), profile);
  }
  return profile;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!FIREBASE_CONFIGURED || !auth) {
      // Demo mode — not authenticated, show login screen
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const p = await fetchProfile(firebaseUser.uid);
        setProfile(p);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase가 설정되지 않았습니다.");
    const { user: u } = await signInWithEmailAndPassword(auth, email, password);
    const p = await fetchProfile(u.uid);
    setProfile(p);
  }, []);

  const signup = useCallback(
    async (email: string, password: string, name: string) => {
      if (!auth) throw new Error("Firebase가 설정되지 않았습니다.");
      const { user: u } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await firebaseUpdateProfile(u, { displayName: name });
      const p = await createProfile(u.uid, { nickname: name, email });
      setProfile(p);
    },
    []
  );

  const signInWithGoogle = useCallback(async () => {
    if (!auth) throw new Error("Firebase가 설정되지 않았습니다.");
    const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });
    const result = await AuthSession.startAsync({
      authUrl:
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=token` +
        `&scope=${encodeURIComponent("openid profile email")}`,
      returnUrl: redirectUri,
    });

    if (result.type !== "success") return;
    const accessToken = (result as { params?: { access_token?: string } })
      .params?.access_token;
    if (!accessToken) return;

    const credential = GoogleAuthProvider.credential(null, accessToken);
    const { user: u } = await signInWithCredential(auth, credential);

    let p = await fetchProfile(u.uid);
    if (!p) {
      p = await createProfile(u.uid, {
        nickname: u.displayName ?? "사용자",
        email: u.email ?? "",
        profileImage: u.photoURL ?? "",
      });
    }
    setProfile(p);
  }, []);

  const logout = useCallback(async () => {
    if (!auth) return;
    await signOut(auth);
    setProfile(null);
  }, []);

  const completeOnboarding = useCallback(
    async (nickname: string, useCase: "friends" | "couple" | "both") => {
      if (!user || !db) return;
      await updateDoc(doc(db, "users", user.uid), {
        nickname,
        useCase,
        onboardingCompleted: true,
      });
      setProfile((prev) =>
        prev
          ? { ...prev, nickname, useCase, onboardingCompleted: true }
          : prev
      );
    },
    [user]
  );

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const p = await fetchProfile(user.uid);
    setProfile(p);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isConfigured: FIREBASE_CONFIGURED,
        login,
        signup,
        signInWithGoogle,
        logout,
        completeOnboarding,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
