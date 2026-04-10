import { AdminProvider } from "@/context/AdminContext";
import { supabase } from "@/lib/supabase";
import { Stack, usePathname, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<"student" | "admin" | null>(null);

  const fetchRole = async (userId: string) => {
    setLoading(true);

    const { data: admin } = await supabase
      .from("admin")
      .select("admin_id")
      .eq("admin_id", userId)
      .single();

    if (admin) {
      setRole("admin");
      setLoading(false);
      return;
    }

    const { data: student } = await supabase
      .from("student")
      .select("id")
      .eq("auth_id", userId)
      .single();

    if (student) {
      setRole("student");
      setLoading(false);
      return;
    }

    setRole(null);
    setLoading(false);
  };

  useEffect(() => {
    async function loadSession() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting session:", error);
          setLoading(false);
          return;
        }
        const session = data.session;
        setSession(session);
        if (session?.user?.id) {
          fetchRole(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setLoading(false);
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.id) fetchRole(session.user.id);
      else {
        setRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = [
      "/login",
      "/signin",
      "/enroll",
      "/code",
      "/profilesetup",
      "/welcome",
      "/admin/signin",
      "/succes",
    ].includes(pathname);

    const inAdminGroup = pathname.startsWith("/admin");
    const inMaterialsGroup = pathname.startsWith("/materials");

    if (!session) {
      if (!inAuthGroup && !inAdminGroup && !pathname.startsWith("/registrant"))
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
  }, [session, role, loading, pathname]);

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
        </Stack>
      </AuthGate>
    </AdminProvider>
  );
}
