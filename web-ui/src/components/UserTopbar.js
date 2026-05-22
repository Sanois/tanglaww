import { Search } from "lucide-react";
import NotificationBell from "./NotificationBell";

export default function UserTopbar({ title }) {
  return (
    <div style={{
      backgroundColor: "#1a1a6e",
      padding: "0 32px",
      height: "60px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 50,
    }}>
      <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#fff", margin: 0 }}>{title}</h1>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          backgroundColor: "rgba(255,255,255,0.15)",
          borderRadius: "8px", padding: "7px 14px",
        }}>
          <Search size={15} color="rgba(255,255,255,0.7)" />
          <input
            placeholder="Enter search terms"
            style={{
              border: "none", background: "transparent", outline: "none",
              fontSize: "13px", fontFamily: "Poppins, sans-serif",
              color: "#fff", width: "200px",
            }}
          />
        </div>
        <NotificationBell />
      </div>
    </div>
  );
}