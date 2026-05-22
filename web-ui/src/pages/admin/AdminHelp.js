import { Check, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import { supabase } from "../../lib/supabase";

export default function AdminHelp() {
  const [activeTab, setActiveTab] = useState("faq");
  const [faqs, setFaqs] = useState([]);
  const [contact, setContact] = useState({ email: "", phone: "", office: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: faqData } = await supabase.from("faq").select("*").order("display_order");
    if (faqData) setFaqs(faqData);
    const { data: contactData } = await supabase.from("contact_info").select("*").single();
    if (contactData) setContact({ email: contactData.email ?? "", phone: contactData.phone ?? "", office: contactData.office ?? "" });
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateFaq = (id, field, value) => {
    setFaqs((prev) => prev.map((f) => f.id === id ? { ...f, [field === "q" ? "question" : "answer"]: value } : f));
  };

  const deleteFaq = async (id) => {
    await supabase.from("faq").delete().eq("id", id);
    setFaqs((prev) => prev.filter((f) => f.id !== id));
  };

  const addFaq = () => {
    setFaqs((prev) => [...prev, { id: `new_${Date.now()}`, question: "", answer: "", display_order: prev.length + 1, isNew: true }]);
  };

  const handleSave = async () => {
    setSaving(true);

    // Save FAQs
    for (const faq of faqs) {
      if (faq.isNew) {
        await supabase.from("faq").insert({
          question: faq.question,
          answer: faq.answer,
          display_order: faq.display_order,
        });
      } else {
        await supabase.from("faq").update({
          question: faq.question,
          answer: faq.answer,
        }).eq("id", faq.id);
      }
    }

    // Save contact
    const { data: existing } = await supabase.from("contact_info").select("id").single();
    if (existing) {
      await supabase.from("contact_info").update({
        email: contact.email,
        phone: contact.phone,
        office: contact.office,
        updated_at: new Date().toISOString(),
      }).eq("id", existing.id);
    } else {
      await supabase.from("contact_info").insert({
        email: contact.email,
        phone: contact.phone,
        office: contact.office,
      });
    }

    await fetchData();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const fieldStyle = {
    width: "100%", padding: "10px 14px", borderRadius: "8px",
    border: "1px solid #ddd", fontSize: "14px",
    fontFamily: "Poppins, sans-serif", boxSizing: "border-box",
    outline: "none", color: "#333",
  };

  const labelStyle = {
    fontSize: "12px", fontWeight: "700", color: "#1a1a6e",
    display: "block", marginBottom: "6px",
  };

  return (
    <div className="dashboard-layout admin-layout" style={{ fontFamily: "Poppins, sans-serif", backgroundColor: "#f5f6fa" }}>
      <AdminSidebar />
      <div className="dashboard-main">
        <AdminTopbar title="Edit Help & FAQ" />
        <div style={{ padding: "32px 40px" }}>

          {/* Tabs */}
          <div style={{ display: "flex", marginBottom: "24px", backgroundColor: "#f0f0f0", borderRadius: "10px", padding: "4px", width: "fit-content" }}>
            {[["faq", "FAQs"], ["contact", "Contact Us"]].map(([key, label]) => (
              <button key={key} onClick={() => setActiveTab(key)} style={{
                padding: "10px 32px", border: "none", cursor: "pointer",
                fontFamily: "Poppins, sans-serif", fontWeight: "700", fontSize: "14px",
                backgroundColor: activeTab === key ? "#1a1a6e" : "transparent",
                color: activeTab === key ? "#fff" : "#aaa",
                borderRadius: "8px", transition: "all 0.15s",
              }}>{label}</button>
            ))}
          </div>

          {loading ? <p style={{ color: "#aaa" }}>Loading...</p> : (
            <>
              {/* FAQ Tab */}
              {activeTab === "faq" && (
                <div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
                    {faqs.map((faq) => (
                      <div key={faq.id} style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "20px 24px", border: "1px solid #eee", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                          <span style={{ fontSize: "12px", fontWeight: "700", color: "#1a1a6e" }}>Question</span>
                          <button onClick={() => deleteFaq(faq.id)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                            <Trash2 size={14} color="#e53935" />
                          </button>
                        </div>
                        <input
                          value={faq.question}
                          onChange={(e) => updateFaq(faq.id, "q", e.target.value)}
                          placeholder="Enter question..."
                          style={{ ...fieldStyle, marginBottom: "12px" }}
                        />
                        <span style={labelStyle}>Answer</span>
                        <textarea
                          value={faq.answer}
                          onChange={(e) => updateFaq(faq.id, "a", e.target.value)}
                          placeholder="Enter answer..."
                          style={{ ...fieldStyle, minHeight: "80px", resize: "vertical" }}
                        />
                      </div>
                    ))}
                  </div>

                  <button onClick={addFaq} style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    backgroundColor: "#f0f3ff", color: "#1a1a6e",
                    border: "2px dashed #1a1a6e", borderRadius: "10px",
                    padding: "12px 24px", fontSize: "14px", fontWeight: "600",
                    cursor: "pointer", fontFamily: "Poppins, sans-serif",
                    width: "100%", justifyContent: "center", marginBottom: "24px",
                  }}>
                    <Plus size={16} /> Add New FAQ
                  </button>
                </div>
              )}

              {/* Contact Tab */}
              {activeTab === "contact" && (
                <div style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "24px", border: "1px solid #eee", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: "24px" }}>
                  <div style={{ marginBottom: "20px" }}>
                    <label style={labelStyle}>Support Email</label>
                    <input value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} style={fieldStyle} placeholder="support@tanglaw.edu.ph" />
                  </div>
                  <div style={{ marginBottom: "20px" }}>
                    <label style={labelStyle}>Phone Number</label>
                    <input value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} style={fieldStyle} placeholder="+63 912 345 6789" />
                  </div>
                  <div>
                    <label style={labelStyle}>Office Location</label>
                    <input value={contact.office} onChange={(e) => setContact({ ...contact, office: e.target.value })} style={fieldStyle} placeholder="Office address" />
                  </div>
                </div>
              )}
            </>
          )}

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