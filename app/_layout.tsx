import { Stack } from "expo-router";
import { AdminProvider } from "../context/AdminContext";

export default function RootLayout() {
    return (
        <AdminProvider>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="admin/audit" />
                <Stack.Screen name="admin/registry" />
            </Stack>
        </AdminProvider>
    );
}