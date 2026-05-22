import { Inbox, RefreshCw, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import { supabase } from "../../lib/supabase";

const ACTION_LABELS = {
  admin_approved_enrollment: "Approved Enrollment",
  admin_rejected_enrollment: "Rejected Enrollment",
  admin_generated_code: "Generated Activation Code",
  admin_unlocked_course_single: "Unlocked Course (Single Student)",
  admin_unlocked_course_all: "Unlocked Course (All Students)",
  admin_locked_course_single: "Locked Course (Single Student)",
  admin_locked_course_all: "Locked Course (All Students)",
  admin_uploaded_material: "Uploaded Material",
  admin_deleted_material: "Deleted Material",
  admin_added_session: "Added Recorded Session",
  admin_deleted_session: "Deleted Recorded Session",
  student_login: "Logged In",
  student_logout: "Logged Out",
  student_viewed_material: "Viewed Material",
  student_downloaded_material: "Downloaded Material",
  student_viewed_session: "Viewed Recorded Session",
  student_attempted_assessment: "Attempted Assessment",
  student_passed_assessment: "Passed Assessment",
  student_failed_assessment: "Failed Assessment",
};

const getActionColor = (action) => {
  if (action?.includes("approved") || action?.includes("unlocked") || action?.includes("passed")) return "#4caf50";
  if (action?.includes("rejected") || action?.includes("locked") || action?.includes("failed")) return "#e53935";
  if (action?.includes("deleted")) return "#f5a623";
  if (action?.includes("admin_")) return "#1a1a6e";
  return "#888";
};

const formatDate = (str) => {
  if (!str) return "—";
  const d = new Date(str);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + " " +
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
};

export default function AdminAuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) console.error(error.message);
    setLogs(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const filtered = logs.filter((log) => {
    const matchesFilter =
      filter === "All" ||
      (filter === "Admin" && log.userType === "admin") ||
      (filter === "Student" && log.userType === "student");

    const q = query.toLowerCase();
    const matchesQuery =
      !q ||
      log.userName?.toLowerCase().includes(q) ||
      log.action?.toLowerCase().includes(q) ||
      log.targetName?.toLowerCase().includes(q) ||
      ACTION_LABELS[log.action]?.toLowerCase().includes(q);

    return matchesFilter && matchesQuery;
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Poppins, sans-serif", backgroundColor: "#f5f6fa" }}>
      <AdminSidebar />
      <div style={{ marginLeft: "240px", flex: 1 }}>
        <AdminTopbar title="Audit Log" />
        <div style={{ padding: "32px 40px" }}>

          {/* Header row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#1a1a2e", margin: 0 }}>Audit Log</h2>
              <p style={{ fontSize: "13px", color: "#888", margin: "4px 0 0" }}>{filtered.length} event{filtered.length !== 1 ? "s" : ""}</p>
            </div>
            <button
              onClick={fetchLogs}
              style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#f0f3ff", color: "#1a1a6e", border: "none", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "Poppins, sans-serif" }}
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          {/* Search */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#fff", borderRadius: "10px", padding: "10px 16px", border: "1px solid #eee", marginBottom: "16px" }}>
            <Search size={16} color="#aaa" />
            <input
              placeholder="Search by name, action, or target..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ border: "none", outline: "none", fontSize: "14px", fontFamily: "Poppins, sans-serif", flex: 1, color: "#333", backgroundColor: "transparent" }}
            />
          </div>

          {/* Filter pills */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
            {["All", "Admin", "Student"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "6px 20px", borderRadius: "20px", border: "none",
                  backgroundColor: filter === f ? "#1a1a6e" : "#fff",
                  color: filter === f ? "#fff" : "#555",
                  fontSize: "13px", fontWeight: "600", cursor: "pointer",
                  fontFamily: "Poppins, sans-serif",
                  boxShadow: filter === f ? "none" : "0 1px 4px rgba(0,0,0,0.08)",
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Logs */}
          {loading ? (
            <p style={{ color: "#aaa" }}>Loading...</p>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <Inbox size={48} color="#ddd" style={{ marginBottom: "16px" }} />
              <p style={{ fontSize: "14px", color: "#aaa" }}>No logs found</p>
            </div>
          ) : (
            <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #eee", overflow: "hidden" }}>
              {filtered.map((log, i) => (
                <div
                  key={log.id ?? i}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: "16px",
                    padding: "16px 20px",
                    borderBottom: i < filtered.length - 1 ? "1px solid #f5f5f5" : "none",
                  }}
                >
                  {/* Actor type badge */}
                  <div style={{
                    flexShrink: 0, marginTop: "2px",
                    backgroundColor: log.userType === "admin" ? "#fff8e1" : "#f0f3ff",
                    color: log.userType === "admin" ? "#f5a623" : "#1a1a6e",
                    borderRadius: "6px", padding: "3px 10px",
                    fontSize: "11px", fontWeight: "700", textTransform: "uppercase",
                  }}>
                    {log.userType ?? "—"}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "14px", fontWeight: "700", color: "#1a1a2e" }}>
                        {log.userName ?? "Unknown"}
                      </span>
                      <span style={{
                        fontSize: "12px", fontWeight: "600",
                        color: getActionColor(log.action),
                        backgroundColor: getActionColor(log.action) + "18",
                        borderRadius: "4px", padding: "2px 8px",
                      }}>
                        {ACTION_LABELS[log.action] ?? log.action}
                      </span>
                    </div>
                    {log.targetName && (
                      <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
                        Target: <strong style={{ color: "#555" }}>{log.targetName}</strong>
                        {log.targetType && <span style={{ color: "#aaa" }}> ({log.targetType})</span>}
                      </div>
                    )}
                    {log.metadata && (
                      <div style={{ fontSize: "11px", color: "#aaa", marginTop: "2px" }}>
                        {JSON.stringify(log.metadata)}
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <div style={{ flexShrink: 0, fontSize: "12px", color: "#aaa", textAlign: "right", whiteSpace: "nowrap" }}>
                    {formatDate(log.created_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}