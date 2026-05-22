import { Check, Info } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import { supabase } from "../../lib/supabase";

export default function AdminAbout() {
  const [activeTab, setActiveTab] = useState("Tanglaw");
  const [content, setContent] = useState({ Tanglaw: "", TARC: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("about_content").select("*");
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
      .from("about_content")
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
        <AdminTopbar title="Edit About Content" />
        <div style={{ padding: "32px 40px" }}>

          {/* Tabs */}
          <div style={{ display: "flex", marginBottom: "24px", backgroundColor: "#f0f0f0", borderRadius: "10px", padding: "4px", width: "fit-content" }}>
            {["Tanglaw", "TARC"].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: "10px 32px", border: "none", cursor: "pointer",
                fontFamily: "Poppins, sans-serif", fontWeight: "700", fontSize: "14px",
                backgroundColor: activeTab === tab ? "#1a1a6e" : "transparent",
                color: activeTab === tab ? "#fff" : "#aaa",
                borderRadius: "8px", transition: "all 0.15s",
              }}>{tab}</button>
            ))}
          </div>

          {/* Editor */}
          <div style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "24px", border: "1px solid #eee", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#1a1a2e", marginBottom: "12px" }}>
              Description for {activeTab}
            </h3>
            {loading ? <p style={{ color: "#aaa" }}>Loading...</p> : (
              <textarea
                value={content[activeTab]}
                onChange={(e) => setContent({ ...content, [activeTab]: e.target.value })}
                style={{
                  width: "100%", minHeight: "300px", padding: "14px",
                  borderRadius: "8px", border: "1px solid #eee",
                  fontSize: "14px", fontFamily: "Poppins, sans-serif",
                  color: "#444", lineHeight: "1.7", resize: "vertical",
                  outline: "none", boxSizing: "border-box",
                }}
              />
            )}
          </div>

          {/* Info box */}
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", backgroundColor: "#eef0fb", borderRadius: "10px", padding: "14px 16px", marginBottom: "24px" }}>
            <Info size={16} color="#1a1a6e" style={{ flexShrink: 0, marginTop: "2px" }} />
            <p style={{ fontSize: "13px", color: "#1a1a6e", margin: 0 }}>
              Changes made here will be reflected immediately in the student's "About" section.
            </p>
          </div>

          <button onClick={handleSave} disabled={saving} style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "12px 40px", backgroundColor: "#1a1a6e", color: "#fff",
            border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "700",
            cursor: "pointer", fontFamily: "Poppins, sans-serif", opacity: saving ? 0.7 : 1,
          }}>
            {saved ? <><Check size={16} /> Saved</> : saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}