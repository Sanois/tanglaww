import { useState } from "react";
import { FiArrowLeft, FiEyeOff, FiEye } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./Dashboard.css";

export default function ChangePassword() {
  const navigate = useNavigate();
  const [show, setShow] = useState({ old: false, new: false, confirm: false });
  const [form, setForm] = useState({ old: "", new: "", confirm: "" });

  const toggle = (field) => setShow((prev) => ({ ...prev, [field]: !prev[field] }));

  const handleDone = () => {
    // TODO: connect to Supabase password update
    navigate("/dashboard/settings");
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main" style={{ backgroundColor: "#f5f6fa", minHeight: "100vh" }}>

        {/* Header */}
        <div style={{
          backgroundColor: "#1a1a6e",
          padding: "24px 40px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}>
          <FiArrowLeft size={22} color="#fff" style={{ cursor: "pointer" }} onClick={() => navigate(-1)} />
          <h1 style={{ color: "#fff", fontSize: "24px", fontWeight: "700", margin: 0 }}>
            Change Password
          </h1>
        </div>

        {/* Form */}
       <div style={{ padding: "48px 40px", width: "100%", boxSizing: "border-box" }}>

          {[
            { label: "Old Password:*", key: "old", placeholder: "Old Password" },
            { label: "New Password:*", key: "new", placeholder: "New Password" },
            { label: "Confirm Password:*", key: "confirm", placeholder: "Confirm Password" },
          ].map(({ label, key, placeholder }) => (
            <div key={key} style={{ marginBottom: "28px" }}>
              <label style={{
                fontSize: "15px", fontWeight: "600",
                color: "#1a1a2e", display: "block", marginBottom: "10px",
              }}>
                {label}
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={show[key] ? "text" : "password"}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "14px 44px 14px 16px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    fontSize: "14px",
                    fontFamily: "Poppins, sans-serif",
                    color: "#333",
                    boxSizing: "border-box",
                    outline: "none",
                    backgroundColor: "#fff",
                  }}
                />
                <span
                  onClick={() => toggle(key)}
                  style={{
                    position: "absolute", right: "14px", top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer", color: "#aaa",
                  }}
                >
                  {show[key] ? <FiEye size={18} /> : <FiEyeOff size={18} />}
                </span>
              </div>
            </div>
          ))}

          <button
            onClick={handleDone}
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: "#1a1a6e",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer",
              fontFamily: "Poppins, sans-serif",
              marginTop: "8px",
            }}
          >
            Done
          </button>

        </div>
      </div>
    </div>
  );
}