import { BookOpen, Calendar as CalendarIcon, CheckSquare, ClipboardList, FileText, HelpCircle, Info, LayoutDashboard, LogOut, Shield, Users } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const OVERVIEW = [
  { label: "Home", path: "/admin/dashboard", icon: <LayoutDashboard size={18} /> },
  { label: "Approvals", path: "/admin/approvals", icon: <CheckSquare size={18} /> },
  { label: "Calendar", path: "/admin/calendar", icon: <CalendarIcon size={18} /> },
  { label: "Courses", path: "/admin/courses", icon: <BookOpen size={18} /> },
];

const MANAGEMENT = [
  { label: "Profile Audit Queue", path: "/admin/audit-queue", icon: <Shield size={18} />, badge: 3 },
  { label: "Student Registry", path: "/admin/students", icon: <Users size={18} /> },
  { label: "Audit Log", path: "/admin/audit-log", icon: <ClipboardList size={18} /> },
];

const CONFIG = [
  { label: "About Tanglaw & TARC", path: "/admin/about", icon: <Info size={18} /> },
];

const BOTTOM = [
  { label: "Help", path: "/admin/help", icon: <HelpCircle size={18} /> },
  { label: "Policies", path: "/admin/policies", icon: <FileText size={18} /> },
];

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const linkStyle = (path) => ({
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "12px 24px", cursor: "pointer", fontSize: "14px", fontWeight: "500",
    color: location.pathname === path ? "#1a1a6e" : "#555",
    backgroundColor: location.pathname === path ? "#fff8e1" : "transparent",
    borderLeft: location.pathname === path ? "3px solid #f5a623" : "3px solid transparent",
    transition: "all 0.15s",
  });

  return (
    <aside style={{
      width: "240px", backgroundColor: "#fff", borderRight: "1px solid #eee",
      position: "fixed", top: 0, left: 0, height: "100vh",
      display: "flex", flexDirection: "column", zIndex: 100, overflowY: "auto",
    }}>
      {/* Admin Profile Header */}
      <div style={{ backgroundColor: "#f5a623", padding: "24px 20px 20px" }}>
        <div style={{
          width: "56px", height: "56px", borderRadius: "50%",
          backgroundColor: "#fff", display: "flex", alignItems: "center",
          justifyContent: "center", marginBottom: "12px",
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a1a6e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <div style={{ fontSize: "16px", fontWeight: "700", color: "#1a1a6e" }}>Test Admin</div>
        <div style={{ fontSize: "12px", color: "#1a1a6e", opacity: 0.8 }}>Instructor</div>
        <div style={{ fontSize: "11px", color: "#1a1a6e", opacity: 0.7 }}>tanglawtest@gmail.com</div>
      </div>

{/* Overview */}
      <div style={{ padding: "16px 0 0" }}>
        <div style={{ fontSize: "11px", fontWeight: "700", color: "#aaa", padding: "0 24px", marginBottom: "6px", letterSpacing: "0.08em" }}>OVERVIEW</div>
        {OVERVIEW.map((item) => (
          <div key={item.path} style={linkStyle(item.path)} onClick={() => navigate(item.path)}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {item.icon}{item.label}
            </div>
          </div>
        ))}
      </div>

      {/* Management */}
      <div style={{ padding: "16px 0 0" }}>
        <div style={{ fontSize: "11px", fontWeight: "700", color: "#aaa", padding: "0 24px", marginBottom: "6px", letterSpacing: "0.08em" }}>MANAGEMENT</div>
        {MANAGEMENT.map((item) => (
          <div key={item.path} style={linkStyle(item.path)} onClick={() => navigate(item.path)}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {item.icon}{item.label}
            </div>
            {item.badge && (
              <div style={{
                backgroundColor: "#e53935", color: "#fff", borderRadius: "50%",
                width: "20px", height: "20px", fontSize: "11px", fontWeight: "700",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{item.badge}</div>
            )}
          </div>
        ))}
      </div>

      {/* App Configuration */}
      <div style={{ padding: "16px 0 0" }}>
        <div style={{ fontSize: "11px", fontWeight: "700", color: "#aaa", padding: "0 24px", marginBottom: "6px", letterSpacing: "0.08em" }}>APP CONFIGURATION</div>
        {CONFIG.map((item) => (
          <div key={item.path} style={linkStyle(item.path)} onClick={() => navigate(item.path)}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {item.icon}{item.label}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div style={{ marginTop: "auto", borderTop: "1px solid #eee", paddingTop: "12px" }}>
        {BOTTOM.map((item) => (
          <div key={item.path} style={linkStyle(item.path)} onClick={() => navigate(item.path)}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {item.icon}{item.label}
            </div>
          </div>
        ))}
        <div
          onClick={() => navigate("/admin/signin")}
          style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 24px", cursor: "pointer", fontSize: "14px", fontWeight: "500", color: "#e53935" }}
        >
          <LogOut size={18} /> Sign Out
        </div>
      </div>
    </aside>
  );
}