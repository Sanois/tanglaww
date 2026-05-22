import { Globe, Lightbulb, Trophy, Users } from "lucide-react";
import Navbar from "../components/Navbar";
import "./Home.css";

const team = [
  { name: "Mr. Ruel Atun", role: "Lead Instructor", initials: "RA" },
  { name: "Teacher A", role: "Founder & Director", initials: "TA" },
];

const values = [
  { title: "Excellence", desc: "We deliver review programs that meet the highest academic standards.", icon: Trophy },
  { title: "Accessibility", desc: "Quality education should be affordable and available to everyone.", icon: Globe },
  { title: "Innovation", desc: "We leverage technology to make learning flexible and effective.", icon: Lightbulb },
  { title: "Community", desc: "We build a supportive community of dreamers and achievers.", icon: Users },
];

export default function AboutUs() {
  return (
    <div style={{ fontFamily: "Poppins, sans-serif", backgroundColor: "#f5f6fa", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero */}
      <div style={{
        backgroundColor: "#1a1a6e", padding: "60px 40px",
        textAlign: "center", color: "#fff",
      }}>
        <h1 style={{ fontSize: "36px", fontWeight: "700", margin: "0 0 12px" }}>About Us</h1>
        <p style={{ fontSize: "16px", opacity: 0.8, maxWidth: "560px", margin: "0 auto" }}>
          Tanglaw is a review center dedicated to helping aspiring educators pass the Licensure Examination for Teachers.
        </p>
      </div>

      {/* TARC Section */}
      <div style={{ maxWidth: "900px", margin: "60px auto", padding: "0 40px" }}>
        <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "40px", boxShadow: "0 4px 16px rgba(0,0,0,0.07)", marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div style={{ width: "6px", height: "40px", backgroundColor: "#f5a623", borderRadius: "4px" }} />
            <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#1a1a6e", margin: 0 }}>Teacher A Review Center (TARC)</h2>
          </div>
          <p style={{ fontSize: "15px", color: "#555", lineHeight: "1.9" }}>
            Teacher A Review Center (TARC) was founded with a single mission — to provide quality, affordable, and accessible LET review programs for aspiring teachers across the Philippines. We believe that every dreamer deserves a chance to become an achiever.
          </p>
          <p style={{ fontSize: "15px", color: "#555", lineHeight: "1.9", marginTop: "12px" }}>
            TARC has helped thousands of examinees pass the LET through its innovative, concept-driven approach to review. Our programs are designed by experienced educators who understand what it takes to succeed in the licensure examination.
          </p>
        </div>

        {/* Tanglaw Section */}
        <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "40px", boxShadow: "0 4px 16px rgba(0,0,0,0.07)", marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div style={{ width: "6px", height: "40px", backgroundColor: "#1a1a6e", borderRadius: "4px" }} />
            <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#1a1a6e", margin: 0 }}>Tanglaw</h2>
          </div>
          <p style={{ fontSize: "15px", color: "#555", lineHeight: "1.9" }}>
            Tanglaw is the digital platform of TARC — bringing the review center experience to your fingertips. Through the Tanglaw app and web platform, students can access recorded sessions, handouts, quizzes, and live online sessions anytime, anywhere.
          </p>
          <p style={{ fontSize: "15px", color: "#555", lineHeight: "1.9", marginTop: "12px" }}>
            The name "Tanglaw" means light in Filipino — symbolizing our commitment to illuminate the path of every aspiring teacher toward licensure and beyond.
          </p>
        </div>

        {/* Values */}
        <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#1a1a2e", marginBottom: "20px", textAlign: "center" }}>Our Values</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "48px" }}>
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <div key={i} style={{
                backgroundColor: "#fff", borderRadius: "14px", padding: "24px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", gap: "16px", alignItems: "flex-start",
              }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "12px", backgroundColor: "#eef2ff", display: "grid", placeItems: "center" }}>
                  <Icon size={24} color="#1a1a6e" />
                </div>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: "700", color: "#1a1a2e", marginBottom: "6px" }}>{v.title}</div>
                  <div style={{ fontSize: "13px", color: "#666", lineHeight: "1.7" }}>{v.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer band */}
      <div style={{ backgroundColor: "#1a1a6e", padding: "40px", textAlign: "center", color: "#fff" }}>
        <p style={{ fontSize: "15px", opacity: 0.8, margin: 0 }}>
          "Where a Dreamer becomes an Achiever." — Tanglaw by Teacher A Review Center
        </p>
      </div>
    </div>
  );
}