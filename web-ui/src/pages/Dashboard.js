import { ArrowRight, ChevronDown, Clock, Image, TrendingUp, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import dashboardBanner from "../assets/dashboardBanner.png";
import Sidebar from "../components/Sidebar";
import UserTopbar from "../components/UserTopbar";
import { supabase } from "../lib/supabase";
import "./Dashboard.css";

const courses = [
  { name: "LET On Boarding (Concept-Driven)", instructor: "Mr. Rue Alun", progress: 100, color: "#4caf50" },
  { name: "LET Express", instructor: "Mr. Rue Alun", progress: 70, color: "#4caf50" },
  { name: "LET Advance", instructor: "Mr. Rue Alun", progress: 100, color: "#4caf50" },
  { name: "Integrative", instructor: "Mr. Rue Alun", progress: 70, color: "#4caf50" },
];

const deadlines = [
  { title: "LET Express - Online Session", date: "Oct 23, 2025", time: "10:00AM" },
  { title: "LET Advance - Online Session", date: "Oct 24, 2025", time: "10:00AM" },
];

function ProgressRing({ percent }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#eee" strokeWidth="10" />
      <circle cx="50" cy="50" r={r} fill="none" stroke="#4caf50" strokeWidth="10"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 50 50)" />
      <text x="50" y="55" textAnchor="middle" fontSize="16" fontWeight="700" fill="#1a1a2e">
        {percent}%
      </text>
    </svg>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const { data } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);
      setAnnouncements(data ?? []);
    };
    fetchAnnouncements();
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <UserTopbar title="Dashboard" />
        <div className="dashboard-content">

          {/* LEFT */}
          <div className="dashboard-left">

            {/* Welcome */}
            <div className="card">
              <div className="card-title">Welcome Back!</div>
              <div className="banner-carousel" style={{ padding: 0, overflow: "hidden", borderRadius: "10px" }}>
                <img src={dashboardBanner} alt="Banner" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div className="carousel-dots">
                <div className="dot active" /><div className="dot" /><div className="dot" /><div className="dot" />
              </div>
            </div>

            {/* Announcements */}
            {announcements.length > 0 && (
              <div className="card">
                <div className="card-title">📢 Announcements</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {announcements.map((a) => (
                    <div key={a.id} style={{
                      backgroundColor: "#f8f9ff", borderRadius: "10px",
                      padding: "14px 16px", border: "1px solid #e8eaf6",
                    }}>
                      <div style={{ fontSize: "13px", fontWeight: "700", color: "#1a1a6e", marginBottom: "4px" }}>
                        {a.title}
                      </div>
                      <div style={{ fontSize: "12px", color: "#555", lineHeight: "1.6" }}>{a.content}</div>
                      <div style={{ fontSize: "11px", color: "#aaa", marginTop: "6px" }}>
                        {new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Continue */}
            <div className="card">
              <div className="card-title">Continue where you left off...</div>
              <div className="session-card" onClick={() => navigate("/dashboard/courses")}>
                <div>
                  <div className="session-label">Recorded Session</div>
                  <div className="session-title">LET Express</div>
                </div>
                <ArrowRight size={20} color="#1a1a6e" />
              </div>
            </div>

            {/* Courses */}
            <div className="card">
              <div className="card-title">Courses</div>
              <div className="courses-grid">
                {courses.map((c, i) => (
                  <div key={i} className="course-card">
                    <div className="course-thumb">
                      <div className="course-progress-badge">
                        <div className="progress-dot" style={{ backgroundColor: c.color }} />
                        {c.progress}%
                      </div>
                      <Image size={28} color="#bbb" />
                    </div>
                    <div className="course-info">
                      <div className="course-name">{c.name}</div>
                      <div className="course-instructor">{c.instructor}</div>
                      <div className="course-expand"><ChevronDown size={14} color="#aaa" /></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT */}
          <div className="dashboard-right">

            {/* Profile */}
            <div className="card">
              <div className="profile-banner" />
              <div className="profile-avatar"><User size={32} color="#9e9e9e" /></div>
              <div className="profile-name">JOHN DOE</div>
              <div className="profile-degree">Bachelor of Elementary Education</div>
              <div className="profile-email">johndoejucat19@gmail.com</div>
            </div>

            {/* Review Progress */}
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
                <TrendingUp size={16} color="#1a1a6e" />
                <span style={{ fontSize: "14px", fontWeight: "700", color: "#1a1a2e" }}>Review progress</span>
              </div>
              <div className="progress-ring-wrap"><ProgressRing percent={54} /></div>
            </div>

            {/* Deadlines */}
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
                <Clock size={16} color="#1a1a6e" />
                <span style={{ fontSize: "14px", fontWeight: "700", color: "#1a1a2e" }}>Deadlines</span>
              </div>
              {deadlines.map((d, i) => (
                <div key={i} className="deadline-item">
                  <div className="deadline-title">{d.title}</div>
                  <div className="deadline-meta">{d.date} · {d.time}</div>
                  <div className="deadline-link">Join session →</div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}