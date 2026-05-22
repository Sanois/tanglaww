import Sidebar from "../components/Sidebar";
import { Search } from "lucide-react";
import "./Dashboard.css";

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: "By accessing and using the Tanglaw platform, you agree to be bound by these Terms and Policies. If you do not agree to these terms, please do not use the platform. Tanglaw reserves the right to update these terms at any time without prior notice.",
  },
  {
    title: "2. User Accounts",
    body: "You are responsible for maintaining the confidentiality of your account credentials. You agree to notify Tanglaw immediately of any unauthorized use of your account. Tanglaw is not liable for any loss resulting from unauthorized use of your account.",
  },
  {
    title: "3. Enrollment and Payment",
    body: "Enrollment is subject to admin approval. Payments made are non-refundable unless otherwise stated. Tanglaw reserves the right to cancel an enrollment if payment verification fails or if fraudulent activity is detected.",
  },
  {
    title: "4. Intellectual Property",
    body: "All content available on the Tanglaw platform, including but not limited to videos, modules, assessments, and materials, are the intellectual property of Teacher A Review Center. Unauthorized reproduction or distribution is strictly prohibited.",
  },
  {
    title: "5. Code of Conduct",
    body: "Users are expected to behave respectfully within the platform. Any form of harassment, cheating, or misuse of the platform will result in immediate account suspension without refund.",
  },
  {
    title: "6. Privacy Policy",
    body: "Tanglaw collects and processes personal data in accordance with the Data Privacy Act of 2012 (RA 10173). Your personal information is used solely for enrollment, communication, and platform improvement purposes and will not be shared with third parties without your consent.",
  },
  {
    title: "7. Limitation of Liability",
    body: "Tanglaw shall not be liable for any indirect, incidental, or consequential damages arising from the use or inability to use the platform. The platform is provided on an 'as is' basis without warranties of any kind.",
  },
  {
    title: "8. Changes to Terms",
    body: "Tanglaw reserves the right to modify these terms at any time. Continued use of the platform after changes are posted constitutes acceptance of the revised terms. Users will be notified of significant changes via email.",
  },
];

export default function Terms() {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">

        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-search">
            <Search size={16} color="#aaa" />
            <input placeholder="Enter search terms" />
          </div>
        </div>

<div style={{ padding: "32px 40px" }}>

          {/* Header */}
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1a1a2e", marginBottom: "4px" }}>Terms & Policies</h1>
          <p style={{ fontSize: "13px", color: "#aaa", marginBottom: "32px" }}>Last updated: October 1, 2025</p>

          {/* Sections */}
          {SECTIONS.map((s, i) => (
            <div key={i} style={{ marginBottom: "28px" }}>
              <h2 style={{ fontSize: "15px", fontWeight: "700", color: "#1a1a6e", marginBottom: "10px" }}>{s.title}</h2>
              <p style={{ fontSize: "14px", color: "#444", lineHeight: "1.8", margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}