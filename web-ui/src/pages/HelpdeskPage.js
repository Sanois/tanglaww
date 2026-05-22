import { Mail, MapPin, Phone, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Home.css";

const faqs = [
  { q: "How do I enroll in a course?", a: "Click the 'Enroll Now' button on the home page or Our Courses page and follow the step-by-step enrollment process." },
  { q: "How do I access my courses after enrolling?", a: "Sign in to your account and navigate to the Courses section in your dashboard to access all your enrolled courses." },
  { q: "Can I replay recorded sessions?", a: "Yes! All recorded sessions are available for replay anytime through the Tanglaw app or web platform." },
  { q: "What payment methods are accepted?", a: "We accept GCash, Maya, bank transfers, and other payment channels listed during enrollment." },
  { q: "How do I download the Tanglaw app?", a: "The Tanglaw app is available on the Google Play Store and Apple App Store. Search for 'Tanglaw by TARC'." },
  { q: "I forgot my password. What should I do?", a: "Click 'Forgot Password' on the sign-in page and follow the instructions sent to your registered email." },
];

const contacts = [
  { icon: Mail, label: "Email", value: "teacheraonlinereview@gmail.com", sub: "We reply within 24 hours" },
  { icon: Smartphone, label: "Facebook", value: "facebook.com/teacheraonlinereviewcenter", sub: "Message us on Facebook" },
  { icon: Phone, label: "Phone", value: "+63 951 698 9114", sub: "Mon–Fri, 9AM–5PM" },
  { icon: MapPin, label: "Location", value: "Philippines", sub: "Nationwide online review" },
];

export default function HelpdeskPage() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: "Poppins, sans-serif", backgroundColor: "#f5f6fa", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero */}
      <div style={{
        backgroundColor: "#1a1a6e", padding: "60px 40px",
        textAlign: "center", color: "#fff",
      }}>
        <h1 style={{ fontSize: "36px", fontWeight: "700", margin: "0 0 12px" }}>Helpdesk</h1>
        <p style={{ fontSize: "16px", opacity: 0.8, maxWidth: "560px", margin: "0 auto" }}>
          Have questions? We're here to help. Browse our FAQs or reach out to us directly.
        </p>
      </div>

      <div style={{ maxWidth: "860px", margin: "60px auto", padding: "0 40px" }}>

        {/* FAQ */}
        <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#1a1a2e", marginBottom: "20px" }}>Frequently Asked Questions</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "60px" }}>
          {faqs.map((f, i) => (
            <div key={i} style={{
              backgroundColor: "#fff", borderRadius: "12px", padding: "20px 24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#1a1a6e", marginBottom: "8px" }}>
                {f.q}
              </div>
              <div style={{ fontSize: "14px", color: "#555", lineHeight: "1.7" }}>{f.a}</div>
            </div>
          ))}
        </div>

        {/* Contact Cards */}
        <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#1a1a2e", marginBottom: "20px" }}>Contact Us</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "60px" }}>
          {contacts.map((c, i) => {
            const Icon = c.icon;
            return (
              <div key={i} style={{
                backgroundColor: "#fff", borderRadius: "14px", padding: "24px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", gap: "16px", alignItems: "flex-start",
              }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "12px", backgroundColor: "#eef2ff", display: "grid", placeItems: "center" }}>
                  <Icon size={24} color="#1a1a6e" />
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.08em" }}>{c.label}</div>
                  <div style={{ fontSize: "15px", fontWeight: "600", color: "#1a1a2e", marginTop: "4px" }}>{c.value}</div>
                  <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>{c.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer band */}
      <div style={{ backgroundColor: "#f5a623", padding: "40px", textAlign: "center" }}>
        <p style={{ fontSize: "15px", fontWeight: "600", color: "#1a1a2e", margin: "0 0 16px" }}>
          Ready to start your journey?
        </p>
        <button onClick={() => navigate("/enroll")} style={{
          padding: "14px 36px", backgroundColor: "#1a1a6e", color: "#fff",
          border: "none", borderRadius: "999px", fontSize: "15px", fontWeight: "700",
          cursor: "pointer", fontFamily: "Poppins, sans-serif",
        }}>
          Enroll Now
        </button>
      </div>
    </div>
  );
}