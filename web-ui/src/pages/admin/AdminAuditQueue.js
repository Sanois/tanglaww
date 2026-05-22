import { useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";

const INITIAL_QUEUE = [
  { id: 1, name: "Johm Doe", email: "gwendump13@gmail.com", changing: "Profile information update" },
  { id: 2, name: "Jane Doe", email: "wyonasoriano13@gmail.com", changing: "Profile information update" },
  { id: 3, name: "Adlflf jzza", email: "alfiesdarknest80@gmail.com", changing: "Profile information update" },
];

export default function AdminAuditQueue() {
  const [queue, setQueue] = useState(INITIAL_QUEUE);

  const remove = (id) => setQueue((q) => q.filter((item) => item.id !== id));

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Poppins, sans-serif", backgroundColor: "#f5f6fa" }}>
      <AdminSidebar />
      <div style={{ marginLeft: "240px", flex: 1 }}>
        <AdminTopbar title={`Audit Queue (${queue.length})`} />
        <div style={{ padding: "32px 40px" }}>
          {queue.length === 0 ? (
            <p style={{ color: "#aaa", fontStyle: "italic" }}>No items in the audit queue.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {queue.map((item) => (
                <div key={item.id} style={{
                  backgroundColor: "#fff", borderRadius: "12px", padding: "24px",
                  border: "1px solid #eee", boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}>
                  <div style={{ fontSize: "15px", fontWeight: "700", color: "#1a1a6e", marginBottom: "4px" }}>{item.name}</div>
                  <div style={{ fontSize: "13px", color: "#888", marginBottom: "12px" }}>{item.email}</div>
                  <div style={{ fontSize: "13px", color: "#555", marginBottom: "4px" }}>Changing:</div>
                  <div style={{ fontSize: "13px", color: "#aaa", marginBottom: "20px" }}>→ {item.changing}</div>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <button onClick={() => remove(item.id)} style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #e53935", backgroundColor: "#fff", color: "#e53935", fontWeight: "600", fontSize: "14px", cursor: "pointer", fontFamily: "Poppins, sans-serif" }}>Reject</button>
                    <button onClick={() => remove(item.id)} style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "none", backgroundColor: "#1a1a6e", color: "#fff", fontWeight: "600", fontSize: "14px", cursor: "pointer", fontFamily: "Poppins, sans-serif" }}>Approve</button>
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