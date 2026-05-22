import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { supabase } from "../../lib/supabase";

export default function AdminSignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: "8px",
    border: "1px solid #ccc", fontSize: "14px",
    fontFamily: "Poppins, sans-serif", boxSizing: "border-box",
    marginTop: "4px", outline: "none",
  };

  const labelStyle = {
    fontSize: "13px", fontWeight: "600", color: "#222",
    marginTop: "16px", display: "block",
  };

const handleSignIn = async () => {
    const newErrors = [];
    if (!email.trim()) newErrors.push("Email is required.");
    if (!password.trim()) newErrors.push("Password is required.");
    if (newErrors.length > 0) { setErrors(newErrors); return; }

    setErrors([]);
    setLoading(true);

    try {
      console.log("STEP 1: attempting sign in...");

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      console.log("STEP 2: auth result", { data, error });

      if (error) {
        setErrors(["Invalid email or password."]);
        setLoading(false);
        return;
      }

      const { data: adminRow } = await supabase
        .from("admin")
        .select("admin_id")
        .eq("admin_id", data.user.id)
        .maybeSingle();

      console.log("STEP 3: adminRow", adminRow);

      if (!adminRow) {
        await supabase.auth.signOut();
        setErrors(["Access denied. This account is not an administrator."]);
        setLoading(false);
        return;
      }

      console.log("STEP 4: navigating...");
      navigate("/admin/dashboard");
    } catch (err) {
      console.log("CAUGHT ERROR:", err);
      setErrors([err.message ?? "Something went wrong."]);
      setLoading(false);
    }
  };    

  return (
    <div style={{ fontFamily: "Poppins, sans-serif", minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <Navbar />
      <div style={{ maxWidth: "480px", margin: "60px auto", backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", padding: "48px 40px" }}>

        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ display: "inline-block", backgroundColor: "#fff8e1", color: "#f5a623", fontWeight: "700", fontSize: "12px", padding: "4px 14px", borderRadius: "20px", border: "1px solid #f5a623", marginBottom: "12px" }}>
            ADMIN PORTAL
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#1a1a6e", marginBottom: "6px" }}>Sign in</h1>
          <p style={{ fontSize: "13px", color: "#888" }}>Authorized administrators only.</p>
          <p style={{ fontSize: "16px", fontWeight: "600", color: "#222", marginTop: "16px" }}>Welcome Back, Admin!</p>
        </div>

        {errors.length > 0 && (
          <div style={{ backgroundColor: "#fff5f5", border: "1px solid #e53935", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px" }}>
            {errors.map((e, i) => <p key={i} style={{ color: "#c0392b", fontSize: "13px", margin: "2px 0" }}>• {e}</p>)}
          </div>
        )}

        <div>
          <span style={labelStyle}>Email Address:</span>
          <input
            style={inputStyle}
            placeholder="Admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div style={{ marginTop: "4px" }}>
          <span style={labelStyle}>Password:</span>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              style={{ ...inputStyle, paddingRight: "40px" }}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
            />
            <span onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", fontSize: "16px", color: "#888" }}>
              {showPassword ? "🙈" : "👁"}
            </span>
          </div>
        </div>

        <div style={{ textAlign: "right", marginTop: "6px" }}>
          <span style={{ fontSize: "12px", color: "#1a1a6e", cursor: "pointer", fontWeight: "600" }}>Forgot Password?</span>
        </div>

        <button
          onClick={handleSignIn}
          disabled={loading}
          style={{ width: "100%", padding: "14px", backgroundColor: "#f5a623", color: "#1a1a2e", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer", fontFamily: "Poppins, sans-serif", marginTop: "24px", opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Signing in..." : "Sign In as Admin"}
        </button>

        <div style={{ textAlign: "center", marginTop: "28px", fontSize: "12px", color: "#888" }}>
          Not an admin?{" "}
          <span onClick={() => navigate("/signin")} style={{ color: "#1a1a6e", fontWeight: "700", cursor: "pointer" }}>Student Sign-in</span>
        </div>
      </div>
    </div>
  );
}