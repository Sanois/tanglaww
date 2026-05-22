import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  return (
    <nav className="navbar">
      <img src={logo} alt="Tanglaw Logo" className="nav-logo" onClick={() => navigate("/")} />
      <ul className="nav-links">
        <NavLink to="/" className="nav-link">Home</NavLink>
        <NavLink to="/our-courses" className="nav-link">Our Courses</NavLink>
        <NavLink to="/about-us" className="nav-link">About Us</NavLink>
        <NavLink to="/helpdesk" className="nav-link">Helpdesk</NavLink>
      </ul>
      <button className="btn-signin" onClick={() => navigate("/signin")}>Sign-in</button>
    </nav>
  );
}