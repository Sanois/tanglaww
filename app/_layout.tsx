import { AdminProvider } from "@/context/AdminContext";
import {
  clearSession,
  generateSessionToken,
  registerSession,
  validateSession,
} from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { Stack, usePathname, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, AppState, View } from "react-native";
import Toast from "react-native-toast-message";

export let setGateValidating: (v: boolean) => void = () => {};
export let triggerRoleCheck: (userId: string) => void = () => {};

function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [role, setRole] = useState<"student" | "admin" | null>(null);
  const fetchingRole = useRef(false);
  const validatingRef = useRef(false);

  const setValidatingBoth = (v: boolean) => {
    validatingRef.current = v;
    setValidating(v);
  };

  const fetchRole = async (userId: string) => {
    if (fetchingRole.current) {
      return;
    }
    fetchingRole.current = true;
    setLoading(true);

    try {
      const { data: admin } = await supabase
        .from("admin")
        .select("admin_id")
        .eq("admin_id", userId)
        .single();

      if (admin) {
        setRole("admin");
        return;
      }

      const { data: student } = await supabase
        .from("student")
        .select("id")
        .eq("auth_id", userId)
        .single();

      if (student) {
        const { valid, studentId } = await validateSession();

        if (studentId === null) {
          const token = await generateSessionToken();
          await registerSession(student.id, token);
          setRole("student");
          return;
        }

        if (!valid) {
          await supabase.auth.signOut();
          if (studentId) await clearSession(studentId);
          setRole(null);
          Alert.alert(
            "Session Expired",
            "Your account has been logged in from another device. Please sign in again.",
            [{ text: "OK" }],
          );
          return;
        }
        setRole("student");
        return;
      }

      setRole(null);
    } finally {
      fetchingRole.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    setGateValidating = setValidatingBoth;
    triggerRoleCheck = (userId: string) => fetchRole(userId);
    async function loadSession() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          setLoading(false);
          return;
        }
        const session = data.session;
        setSession(session);
        if (session?.user?.id) {
          await fetchRole(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        setLoading(false);
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === "SIGNED_OUT") {
        if (validatingRef.current) {
          validatingRef.current = false;
          setValidating(false);
          fetchingRole.current = false;
          return;
        }
        setSession(null);
        setRole(null);
        setLoading(false);
        fetchingRole.current = false;
      }
      if (_event === "SIGNED_IN" && session) {
        setSession(session);
        if (validatingRef.current) {
          return;
        }
        if (!fetchingRole.current) {
          fetchRole(session.user.id);
        }
        return;
      }
    });

    const appStateSubscription = AppState.addEventListener(
      "change",
      async (nextState) => {
        if (nextState === "active" && role === "student") {
          const { valid, studentId } = await validateSession();
          if (!valid) {
            await supabase.auth.signOut();
            if (studentId) await clearSession(studentId);
            setSession(null);
            setRole(null);
            Alert.alert(
              "Session Expired",
              "Your account has been logged in from another device.",
              [{ text: "OK" }],
            );
          }
        }
      },
    );

    return () => {
      subscription.unsubscribe();
      appStateSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (loading) return;
    if (validating) return;
    if (!session && role !== null) return;
    const inAuthGroup = [
      "/login",
      "/signin",
      "/enroll",
      "/code",
      "/profilesetup",
      "/welcome",
      "/admin/signin",
      "/succes",
      "/resetpass",
      "/forgotpass",
    ].includes(pathname);

    const inAdminGroup =
      pathname.startsWith("/admin") && !pathname.startsWith("/admin/signin");
    const inMaterialsGroup = pathname.startsWith("/materials");

    if (!session) {
      if (
        !inAuthGroup &&
        !inAdminGroup &&
        !inMaterialsGroup &&
        !pathname.startsWith("/registrant")
      )
        router.replace("/login");
    } else if (role === "student") {
      if (inAdminGroup) router.replace("/homepage");
      else if (inAuthGroup && pathname !== "/succes")
        router.push("/homepage" as any);
    } else if (role === "admin") {
      if (!inAdminGroup && !inAuthGroup && !inMaterialsGroup)
        router.replace("/admin/dashboard" as any);
      else if (inAuthGroup) router.replace("/admin/dashboard" as any);
    }
  }, [session, role, loading, pathname, validating]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0D2A94" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AdminProvider>
      <AuthGate>
        <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="welcome" />
          <Stack.Screen name="login" />
          <Stack.Screen name="signin" />
          <Stack.Screen name="enroll" />
          <Stack.Screen name="code" />
          <Stack.Screen name="profilesetup" />
          <Stack.Screen name="succes" />
          <Stack.Screen name="homepage" />
          <Stack.Screen name="admin" />
          <Stack.Screen name="registrant" />
          <Stack.Screen name="materials" />
          <Stack.Screen name="resetpass" />
          <Stack.Screen name="forgotpass" />
        </Stack>
      </AuthGate>
      <Toast />
    </AdminProvider>
  );
}
