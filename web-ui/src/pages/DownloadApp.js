import Navbar from "../components/Navbar";
import "./Home.css";

const features = [
  { icon: "📹", title: "Replay Sessions", desc: "Watch recorded review sessions anytime, anywhere at your own pace." },
  { icon: "📄", title: "Access Handouts", desc: "Download and view all course handouts directly from the app." },
  { icon: "🔔", title: "Stay Updated", desc: "Get notified about upcoming sessions, deadlines, and announcements." },
  { icon: "📅", title: "Track Progress", desc: "Monitor your review progress and stay on top of your goals." },
];

export default function DownloadApp() {
  return (
    <div style={{ fontFamily: "Poppins, sans-serif", backgroundColor: "#f5f6fa", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero */}
      <div style={{
        backgroundColor: "#1a1a6e", padding: "80px 40px",
        textAlign: "center", color: "#fff",
      }}>
        <h1 style={{ fontSize: "40px", fontWeight: "700", margin: "0 0 16px" }}>Download the Tanglaw App</h1>
        <p style={{ fontSize: "16px", opacity: 0.8, maxWidth: "560px", margin: "0 auto 36px" }}>
          Take your LET review anywhere. Access sessions, handouts, and more — all in one app.
        </p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <a href="https://play.google.com/store" target="_blank" rel="noreferrer" style={{
            display: "flex", alignItems: "center", gap: "10px",
            backgroundColor: "#fff", color: "#1a1a2e",
            padding: "14px 28px", borderRadius: "14px",
            fontWeight: "700", fontSize: "15px", textDecoration: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}>
            <span style={{ fontSize: "24px" }}>▶</span>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: "10px", fontWeight: "500", opacity: 0.6 }}>GET IT ON</div>
              <div>Google Play</div>
            </div>
          </a>
          <a href="https://apps.apple.com" target="_blank" rel="noreferrer" style={{
            display: "flex", alignItems: "center", gap: "10px",
            backgroundColor: "#fff", color: "#1a1a2e",
            padding: "14px 28px", borderRadius: "14px",
            fontWeight: "700", fontSize: "15px", textDecoration: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}>
            <span style={{ fontSize: "24px" }}>🍎</span>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: "10px", fontWeight: "500", opacity: 0.6 }}>DOWNLOAD ON THE</div>
              <div>App Store</div>
            </div>
          </a>
        </div>
      </div>

      {/* Features */}
      <div style={{ maxWidth: "900px", margin: "60px auto", padding: "0 40px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#1a1a2e", textAlign: "center", marginBottom: "32px" }}>
          Everything you need, in your pocket
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "60px" }}>
          {features.map((f, i) => (
            <div key={i} style={{
              backgroundColor: "#fff", borderRadius: "14px", padding: "28px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", gap: "16px",
            }}>
              <span style={{ fontSize: "32px" }}>{f.icon}</span>
              <div>
                <div style={{ fontSize: "15px", fontWeight: "700", color: "#1a1a2e", marginBottom: "6px" }}>{f.title}</div>
                <div style={{ fontSize: "13px", color: "#666", lineHeight: "1.7" }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Steps */}
        <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#1a1a2e", textAlign: "center", marginBottom: "24px" }}>
          How to get started
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "60px" }}>
          {[
            { step: "1", title: "Download the app", desc: "Search for 'Tanglaw by TARC' on Google Play or the App Store." },
            { step: "2", title: "Create your account", desc: "Sign up using your enrollment details or register through the app." },
            { step: "3", title: "Start reviewing", desc: "Access your courses, watch sessions, and download handouts instantly." },
          ].map((s, i) => (
            <div key={i} style={{
              backgroundColor: "#fff", borderRadius: "12px", padding: "20px 24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex", gap: "16px", alignItems: "center",
            }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "50%",
                backgroundColor: "#f5a623", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "16px", fontWeight: "700", color: "#1a1a2e", flexShrink: 0,
              }}>{s.step}</div>
              <div>
                <div style={{ fontSize: "15px", fontWeight: "700", color: "#1a1a2e" }}>{s.title}</div>
                <div style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer band */}
      <div style={{ backgroundColor: "#f5a623", padding: "40px", textAlign: "center" }}>
        <p style={{ fontSize: "20px", fontWeight: "700", color: "#1a1a2e", margin: "0 0 8px" }}>
          Ready to start your journey?
        </p>
        <p style={{ fontSize: "14px", color: "#1a1a2e", opacity: 0.7, margin: "0 0 24px" }}>
          Download now and review smarter with Tanglaw.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <a href="https://play.google.com/store" target="_blank" rel="noreferrer" style={{
            padding: "12px 28px", backgroundColor: "#1a1a6e", color: "#fff",
            borderRadius: "999px", fontWeight: "700", fontSize: "14px", textDecoration: "none",
          }}>Google Play</a>
          <a href="https://apps.apple.com" target="_blank" rel="noreferrer" style={{
            padding: "12px 28px", backgroundColor: "#1a1a6e", color: "#fff",
            borderRadius: "999px", fontWeight: "700", fontSize: "14px", textDecoration: "none",
          }}>App Store</a>
        </div>
      </div>
    </div>
  );
}