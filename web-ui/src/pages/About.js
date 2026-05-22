import { useState, useRef } from "react";
import { FiSearch, FiBell } from "react-icons/fi";
import Sidebar from "../components/Sidebar";
import "./Dashboard.css";

const TABS = ["TARC", "TANGLAW"];

const CONTENT = {
  TARC: [
    {
      title: "History",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    },
    {
      title: "Mission",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    },
    {
      title: "Vision",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    },
  ],
  TANGLAW: [
    {
      title: "History",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    },
    {
      title: "Mission",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    },
    {
      title: "Vision",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    },
  ],
};

export default function About() {
  const [activeTab, setActiveTab] = useState("TARC");

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">

        {/* Header Banner */}
        <div style={{
          backgroundColor: "#1a1a6e",
          padding: "20px 32px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          position: "relative",
        }}>
          
          <h1 style={{
            position: "absolute", left: "50%", transform: "translateX(-50%)",
            color: "#fff", fontSize: "22px", fontWeight: "700", margin: 0,
          }}>
            About
          </h1>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex",
          backgroundColor: "#1a1a6e",
          borderBottom: "none",
        }}>
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: "14px",
                border: "none",
                backgroundColor: "transparent",
                color: activeTab === tab ? "#f5a623" : "#fff",
                fontWeight: "700",
                fontSize: "14px",
                fontFamily: "Poppins, sans-serif",
                cursor: "pointer",
                borderBottom: activeTab === tab ? "3px solid #f5a623" : "3px solid transparent",
                transition: "all 0.15s",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: "32px 40px", overflowY: "auto" }}>
          {CONTENT[activeTab].map((section, i) => (
            <div key={i} style={{ marginBottom: "36px" }}>
              <h2 style={{
                fontSize: "20px", fontWeight: "700",
                color: "#1a1a2e", marginBottom: "16px",
              }}>
                {section.title}
              </h2>
              <p style={{
                fontSize: "14px", lineHeight: "1.8",
                color: "#444", margin: 0,
              }}>
                {section.body}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}