import { ChevronLeft, Play, Plus, Search, Trash2, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NotificationBell from "../components/NotificationBell";
import Sidebar from "../components/Sidebar";
import AdminSidebar from "../components/admin/AdminSidebar";
import { supabase } from "../lib/supabase";
import "./Dashboard.css";

function YouTubeEmbed({ youtubeId }) {
  return (
    <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: "10px", overflow: "hidden" }}>
      <iframe
        src={`https://www.youtube.com/embed/${youtubeId}`}
        title="YouTube video"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
      />
    </div>
  );
}

function extractYoutubeId(url) {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export default function CourseDetail({ isAdmin = false }) {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [activeTab, setActiveTab] = useState("handouts");
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState(null);
  const [showAddSession, setShowAddSession] = useState(false);
  const [newSession, setNewSession] = useState({ title: "", url: "" });
  const [uploading, setUploading] = useState(false);
  const [adminId, setAdminId] = useState(null);
  const [playingId, setPlayingId] = useState(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setAdminId(user.id);

      const { data: courseData } = await supabase
        .from("course")
        .select("*")
        .eq("course_id", courseId)
        .maybeSingle();
      setCourse(courseData);

      const { data: moduleData } = await supabase
        .from("module")
        .select("*")
        .eq("course_id", courseId)
        .order("module_id");
      setModules(moduleData ?? []);
      if (moduleData && moduleData.length > 0) {
        setSelectedModule(moduleData[0]);
      }
      setLoading(false);
    };
    init();
  }, [courseId]);

  useEffect(() => {
    if (!selectedModule) return;
    fetchMaterials();
  }, [selectedModule, activeTab]);

  const fetchMaterials = async () => {
    if (!selectedModule) return;
    const { data } = await supabase
      .from("learning_material")
      .select("*")
      .eq("module_id", selectedModule.module_id)
      .eq("materialType", activeTab === "handouts" ? "handout" : "recorded_session")
      .order("uploadedAt", { ascending: false });
    setMaterials(data ?? []);
  };

  const handleUploadHandout = async (e) => {
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
      title: file.name,
      fileType: ext,
      fileUrl: urlData.publicUrl,
      storagePath,
      isDownloadable: true,
      fileSize: file.size,
      materialType: "handout",
      module_id: selectedModule.module_id,
      admin_id: adminId,
      uploadedAt: new Date().toISOString(),
    });
    if (dbError) { alert("DB error: " + dbError.message); setUploading(false); return; }
    setUploading(false);
    fetchMaterials();
  };

  const handleAddSession = async () => {
    if (!newSession.title || !newSession.url || !selectedModule || !adminId) return;
    const youtubeId = extractYoutubeId(newSession.url);
    if (!youtubeId) { alert("Invalid YouTube URL"); return; }
    const { error } = await supabase.from("learning_material").insert({
      title: newSession.title,
      fileType: "youtube",
      fileUrl: newSession.url,
      youtubeId,
      storagePath: null,
      isDownloadable: false,
      fileSize: null,
      materialType: "recorded_session",
      module_id: selectedModule.module_id,
      admin_id: adminId,
      uploadedAt: new Date().toISOString(),
    });
    if (error) { alert("Error: " + error.message); return; }
    setNewSession({ title: "", url: "" });
    setShowAddSession(false);
    fetchMaterials();
  };

  const handleDelete = async (material) => {
    if (!window.confirm("Delete this item?")) return;
    if (material.storagePath) {
      await supabase.storage.from("learning-materials").remove([material.storagePath]);
    }
    await supabase.from("learning_material").delete().eq("material_id", material.material_id);
    fetchMaterials();
  };

  const formatDate = (str) => new Date(str).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const formatSize = (bytes) => bytes ? (bytes / 1024).toFixed(1) + " KB" : "";

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: "8px",
    border: "1px solid #ddd", fontSize: "14px",
    fontFamily: "Poppins, sans-serif", boxSizing: "border-box", outline: "none",
  };

  const backPath = isAdmin ? "/admin/courses" : "/dashboard/courses";

  if (loading) return (
    <div className="dashboard-layout">
      {isAdmin ? <AdminSidebar /> : <Sidebar />}
      <div className="dashboard-main" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#aaa" }}>Loading...</p>
      </div>
    </div>
  );

  return (
    <div className="dashboard-layout">
      {isAdmin ? <AdminSidebar /> : <Sidebar />}
      <div className="dashboard-main">

        {/* Topbar */}
        <div className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button onClick={() => navigate(backPath)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}>
              <ChevronLeft size={22} color="#1a1a6e" />
            </button>
            <div className="topbar-search">
              <Search size={16} color="#aaa" />
              <input placeholder="Enter search terms" />
            </div>
          </div>
          <div className="topbar-right">
            <NotificationBell />
          </div>
        </div>

        <div style={{ padding: "28px 32px" }}>

          {/* Course Header */}
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#1a1a6e", margin: 0 }}>
              {course?.courseName}
            </h2>
            <p style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>{course?.instructor}</p>
          </div>

          <div style={{ display: "flex", gap: "24px" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* Module Selector */}
              {modules.length > 0 && (
                <div className="card">
                  <div className="card-title">Modules</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {modules.map((m) => (
                      <div key={m.module_id} onClick={() => setSelectedModule(m)} style={{
                        padding: "10px 16px", borderRadius: "8px", cursor: "pointer",
                        backgroundColor: selectedModule?.module_id === m.module_id ? "#f0f3ff" : "#f9f9f9",
                        borderLeft: selectedModule?.module_id === m.module_id ? "3px solid #1a1a6e" : "3px solid transparent",
                        fontSize: "14px", fontWeight: selectedModule?.module_id === m.module_id ? "600" : "400",
                        color: selectedModule?.module_id === m.module_id ? "#1a1a6e" : "#555",
                      }}>
                        {m.moduleName}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tabs */}
              <div style={{ display: "flex", backgroundColor: "#1a1a6e", borderRadius: "10px", overflow: "hidden" }}>
                {["handouts", "sessions"].map((tab) => (
                  <div key={tab} onClick={() => setActiveTab(tab)} style={{
                    flex: 1, textAlign: "center", padding: "12px",
                    fontSize: "13px", fontWeight: "600", cursor: "pointer",
                    color: activeTab === tab ? "#1a1a6e" : "#fff",
                    backgroundColor: activeTab === tab ? "#fff" : "transparent",
                    borderRadius: activeTab === tab ? "8px" : "0",
                    margin: activeTab === tab ? "4px" : "0",
                  }}>
                    {tab === "handouts" ? "Handouts" : "Recorded Sessions"}
                  </div>
                ))}
              </div>

              {/* Materials List */}
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div className="card-title" style={{ margin: 0 }}>
                    {activeTab === "handouts" ? "Handouts" : "Recorded Sessions"}
                  </div>

                  {/* Upload / Add — admin only */}
                  {isAdmin && (
                    activeTab === "handouts" ? (
                      <label style={{
                        display: "flex", alignItems: "center", gap: "6px",
                        backgroundColor: "#1a1a6e", color: "#fff",
                        padding: "8px 16px", borderRadius: "8px",
                        fontSize: "13px", fontWeight: "600", cursor: "pointer",
                      }}>
                        <Upload size={14} />
                        {uploading ? "Uploading..." : "Upload Handout"}
                        <input type="file" accept=".pdf,.doc,.docx" onChange={handleUploadHandout} style={{ display: "none" }} />
                      </label>
                    ) : (
                      <button onClick={() => setShowAddSession(true)} style={{
                        display: "flex", alignItems: "center", gap: "6px",
                        backgroundColor: "#1a1a6e", color: "#fff",
                        padding: "8px 16px", borderRadius: "8px",
                        fontSize: "13px", fontWeight: "600", cursor: "pointer",
                        border: "none", fontFamily: "Poppins, sans-serif",
                      }}>
                        <Plus size={14} /> Add Session
                      </button>
                    )
                  )}
                </div>

                {materials.length === 0 ? (
                  <p style={{ color: "#aaa", fontStyle: "italic", textAlign: "center" }}>
                    No {activeTab === "handouts" ? "handouts" : "recorded sessions"} yet.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {materials.map((m) => (
                      <div key={m.material_id}>
                        {activeTab === "sessions" && m.youtubeId && playingId === m.material_id && (
                          <div style={{ marginBottom: "12px" }}>
                            <YouTubeEmbed youtubeId={m.youtubeId} />
                          </div>
                        )}

                        <div style={{
                          display: "flex", alignItems: "center", gap: "12px",
                          padding: "14px 16px", border: "1px solid #eee",
                          borderRadius: "10px", backgroundColor: "#fafafa",
                        }}>
                          <div style={{
                            width: "44px", height: "44px", borderRadius: "8px",
                            backgroundColor: activeTab === "handouts" ? "#ffebee" : "#e8eaf6",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                          }}>
                            {activeTab === "handouts"
                              ? <span style={{ fontSize: "18px", fontWeight: "700", color: "#e53935" }}>PDF</span>
                              : <Play size={20} color="#1a1a6e" fill="#1a1a6e" />
                            }
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "14px", fontWeight: "600", color: "#1a1a2e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {m.title}
                            </div>
                            <div style={{ fontSize: "11px", color: "#aaa", marginTop: "2px" }}>
                              {m.fileSize ? formatSize(m.fileSize) + " · " : ""}{formatDate(m.uploadedAt)}
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                            {activeTab === "handouts" && (
                              <>
                                <a href={m.fileUrl} target="_blank" rel="noreferrer" style={{
                                  padding: "6px 12px", borderRadius: "6px",
                                  border: "1px solid #1a1a6e", color: "#1a1a6e",
                                  fontSize: "12px", fontWeight: "600", textDecoration: "none",
                                }}>View</a>
                                {m.isDownloadable && (
                                  <a href={m.fileUrl} download style={{
                                    padding: "6px 12px", borderRadius: "6px",
                                    border: "1px solid #1a1a6e", color: "#1a1a6e",
                                    fontSize: "12px", fontWeight: "600", textDecoration: "none",
                                  }}>Download</a>
                                )}
                              </>
                            )}
                            {activeTab === "sessions" && (
                              <>
                                <button onClick={() => setPlayingId(playingId === m.material_id ? null : m.material_id)} style={{
                                  padding: "6px 12px", borderRadius: "6px",
                                  border: "1px solid #1a1a6e", color: "#1a1a6e",
                                  fontSize: "12px", fontWeight: "600", cursor: "pointer",
                                  backgroundColor: "#fff", fontFamily: "Poppins, sans-serif",
                                }}>
                                  {playingId === m.material_id ? "Close" : "Play"}
                                </button>
                                <a href={m.fileUrl} target="_blank" rel="noreferrer" style={{
                                  padding: "6px 12px", borderRadius: "6px",
                                  border: "1px solid #1a1a6e", color: "#1a1a6e",
                                  fontSize: "12px", fontWeight: "600", textDecoration: "none",
                                }}>YouTube</a>
                              </>
                            )}
                            {isAdmin && (
                              <button onClick={() => handleDelete(m)} style={{
                                padding: "6px 10px", borderRadius: "6px",
                                border: "1px solid #ffcdd2", backgroundColor: "#fff",
                                cursor: "pointer", display: "flex", alignItems: "center",
                              }}>
                                <Trash2 size={14} color="#e53935" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Session Modal */}
      {showAddSession && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
          <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "32px", width: "440px", fontFamily: "Poppins, sans-serif" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#1a1a2e", margin: 0 }}>Add Session</h3>
              <button onClick={() => setShowAddSession(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={18} color="#aaa" /></button>
            </div>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#222", display: "block", marginBottom: "4px" }}>Title*</label>
              <input value={newSession.title} onChange={(e) => setNewSession({ ...newSession, title: e.target.value })} style={inputStyle} placeholder="Session title" />
            </div>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#222", display: "block", marginBottom: "4px" }}>YouTube URL*</label>
              <input value={newSession.url} onChange={(e) => setNewSession({ ...newSession, url: e.target.value })} style={inputStyle} placeholder="https://youtu.be/..." />
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <button onClick={() => setShowAddSession(false)} style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #ddd", backgroundColor: "#fff", fontSize: "14px", cursor: "pointer", fontFamily: "Poppins, sans-serif" }}>Cancel</button>
              <button onClick={handleAddSession} style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "none", backgroundColor: "#1a1a6e", color: "#fff", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "Poppins, sans-serif" }}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 