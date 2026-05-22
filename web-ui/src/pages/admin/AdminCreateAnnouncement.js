import { Megaphone } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import { supabase } from "../../lib/supabase";

export default function AdminCreateAnnouncement() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePublish = async () => {
    if (!title.trim() || !body.trim()) return;
    setPublishing(true);
    const { error } = await supabase.from("announcements").insert({
      title: title.trim(),
      content: body.trim(),
    });
    setPublishing(false);
    if (error) { alert("Error: " + error.message); return; }
    setSuccess(true);
    setTitle("");
    setBody("");
    setTimeout(() => setSuccess(false), 3000);
  };

  const inputBase = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1px solid #e0e0e0",
    fontSize: "14px",
    fontFamily: "Poppins, sans-serif",
    backgroundColor: "#f5f6fa",
    outline: "none",
    boxSizing: "border-box",
    color: "#1a1a2e",
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Poppins, sans-serif", backgroundColor: "#f5f6fa" }}>
      <AdminSidebar />
      <div style={{ marginLeft: "240px", flex: 1 }}>
        <AdminTopbar title="Create Announcement" />

      <div style={{ padding: "40px", maxWidth: "640px", margin: "0 auto" }}>

          {/* Broadcast banner card */}
          <div style={{
            backgroundColor: "#fff",
            borderRadius: "16px",
            padding: "36px 24px",
            textAlign: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            border: "1px solid #eee",
            marginBottom: "32px",
          }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>
              <Megaphone size={52} color="#f5a623" />
            </div>
            <div style={{ fontSize: "20px", fontWeight: "700", color: "#1a1a6e", marginBottom: "8px" }}>
              Broadcast Message
            </div>
            <div style={{ fontSize: "13px", color: "#888", lineHeight: "1.6" }}>
              The information you post here will be visible to all students on their dashboards.
            </div>
          </div>

          {/* Title field */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontSize: "14px", fontWeight: "700", color: "#1a1a6e", display: "block", marginBottom: "8px" }}>
              Announcement Title:*
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Enrollment Update"
              style={inputBase}
            />
          </div>

          {/* Body field */}
          <div style={{ marginBottom: "32px" }}>
            <label style={{ fontSize: "14px", fontWeight: "700", color: "#1a1a6e", display: "block", marginBottom: "8px" }}>
              Message Body:*
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="The information will be shown to all enrolled students..."
              rows={6}
              style={{ ...inputBase, resize: "vertical", lineHeight: "1.6" }}
            />
          </div>

          {/* Success message */}
          {success && (
            <div style={{
              backgroundColor: "#e8f5e9", border: "1px solid #4caf50",
              borderRadius: "10px", padding: "12px 16px",
              fontSize: "13px", fontWeight: "600", color: "#2e7d32",
              marginBottom: "16px", textAlign: "center",
            }}>
              ✓ Announcement published successfully!
            </div>
          )}

          {/* Publish button */}
          <button
            onClick={handlePublish}
            disabled={publishing || !title.trim() || !body.trim()}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "12px",
              border: "none",
              backgroundColor: !title.trim() || !body.trim() ? "#ccc" : "#1a1a6e",
              color: "#fff",
              fontSize: "15px",
              fontWeight: "700",
              cursor: !title.trim() || !body.trim() ? "not-allowed" : "pointer",
              fontFamily: "Poppins, sans-serif",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              transition: "background 0.2s",
            }}
          >
            {publishing ? "Publishing..." : "Publish Announcement"} →
          </button>

        </div>
      </div>
    </div>
  );
}