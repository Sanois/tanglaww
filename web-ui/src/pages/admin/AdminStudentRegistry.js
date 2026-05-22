import { ChevronDown, ChevronUp, MoreVertical, Search, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import { supabase } from "../../lib/supabase";

function StudentDetailModal({ student, onClose }) {
  const [open, setOpen] = useState({});
  const toggle = (key) => setOpen((o) => ({ ...o, [key]: !o[key] }));

  const Section = ({ title, fields }) => (
    <div style={{ border: "1px solid #ddd", borderRadius: "10px", marginBottom: "10px", overflow: "hidden" }}>
      <div onClick={() => toggle(title)} style={{ padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontWeight: "600", fontSize: "14px", color: "#1a1a2e" }}>
        {title}
        {open[title] ? <ChevronUp size={16} color="#aaa" /> : <ChevronDown size={16} color="#aaa" />}
      </div>
      {open[title] && (
        <div style={{ padding: "12px 20px 16px", borderTop: "1px solid #f0f0f0", display: "flex", flexDirection: "column", gap: "8px" }}>
          {fields.map(([label, value]) => (
            <div key={label} style={{ fontSize: "13px", color: "#555" }}>
              <strong style={{ color: "#1a1a2e" }}>{label}:</strong> {value || "—"}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const name = `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim().toUpperCase();

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, fontFamily: "Poppins, sans-serif" }}>
      <div style={{ backgroundColor: "#fff", borderRadius: "16px", width: "100%", maxWidth: "520px", maxHeight: "90vh", overflowY: "auto", padding: "32px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1a1a6e", margin: 0 }}>Student Profile</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={20} color="#aaa" />
          </button>
        </div>

        {/* Avatar + Name */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#e8eaf6", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", overflow: "hidden" }}>
            {student.profilephotourl
              ? <img src={student.profilephotourl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <User size={36} color="#aaa" />
            }
          </div>
          <div style={{ fontSize: "18px", fontWeight: "700", color: "#1a1a6e" }}>{name || "Unknown"}</div>
          <div style={{ fontSize: "13px", color: "#888" }}>{student.email}</div>
          <div style={{ fontSize: "12px", color: "#aaa", marginTop: "4px" }}>ID: {student.id}</div>
        </div>

        {/* Sections */}
        <Section title="Personal Information" fields={[
          ["First Name", student.firstName],
          ["Middle Name", student.middleName],
          ["Last Name", student.lastName],
          ["Email", student.email],
          ["Province", student.province],
        ]} />
        <Section title="Academic Information" fields={[
          ["Bachelor's Degree", student.bachelorsDegree],
          ["Majorship Taken", student.majorshipTaken],
          ["Last School Attended", student.lastSchoolAttended],
        ]} />
      </div>
    </div>
  );
}

export default function AdminStudentRegistry() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("student")
        .select("id, firstName, middleName, lastName, email, profilephotourl, bachelorsDegree, majorshipTaken, lastSchoolAttended, province")
        .order("firstName", { ascending: true });
      if (error) console.error(error.message);
      setStudents(data ?? []);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = students.filter((s) => {
    const name = `${s.firstName} ${s.lastName}`.toLowerCase();
    const q = query.toLowerCase();
    return name.includes(q) || s.email?.toLowerCase().includes(q);
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Poppins, sans-serif", backgroundColor: "#f5f6fa" }}>
      <AdminSidebar />
      <div style={{ marginLeft: "240px", flex: 1 }}>
        <AdminTopbar title="Student Registry" />
        <div style={{ padding: "32px 40px" }}>

          {/* Search */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#fff", borderRadius: "10px", padding: "10px 16px", border: "1px solid #eee", marginBottom: "24px", maxWidth: "480px" }}>
            <Search size={16} color="#aaa" />
            <input
              placeholder="Search by name or email address"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ border: "none", outline: "none", fontSize: "14px", fontFamily: "Poppins, sans-serif", flex: 1, color: "#333", backgroundColor: "transparent" }}
            />
          </div>

          {/* Count */}
          <p style={{ fontSize: "13px", color: "#888", marginBottom: "16px" }}>
            {filtered.length} student{filtered.length !== 1 ? "s" : ""} found
          </p>

          {/* List */}
          {loading ? (
            <p style={{ color: "#aaa" }}>Loading...</p>
          ) : (
            <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #eee", overflow: "hidden" }}>
              {filtered.length === 0 ? (
                <p style={{ padding: "32px", textAlign: "center", color: "#aaa", fontStyle: "italic" }}>No students found.</p>
              ) : (
                filtered.map((s, i) => (
                  <div
                    key={s.id}
                    onClick={() => setSelected(s)}
                    style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 20px", borderBottom: i < filtered.length - 1 ? "1px solid #f5f5f5" : "none", cursor: "pointer", transition: "background 0.15s" }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8f9ff"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#fff"}
                  >
                    {/* Avatar */}
                    <div style={{ width: "44px", height: "44px", borderRadius: "50%", backgroundColor: "#e8eaf6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                      {s.profilephotourl
                        ? <img src={s.profilephotourl} alt={s.firstName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <User size={20} color="#1a1a6e" />
                      }
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "14px", fontWeight: "700", color: "#1a1a6e" }}>{s.firstName} {s.lastName}</div>
                      <div style={{ fontSize: "12px", color: "#888" }}>{s.bachelorsDegree || "—"} • {s.email}</div>
                      <div style={{ fontSize: "11px", color: "#aaa" }}>ID: {s.id}</div>
                    </div>

                    <MoreVertical size={18} color="#aaa" />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {selected && <StudentDetailModal student={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}