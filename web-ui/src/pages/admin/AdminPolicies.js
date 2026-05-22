import { AlertCircle, Check } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import { supabase } from "../../lib/supabase";

export default function AdminPolicies() {
  const [activeTab, setActiveTab] = useState("Privacy");
  const [content, setContent] = useState({ Privacy: "", Terms: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("policy_content").select("*");
    if (data) {
      const map = {};
      data.forEach((row) => { map[row.section] = row.content; });
      setContent((prev) => ({ ...prev, ...map }));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchContent(); }, [fetchContent]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("policy_content")
      .upsert({ section: activeTab, content: content[activeTab], updated_at: new Date().toISOString() }, { onConflict: "section" });
    if (error) { alert("Save error: " + error.message); setSaving(false); return; }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="dashboard-layout admin-layout" style={{ fontFamily: "Poppins, sans-serif", backgroundColor: "#f5f6fa" }}>
      <AdminSidebar />
      <div className="dashboard-main">
        <AdminTopbar title="Legal & Policies" />
        <div style={{ padding: "32px 40px" }}>

          {/* Tabs */}
          <div style={{ display: "flex", marginBottom: "24px", backgroundColor: "#f0f0f0", borderRadius: "10px", padding: "4px", width: "fit-content" }}>
            {[["Privacy", "Privacy Policy"], ["Terms", "Terms of Use"]].map(([key, label]) => (
              <button key={key} onClick={() => setActiveTab(key)} style={{
                padding: "10px 32px", border: "none", cursor: "pointer",
                fontFamily: "Poppins, sans-serif", fontWeight: "700", fontSize: "14px",
                backgroundColor: activeTab === key ? "#1a1a6e" : "transparent",
                color: activeTab === key ? "#fff" : "#aaa",
                borderRadius: "8px", transition: "all 0.15s",
                boxShadow: activeTab === key ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
              }}>{label}</button>
            ))}
          </div>

          {/* Editor */}
          <div style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "24px", border: "1px solid #eee", marginBottom: "16px" }}>
            <p style={{ fontSize: "11px", fontWeight: "700", color: "#aaa", textTransform: "uppercase", marginBottom: "12px", letterSpacing: "0.08em" }}>
              Editing: {activeTab === "Privacy" ? "Privacy Policy" : "Terms of Use"}
            </p>
            {loading ? <p style={{ color: "#aaa" }}>Loading...</p> : (
              <textarea
                value={content[activeTab]}
                onChange={(e) => setContent({ ...content, [activeTab]: e.target.value })}
                placeholder="Paste or type the policy content here..."
                style={{
                  width: "100%", minHeight: "400px", padding: "20px",
                  borderRadius: "10px", border: "1px solid #eee",
                  fontSize: "15px", fontFamily: "Poppins, sans-serif",
                  color: "#333", lineHeight: "1.8", resize: "vertical",
                  outline: "none", boxSizing: "border-box",
                  backgroundColor: "#fdfdfd",
                }}
              />
            )}
          </div>

          {/* Warning */}
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", backgroundColor: "#fff5f5", borderRadius: "10px", padding: "14px 16px", marginBottom: "24px", border: "1px solid #ffebeb" }}>
            <AlertCircle size={18} color="#e53935" style={{ flexShrink: 0, marginTop: "2px" }} />
            <p style={{ fontSize: "13px", color: "#e53935", margin: 0, lineHeight: "1.6" }}>
              Legal documents affect user rights. Ensure all changes are verified by the university administration.
            </p>
          </div>

          <button onClick={handleSave} disabled={saving} style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "12px 40px", backgroundColor: "#1a1a6e", color: "#fff",
            border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "700",
            cursor: "pointer", fontFamily: "Poppins, sans-serif", opacity: saving ? 0.7 : 1,
          }}>
            {saved ? <><Check size={16} /> Saved</> : saving ? "Saving..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
}