import { Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import { supabase } from "../../lib/supabase";
import "../Dashboard.css";

export default function AdminHandouts() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminId, setAdminId] = useState(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setAdminId(user.id);

      const { data: courseData } = await supabase
        .from("course").select("*").eq("course_id", courseId).maybeSingle();
      setCourse(courseData);

      const { data: moduleData } = await supabase
        .from("module").select("*").eq("course_id", courseId).order("module_id");
      setModules(moduleData ?? []);
      if (moduleData && moduleData.length > 0) setSelectedModule(moduleData[0]);
      setLoading(false);
    };
    init();
  }, [courseId]);

  useEffect(() => {
    if (selectedModule) fetchMaterials();
  }, [selectedModule]);

  const fetchMaterials = async () => {
    const { data } = await supabase
      .from("learning_material").select("*")
      .eq("module_id", selectedModule.module_id)
      .eq("materialType", "handout")
      .order("uploadedAt", { ascending: false });
    setMaterials(data ?? []);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedModule || !adminId) return;
    setUploading(true);
    const ext = file.name.split(".").pop().toLowerCase();
    const storagePath = `module_${selectedModule.module_id}/${Date.now()}_${file.name}`;
    const { error: storageError } = await supabase.storage
      .from("learning-materials")
      .upload(storagePath, file, { contentType: file.type, upsert: false });
    if (storageError) { alert("Upload error: " + storageError.message); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("learning-materials").getPublicUrl(storagePath);
    const { error: dbError } = await supabase.from("learning_material").insert({
      title: file.name, fileType: ext, fileUrl: urlData.publicUrl,
      storagePath, isDownloadable: true, fileSize: file.size,
      materialType: "handout", module_id: selectedModule.module_id,
      admin_id: adminId, uploadedAt: new Date().toISOString(),
    });
    if (dbError) { alert("DB error: " + dbError.message); setUploading(false); return; }
    setUploading(false);
    fetchMaterials();
  };

  const handleDelete = async (material) => {
    if (!window.confirm("Delete this handout?")) return;
    if (material.storagePath) {
      await supabase.storage.from("learning-materials").remove([material.storagePath]);
    }
    await supabase.from("learning_material").delete().eq("material_id", material.material_id);
    fetchMaterials();
  };

  const formatDate = (str) => new Date(str).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const formatSize = (bytes) => bytes ? (bytes / 1024).toFixed(1) + " KB" : "";

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Poppins, sans-serif", backgroundColor: "#f5f6fa" }}>
      <AdminSidebar />
      <div style={{ marginLeft: "240px", flex: 1 }}>
        <AdminTopbar title="Handouts" />

        <div style={{ padding: "32px 40px" }}>

          {/* Back + Course name */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
            <button onClick={() => navigate("/admin/courses")} style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: "20px", color: "#1a1a6e", fontWeight: "700", padding: 0,
            }}>&#8592;</button>
            <div>
              <div style={{ fontSize: "18px", fontWeight: "700", color: "#1a1a2e" }}>{course?.courseName}</div>
              <div style={{ fontSize: "13px", color: "#888" }}>Handouts</div>
            </div>
          </div>

          {/* Module Selector */}
          {modules.length > 0 && (
            <div style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "20px 24px", marginBottom: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#aaa", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Module</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {modules.map((m) => (
                  <div key={m.module_id} onClick={() => setSelectedModule(m)} style={{
                    padding: "8px 16px", borderRadius: "20px", cursor: "pointer", fontSize: "13px", fontWeight: "600",
                    backgroundColor: selectedModule?.module_id === m.module_id ? "#f5a623" : "#f0f0f0",
                    color: selectedModule?.module_id === m.module_id ? "#fff" : "#555",
                    transition: "all 0.15s",
                  }}>
                    {m.moduleName}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload button */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              backgroundColor: "#f5a623", color: "#1a1a2e",
              padding: "12px 24px", borderRadius: "10px",
              fontSize: "14px", fontWeight: "700", cursor: "pointer",
            }}>
              <Upload size={16} />
              {uploading ? "Uploading..." : "Upload Handout"}
              <input type="file" accept=".pdf,.doc,.docx" onChange={handleUpload} style={{ display: "none" }} />
            </label>
          </div>

          {/* Handouts list */}
          {loading ? (
            <p style={{ color: "#aaa" }}>Loading...</p>
          ) : materials.length === 0 ? (
            <p style={{ color: "#aaa", fontStyle: "italic" }}>No handouts yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {materials.map((m) => (
                <div key={m.material_id} style={{
                  backgroundColor: "#fff", borderRadius: "12px", padding: "16px 20px",
                  border: "1px solid #eee", display: "flex", alignItems: "center", gap: "14px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}>
                  <div style={{
                    width: "48px", height: "48px", borderRadius: "10px",
                    backgroundColor: "#fff3e0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <span style={{ fontSize: "14px", fontWeight: "700", color: "#f5a623" }}>PDF</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#1a1a2e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.title}</div>
                    <div style={{ fontSize: "11px", color: "#aaa", marginTop: "2px" }}>
                      {m.fileSize ? formatSize(m.fileSize) + " · " : ""}{formatDate(m.uploadedAt)}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                    <a href={m.fileUrl} target="_blank" rel="noreferrer" style={{
                      padding: "7px 14px", borderRadius: "8px",
                      border: "1px solid #f5a623", color: "#f5a623",
                      fontSize: "12px", fontWeight: "600", textDecoration: "none",
                    }}>View</a>
                    <a href={m.fileUrl} download style={{
                      padding: "7px 14px", borderRadius: "8px",
                      border: "1px solid #f5a623", color: "#f5a623",
                      fontSize: "12px", fontWeight: "600", textDecoration: "none",
                    }}>Download</a>
                    <button onClick={() => handleDelete(m)} style={{
                      padding: "7px 10px", borderRadius: "8px",
                      border: "1px solid #ffcdd2", backgroundColor: "#fff",
                      cursor: "pointer", display: "flex", alignItems: "center",
                    }}>
                      <Trash2 size={14} color="#e53935" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}