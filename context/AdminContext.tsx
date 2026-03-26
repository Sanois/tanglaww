import React, { createContext, useContext, useEffect, useState } from 'react';
import { adminService } from '../services/adminService';

interface AdminContextType {
    auditRequests: any[];
    students: any[];
    refreshData: () => Promise<void>;
    pendingCount: number;
    loading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
    const [auditRequests, setAuditRequests] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshData = async () => {
        try {
            setLoading(true);
            const [auditData, studentData] = await Promise.all([
                adminService.getAuditRequests(),
                adminService.getStudentRegistry()
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
        refreshData();
    }, []);

    return (
        <AdminContext.Provider value={{ 
            auditRequests, 
            students, 
            refreshData, 
            pendingCount: auditRequests.length,
            loading
        }}>
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