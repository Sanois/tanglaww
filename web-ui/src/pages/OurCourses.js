import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Home.css";

const courses = [
  {
    title: "LET On Boarding (Concept-Driven)",
    description: "A foundational review program designed to build your core understanding of LET concepts from the ground up.",
    duration: "12 weeks",
    sessions: "24 sessions",
    color: "#1a1a6e",
  },
  {
    title: "LET Express",
    description: "A fast-tracked, intensive review for those who need to prepare quickly without sacrificing quality.",
    duration: "6 weeks",
    sessions: "12 sessions",
    color: "#f5a623",
  },
  {
    title: "LET Advance",
    description: "An advanced review program for serious takers who want deep mastery of all LET subject areas.",
    duration: "16 weeks",
    sessions: "32 sessions",
    color: "#1a1a6e",
  },
  {
    title: "Integrative",
    description: "A comprehensive integrative review combining all disciplines for a complete LET preparation experience.",
    duration: "10 weeks",
    sessions: "20 sessions",
    color: "#f5a623",
  },
];

export default function OurCourses() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: "Poppins, sans-serif", backgroundColor: "#f5f6fa", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero */}
      <div style={{
        backgroundColor: "#1a1a6e", padding: "60px 40px",
        textAlign: "center", color: "#fff",
      }}>
        <h1 style={{ fontSize: "36px", fontWeight: "700", margin: "0 0 12px" }}>Our Courses</h1>
        <p style={{ fontSize: "16px", opacity: 0.8, maxWidth: "560px", margin: "0 auto" }}>
          Choose the review program that fits your pace, schedule, and goals.
        </p>
      </div>

      {/* Course Cards */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "24px", padding: "60px 80px", maxWidth: "1200px", margin: "0 auto",
      }}>
        {courses.map((c, i) => (
          <div key={i} style={{
            backgroundColor: "#fff", borderRadius: "16px",
            overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            display: "flex", flexDirection: "column",
          }}>
            <div style={{ backgroundColor: c.color, height: "8px" }} />
            <div style={{ padding: "28px 24px", flex: 1 }}>
              <h2 style={{ fontSize: "17px", fontWeight: "700", color: "#1a1a2e", marginBottom: "12px" }}>{c.title}</h2>
              <p style={{ fontSize: "14px", color: "#666", lineHeight: "1.7", marginBottom: "20px" }}>{c.description}</p>
              <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
                <span style={{
                  backgroundColor: "#f0f3ff", color: "#1a1a6e",
                  padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600",
                }}>{c.duration}</span>
                <span style={{
                  backgroundColor: "#fff8e1", color: "#f5a623",
                  padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600",
                }}>{c.sessions}</span>
              </div>
              <button onClick={() => navigate("/enroll")} style={{
                width: "100%", padding: "12px",
                backgroundColor: c.color, color: "#fff",
                border: "none", borderRadius: "10px",
                fontSize: "14px", fontWeight: "700",
                cursor: "pointer", fontFamily: "Poppins, sans-serif",
              }}>
                Enroll Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{
        backgroundColor: "#f5a623", padding: "60px 40px", textAlign: "center",
      }}>
        <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#1a1a2e", marginBottom: "12px" }}>
          Not sure which course to take?
        </h2>
        <p style={{ fontSize: "15px", color: "#1a1a2e", marginBottom: "28px", opacity: 0.8 }}>
          Our team is here to help you choose the right program.
        </p>
        <button onClick={() => navigate("/helpdesk")} style={{
          padding: "14px 36px", backgroundColor: "#1a1a6e", color: "#fff",
          border: "none", borderRadius: "999px", fontSize: "15px", fontWeight: "700",
          cursor: "pointer", fontFamily: "Poppins, sans-serif",
        }}>
          Contact Us
        </button>
      </div>
    </div>
  );
}