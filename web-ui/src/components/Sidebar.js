import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/dashboardlogo.png";

const navItems = [
  { label: "Home", path: "/dashboard" },
  { label: "Courses", path: "/dashboard/courses" },
  { label: "Calendar", path: "/dashboard/calendar" },
  { label: "Profile", path: "/dashboard/profile" },
];

const bottomItems = [
  { label: "Settings", path: "/dashboard/settings" },
  { label: "Help", path: "/dashboard/help" },
  { label: "About", path: "/dashboard/about" },
  { label: "Terms & Policies", path: "/dashboard/terms" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="sidebar">
      <img src={logo} alt="Tanglaw" className="sidebar-logo" />
      <span className="sidebar-section-label">Overview</span>
      {navItems.map((item) => (
        <div
          key={item.path}
          className={`sidebar-link ${location.pathname === item.path ? "active" : ""}`}
          onClick={() => navigate(item.path)}
        >
          {item.label}
        </div>
      ))}
      <div className="sidebar-bottom">
        {bottomItems.map((item) => (
          <div
            key={item.path}
            className={`sidebar-link ${location.pathname === item.path ? "active" : ""}`}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </div>
        ))}
        <div className="sidebar-link signout" onClick={() => navigate("/signin")}>
          Sign Out
        </div>
      </div>
    </aside>
  );
}