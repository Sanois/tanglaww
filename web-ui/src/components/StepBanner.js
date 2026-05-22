import enrollBanner from "../assets/enrollBanner.png";
const TOTAL_STEPS = 5;
export default function StepBanner({ title, currentStep }) {
  return (
    <div style={{ position: "relative" }}>
      <img src={enrollBanner} alt="Banner" style={{ width: "100%", height: "160px", objectFit: "cover", display: "block" }} />
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.45)" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", display: "flex", alignItems: "center" }}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "50%",
              backgroundColor: i < currentStep ? "#f5a623" : i === currentStep ? "#fff" : "rgba(255,255,255,0.4)",
              color: i === currentStep ? "#1a1a6e" : "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: "700", fontSize: "14px",
              border: i === currentStep ? "3px solid #fff" : "none",
              position: "relative", zIndex: 1,
            }}>
              {i + 1}
            </div>
            {i < TOTAL_STEPS - 1 && (
              <div style={{ width: "40px", height: "2px", backgroundColor: i < currentStep ? "#f5a623" : "rgba(255,255,255,0.4)", zIndex: 1 }} />
            )}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", bottom: "16px", left: "24px", color: "#fff", fontSize: "20px", fontWeight: "700", textShadow: "0 1px 4px rgba(0,0,0,0.6)", zIndex: 1 }}>
        {title}
      </div>
    </div>
  );
}