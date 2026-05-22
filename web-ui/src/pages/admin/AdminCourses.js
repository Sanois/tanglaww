import { CheckCircle, ChevronDown, ChevronUp, FileText, Image, Lightbulb, Link, Lock, PlusCircle, Users, Video, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import finalCoaching from "../../assets/images/final-coaching.jpg";
import integrative from "../../assets/images/integrative.jpg";
import letAdvanced from "../../assets/images/let-advanced.jpg";
import letExpress from "../../assets/images/let-express.jpg";
import letOnBoarding from "../../assets/images/let-on-boarding.jpg";
import testHighlights from "../../assets/images/test-highlights.jpg";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import { supabase } from "../../lib/supabase";

const courseImages = {
  1: letOnBoarding,
  2: letExpress,
  3: letAdvanced,
  4: integrative,
  5: finalCoaching,
  6: testHighlights,
};

const SECTIONS = [
  { label: "Handouts", icon: <FileText size={16} color="#1a1a6e" />, path: "handouts" },
  { label: "Recorded Sessions", icon: <Video size={16} color="#1a1a6e" />, path: "recorded-sessions" },
  { label: "Quiz", icon: <Lightbulb size={16} color="#1a1a6e" />, path: "quiz" },
  { label: "Online Session Link", icon: <Link size={16} color="#1a1a6e" />, path: "online-session" },
];

export default function AdminCourses() {
    const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [courseAccess, setCourseAccess] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [modal, setModal] = useState(null); // { course, type: "unlock"|"lock" }
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);

    const [{ data: courseData }, { data: studentData }, { data: accessData }] = await Promise.all([
      supabase.from("course").select("course_id, courseName, instructor"),
      supabase.from("student").select("id, firstName, lastName, email"),
      supabase.from("course_access").select("student_id, course_id"),
    ]);

    setCourses(courseData ?? []);
    setStudents(studentData ?? []);
    setCourseAccess(accessData ?? []);
    setLoading(false);
  };

  const hasAccess = (studentId, courseId) =>
    courseAccess.some((a) => a.student_id === studentId && a.course_id === courseId);

  const unlockForStudent = async (studentId, courseId) => {
    setActionLoading(true);
    await supabase.from("course_access").upsert(
      { student_id: studentId, course_id: courseId },
      { onConflict: "student_id,course_id", ignoreDuplicates: true }
    );
    await fetchAll();
    setActionLoading(false);
  };

  const lockForStudent = async (studentId, courseId) => {
    setActionLoading(true);
    await supabase.from("course_access").delete()
      .eq("student_id", studentId).eq("course_id", courseId);
    await fetchAll();
    setActionLoading(false);
  };

  const unlockForAll = async (courseId) => {
    setActionLoading(true);
    const rows = students.map((s) => ({ student_id: s.id, course_id: courseId }));
    await supabase.from("course_access").upsert(rows, { onConflict: "student_id,course_id", ignoreDuplicates: true });
    await fetchAll();
    setActionLoading(false);
  };

  const lockForAll = async (courseId) => {
    setActionLoading(true);
    await supabase.from("course_access").delete().eq("course_id", courseId);
    await fetchAll();
    setActionLoading(false);
  };

  const toggleExpand = (id) => setExpanded((e) => ({ ...e, [id]: !e[id] }));

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Poppins, sans-serif", backgroundColor: "#f5f6fa" }}>
      <AdminSidebar />
      <div style={{ marginLeft: "240px", flex: 1 }}>
        <AdminTopbar title="Courses" />
        <div style={{ padding: "32px 40px", display: "flex", flexDirection: "column", gap: "16px" }}>

          {loading ? (
            <p style={{ color: "#aaa" }}>Loading...</p>
          ) : (
            courses.map((course) => (
              <div key={course.course_id} style={{ backgroundColor: "#fff", borderRadius: "12px", overflow: "hidden", border: "1px solid #eee", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>

                {/* Thumbnail */}
                <div style={{ backgroundColor: "#f0f0f0", height: "180px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                  {courseImages[course.course_id] ? (
                    <img src={courseImages[course.course_id]} alt={course.courseName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <Image size={32} color="#bbb" />
                  )}
                </div>

                {/* Course row */}
                <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: "700", color: "#1a1a2e" }}>{course.courseName}</div>
                    <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>{course.instructor ?? "—"}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {/* Green unlock button */}
                    <button
                      onClick={() => setModal({ course, type: "unlock" })}
                      style={{ width: "36px", height: "36px", borderRadius: "8px", border: "2px solid #4caf50", backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                    >
                      <Lock size={16} color="#4caf50" />
                    </button>
                    {/* Red lock button */}
                    <button
                      onClick={() => setModal({ course, type: "lock" })}
                      style={{ width: "36px", height: "36px", borderRadius: "8px", border: "2px solid #e53935", backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                    >
                      <Lock size={16} color="#e53935" />
                    </button>
                    {/* Expand */}
                    <button onClick={() => toggleExpand(course.course_id)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                      {expanded[course.course_id] ? <ChevronUp size={20} color="#1a1a6e" /> : <ChevronDown size={20} color="#1a1a6e" />}
                    </button>
                  </div>
                </div>

                {/* Expanded sections */}
                {expanded[course.course_id] && (
                  <div style={{ backgroundColor: "#f8f9ff", borderTop: "1px solid #eee" }}>
                   {SECTIONS.map((s, i) => (
  <div key={i} onClick={() => navigate(`/admin/courses/${course.course_id}/${s.path}`)} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 24px", borderBottom: i < SECTIONS.length - 1 ? "1px solid #eee" : "none", cursor: "pointer" }}>
    {s.icon}
    <span style={{ fontSize: "14px", color: "#1a1a6e", fontWeight: "500", textDecoration: "underline" }}>{s.label}</span>
  </div>
))}
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 24px", cursor: "pointer" }}>
                      <PlusCircle size={16} color="#aaa" />
                      <span style={{ fontSize: "14px", color: "#aaa" }}>Add new section</span>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 999 }}>
          <div style={{ backgroundColor: "#fff", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: "600px", padding: "32px", maxHeight: "80vh", overflowY: "auto", fontFamily: "Poppins, sans-serif" }}>

            {/* Modal header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: "700", color: modal.type === "unlock" ? "#4caf50" : "#e53935", margin: "0 0 4px" }}>
                  {modal.type === "unlock" ? "Unlock Course" : "Lock Course"}
                </h2>
                <p style={{ fontSize: "13px", color: "#888", margin: 0 }}>{modal.course.courseName}</p>
              </div>
              <button onClick={() => setModal(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} color="#aaa" />
              </button>
            </div>

            {/* For all button */}
            <button
              onClick={() => modal.type === "unlock" ? unlockForAll(modal.course.course_id) : lockForAll(modal.course.course_id)}
              disabled={actionLoading}
              style={{
                width: "100%", padding: "14px", borderRadius: "10px", border: "none",
                backgroundColor: modal.type === "unlock" ? "#4caf50" : "#e53935",
                color: "#fff", fontSize: "15px", fontWeight: "700",
                cursor: "pointer", fontFamily: "Poppins, sans-serif",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                marginBottom: "20px", opacity: actionLoading ? 0.7 : 1,
              }}
            >
              <Users size={18} />
              {modal.type === "unlock" ? "Unlock for All Students" : "Lock for All Students"}
            </button>

            <p style={{ textAlign: "center", fontSize: "12px", color: "#aaa", marginBottom: "16px" }}>— or manage individually —</p>

            {/* Student list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {students.map((s) => {
                const unlocked = hasAccess(s.id, modal.course.course_id);
                return (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#1a1a2e" }}>{s.firstName} {s.lastName}</div>
                      <div style={{ fontSize: "12px", color: "#888" }}>{s.email}</div>
                    </div>
                    {modal.type === "unlock" ? (
                      unlocked ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#4caf50", fontSize: "13px", fontWeight: "600" }}>
                          <CheckCircle size={16} /> Unlocked
                        </div>
                      ) : (
                        <button
                          onClick={() => unlockForStudent(s.id, modal.course.course_id)}
                          disabled={actionLoading}
                          style={{ padding: "8px 20px", borderRadius: "8px", border: "none", backgroundColor: "#4caf50", color: "#fff", fontWeight: "600", fontSize: "13px", cursor: "pointer", fontFamily: "Poppins, sans-serif" }}
                        >
                          Unlock
                        </button>
                      )
                    ) : (
                      unlocked ? (
                        <button
                          onClick={() => lockForStudent(s.id, modal.course.course_id)}
                          disabled={actionLoading}
                          style={{ padding: "8px 20px", borderRadius: "8px", border: "none", backgroundColor: "#e53935", color: "#fff", fontWeight: "600", fontSize: "13px", cursor: "pointer", fontFamily: "Poppins, sans-serif" }}
                        >
                          Lock
                        </button>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#e53935", fontSize: "13px", fontWeight: "600" }}>
                          <Lock size={16} /> Locked
                        </div>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}