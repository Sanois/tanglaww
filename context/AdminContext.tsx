import { Session } from "@supabase/supabase-js";
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { adminService } from "../services/adminService";

interface AdminContextType {
  session: Session | null;
  isAdmin: boolean;
  isStudent: boolean;
  authLoading: boolean;
  currentAdminId: string | null;
  currentStudentId: number | null;

  auditRequests: any[];
  students: any[];
  refreshData: () => Promise<void>;
  pendingCount: number;
  loading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStudent, setIsStudent] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null);
  const [currentStudentId, setCurrentStudentId] = useState<number | null>(null);
  const [auditRequests, setAuditRequests] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const resolveRole = async (userId: string | null) => {
    if (!userId) {
      setIsAdmin(false);
      setIsStudent(false);
      setCurrentAdminId(null);
      setCurrentStudentId(null);
      setAuthLoading(false);
      return;
    }

    const { data: adminRow } = await supabase
      .from("admin")
      .select("admin_id")
      .eq("admin_id", userId)
      .single();

    if (adminRow) {
      setIsAdmin(true);
      setIsStudent(false);
      setCurrentAdminId(userId);
      setCurrentStudentId(null);
      setAuthLoading(false);
      return;
    }

    const { data: studentRow } = await supabase
      .from("student")
      .select("id")
      .eq("auth_id", userId)
      .single();

    if (studentRow) {
      setIsAdmin(false);
      setIsStudent(true);
      setCurrentAdminId(null);
      setCurrentStudentId(studentRow.id);
      setAuthLoading(false);
      return;
    }

    setIsAdmin(false);
    setIsStudent(false);
    setCurrentAdminId(null);
    setCurrentStudentId(null);
    setAuthLoading(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      resolveRole(session?.user?.id ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        resolveRole(session?.user?.id ?? null);
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const refreshData = async () => {
    try {
      setLoading(true);
      const [auditData, studentData] = await Promise.all([
        adminService.getAuditRequests(),
        adminService.getStudentRegistry(),
      ]);
      setAuditRequests(auditData);
      setStudents(studentData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) refreshData();
    else setLoading(false);
  }, [isAdmin]);

  return (
    <AdminContext.Provider
      value={{
        session,
        isAdmin,
        isStudent,
        authLoading,
        currentAdminId,
        currentStudentId,
        auditRequests,
        students,
        refreshData,
        pendingCount: auditRequests.length,
        loading,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within AdminProvider");
  }
  return context;
};
