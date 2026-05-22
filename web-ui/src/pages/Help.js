import Sidebar from "../components/Sidebar";
import { Search, ChevronDown, ChevronUp, Mail, MessageCircle, Phone } from "lucide-react";
import { useState } from "react";
import "./Dashboard.css";

const FAQS = [
  { q: "How do I enroll in a course?", a: "Go to the Enroll page from the home screen, select your program and curriculum, fill in your personal information, and complete the payment process." },
  { q: "How do I access my recorded sessions?", a: "Go to the Courses page, select your enrolled course, and click on the Recorded Sessions tab to view all available recordings." },
  { q: "What payment methods are accepted?", a: "We accept GCash, Maya, Bank Transfer, and other payment methods. You can specify during enrollment." },
  { q: "How long does admin approval take?", a: "Admin approval typically takes 1-3 business days. You will receive an email with your activation code once approved." },
  { q: "Can I change my enrolled course?", a: "Please contact our support team via email or the helpdesk to request a course change. Changes are subject to availability." },
  { q: "What happens if I miss a live session?", a: "All live sessions are recorded and made available within 24 hours. You can replay them anytime from the Courses page." },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      border: "1px solid #eee", borderRadius: "10px",
      overflow: "hidden", marginBottom: "10px",
    }}>
      <div onClick={() => setOpen(!open)} style={{
        padding: "16px 20px", display: "flex",
        justifyContent: "space-between", alignItems: "center",
        cursor: "pointer", backgroundColor: open ? "#f0f3ff" : "#fff",
        fontWeight: "600", fontSize: "14px", color: "#1a1a2e",
      }}>
        {q}
        {open ? <ChevronUp size={16} color="#1a1a6e" /> : <ChevronDown size={16} color="#aaa" />}
      </div>
      {open && (
        <div style={{ padding: "14px 20px", fontSize: "13px", color: "#555", lineHeight: "1.7", borderTop: "1px solid #eee" }}>
          {a}
        </div>
      )}
    </div>
  );
}

export default function Help() {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">

        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-search">
            <Search size={16} color="#aaa" />
            <input placeholder="Search help articles..." />
          </div>
        </div>

    <div style={{ padding: "32px 40px" }}>

          {/* Header */}
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1a1a2e", marginBottom: "4px" }}>Help Center</h1>
          <p style={{ fontSize: "14px", color: "#888", marginBottom: "32px" }}>Find answers to common questions or contact our support team.</p>

          {/* Contact Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "40px" }}>
            {[
              { icon: <Mail size={24} color="#1a1a6e" />, label: "Email Support", value: "support@tanglaw.com" },
              { icon: <MessageCircle size={24} color="#1a1a6e" />, label: "Live Chat", value: "Available 8AM - 5PM" },
              { icon: <Phone size={24} color="#1a1a6e" />, label: "Phone", value: "+63 912 345 6789" },
            ].map((c, i) => (
              <div key={i} style={{
                backgroundColor: "#fff", borderRadius: "12px",
                padding: "20px", textAlign: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                border: "1px solid #eee",
              }}>
                <div style={{ marginBottom: "10px" }}>{c.icon}</div>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#1a1a2e", marginBottom: "4px" }}>{c.label}</div>
                <div style={{ fontSize: "12px", color: "#888" }}>{c.value}</div>
              </div>
            ))}
          </div>

          {/* FAQs */}
          <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#1a1a2e", marginBottom: "16px" }}>Frequently Asked Questions</h2>
          {FAQS.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} />)}
        </div>
      </div>
    </div>
  );
}