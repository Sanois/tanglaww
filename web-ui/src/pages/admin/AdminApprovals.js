import { ChevronDown, ChevronUp, Key, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import { supabase } from "../../lib/supabase";

// Proof of payment expandable
function ProofOfPaymentSection({ url }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: "10px", marginBottom: "10px", overflow: "hidden" }}>
      <div
        onClick={() => setOpen(!open)}
        style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontWeight: "600", fontSize: "14px", color: "#1a1a2e" }}
      >
        Proof of Payment
        {open ? <ChevronUp size={16} color="#aaa" /> : <ChevronDown size={16} color="#aaa" />}
      </div>
      {open && (
        <div style={{ padding: "12px 20px 16px", borderTop: "1px solid #f0f0f0" }}>
          {url ? (
            url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
              <img src={url} alt="Proof of Payment" style={{ width: "100%", borderRadius: "8px", objectFit: "contain", maxHeight: "300px" }} />
            ) : (
              <a href={url} target="_blank" rel="noreferrer" style={{ color: "#1a1a6e", fontWeight: "600", fontSize: "14px" }}>
                📄 View Document
              </a>
            )
          ) : (
            <p style={{ fontSize: "13px", color: "#aaa" }}>No proof of payment uploaded.</p>
          )}
        </div>
      )}
    </div>
  );
}
// Dropdown section for student detail modal
function DetailSection({ title, fields }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: "10px", marginBottom: "10px", overflow: "hidden" }}>
      <div
        onClick={() => setOpen(!open)}
        style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontWeight: "600", fontSize: "14px", color: "#1a1a2e" }}
      >
        {title}
        {open ? <ChevronUp size={16} color="#aaa" /> : <ChevronDown size={16} color="#aaa" />}
      </div>
      {open && (
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
}

// Student detail modal
function StudentDetailModal({ enrollment, onClose }) {
const [showActivatedPopup, setShowActivatedPopup] = useState(false);

  const s = enrollment.student;
  const name = `${s?.firstName ?? ""} ${s?.lastName ?? ""}`.trim().toUpperCase();
  const curriculum = enrollment.curriculum?.curriculumName ?? "—";
  const specialization = enrollment.specialization?.specializationName ?? "—";
  const takerType = enrollment.type_of_taker?.typeOfTaker ?? "—";
  const promo = enrollment.promo?.promo ?? "None";
 const payment = Array.isArray(enrollment.paymentDetails) 
    ? enrollment.paymentDetails[0] 
    : enrollment.paymentDetails;
  console.log("payment data:", payment);
  const channel = payment?.payment_channel?.paymentChannelName ?? "—";



  const fetchCode = async () => {
    setShowActivatedPopup(true);
  };

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, fontFamily: "Poppins, sans-serif" }}>
      <div style={{ backgroundColor: "#fff", borderRadius: "16px", width: "100%", maxWidth: "560px", maxHeight: "90vh", overflowY: "auto", padding: "32px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1a1a6e", margin: 0 }}>Approved</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={20} color="#aaa" />
          </button>
        </div>

        {/* Avatar + Name */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#e8eaf6", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", overflow: "hidden" }}>
            {s?.profilephotourl
              ? <img src={s.profilephotourl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <User size={36} color="#aaa" />
            }
          </div>
          <div style={{ fontSize: "18px", fontWeight: "700", color: "#1a1a6e" }}>{name || "Unknown"}</div>
          <div style={{ fontSize: "13px", color: "#888", fontStyle: "italic" }}>{curriculum}</div>
        </div>

        {/* Registrant Information */}
        <div style={{ fontSize: "14px", fontWeight: "700", color: "#1a1a6e", marginBottom: "12px" }}>Registrant Information:</div>

        <DetailSection title="Program & Curriculum" fields={[
          ["Curriculum", curriculum],
          ["Specialization", specialization],
          ["Type of Taker", takerType],
        ]} />

      <DetailSection title="Personal Information" fields={[
          ["First Name", s?.firstName],
          ["Middle Name", s?.middleName],
          ["Last Name", s?.lastName],
          ["Email", s?.email],
          ["Bachelor's Degree", s?.bachelorsDegree],
          ["Majorship Taken", s?.majorshipTaken],
          ["Last School Attended", s?.lastSchoolAttended],
          ["Province", s?.province],
        ]} />

        <DetailSection title="Promotions & Verification" fields={[
          ["Promo Code", promo],
          ["Verification Status", enrollment.verification?.verificationStatus ? "Approved" : "Pending"],
          ["Notes", enrollment.verification?.verificationNotes],
        ]} />

        <DetailSection title="Payment Information" fields={[
          ["Reference Number", payment?.referenceNumber],
          ["Payment Channel", channel],
        ]} />

      {/* Documents */}
        <div style={{ fontSize: "14px", fontWeight: "700", color: "#1a1a6e", margin: "20px 0 12px" }}>Documents:</div>
        <ProofOfPaymentSection url={payment?.proofOfPaymentUrl} />

       {/* View Activation Code */}
        <button
          onClick={fetchCode}
          style={{ width: "100%", padding: "14px", borderRadius: "10px", border: "2px solid #1a1a6e", backgroundColor: "#fff", color: "#1a1a6e", fontSize: "14px", fontWeight: "700", cursor: "pointer", fontFamily: "Poppins, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
        >
          <Key size={16} /> View Activation Code
        </button>

        {/* Account Activated Popup */}
        {showActivatedPopup && (
          <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ backgroundColor: "#333", borderRadius: "16px", padding: "32px 24px", width: "300px", textAlign: "center" }}>
              <div style={{ fontSize: "18px", fontWeight: "700", color: "#fff", marginBottom: "12px" }}>Account Activated</div>
              <div style={{ fontSize: "14px", color: "#ccc", marginBottom: "24px" }}>This student has already activated their account.</div>
              <button
                onClick={() => setShowActivatedPopup(false)}
                style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", backgroundColor: "rgba(255,255,255,0.2)", color: "#fff", fontSize: "15px", fontWeight: "700", cursor: "pointer", fontFamily: "Poppins, sans-serif" }}
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminApprovals() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);

  const fetchEnrollments = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("enrollment").select(`
      enrollment_id,
      student_id,
     student (firstName, middleName, lastName, email, profilephotourl, bachelorsDegree, majorshipTaken, lastSchoolAttended, province),
      curriculum!enrollment_curriculum_id_fkey (curriculumName),
      specialization!enrollment_specialization_id_fkey (specializationName),
      type_of_taker!enrollment_typeOfTaker_id_fkey (typeOfTaker),
      promo!enrollment_promo_id_fkey (promo),
      paymentDetails (
        referenceNumber,
        proofOfPaymentUrl,
        amountTransferred,
        dateOfPayment,
        payment_channel!paymentDetails_paymentChannel_id_fkey (paymentChannelName)
      ),
      verification!enrollment_verification_id_fkey (
        verification_id,
        verificationStatus,
        verificationNotes
      )
    `);
    if (error) { console.error(error.message); setLoading(false); return; }
    setEnrollments(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchEnrollments(); }, []);

  const processAudit = async (verificationId, status) => {
    const { error } = await supabase
      .from("verification")
      .update({
        verificationStatus: status === "approved",
        lastVerificationDate: new Date().toISOString(),
      })
      .eq("verification_id", verificationId);
    if (error) { console.error(error.message); return; }
    fetchEnrollments();
  };

  const pending = enrollments.filter((e) => e.verification?.verificationStatus === false || e.verification?.verificationStatus === null);
  const approved = enrollments.filter((e) => e.verification?.verificationStatus === true);

  const StudentCard = ({ e, showActions, showCode }) => {
    const name = `${e.student?.firstName ?? ""} ${e.student?.lastName ?? ""}`.trim();
    const curriculum = e.curriculum?.curriculumName ?? "—";
    const verificationId = e.verification?.verification_id;

    return (
      <div style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "16px 20px", border: "1px solid #ddd", display: "flex", alignItems: "center", gap: "14px" }}>
        <div style={{ width: "44px", height: "44px", borderRadius: "50%", backgroundColor: "#e8eaf6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
          {e.student?.profilephotourl
            ? <img src={e.student.profilephotourl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <User size={20} color="#1a1a6e" />
          }
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "14px", fontWeight: "700", color: "#1a1a6e" }}>{name || "Unknown"}</div>
          <div style={{ fontSize: "12px", color: "#888" }}>{curriculum}</div>
          <div style={{ fontSize: "11px", color: "#aaa" }}>{e.student?.email}</div>
        </div>
        {showActions && verificationId && (
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => processAudit(verificationId, "rejected")} style={{ padding: "8px 20px", borderRadius: "8px", border: "1px solid #e53935", backgroundColor: "#fff", color: "#e53935", fontWeight: "600", fontSize: "13px", cursor: "pointer", fontFamily: "Poppins, sans-serif" }}>Reject</button>
            <button onClick={() => processAudit(verificationId, "approved")} style={{ padding: "8px 20px", borderRadius: "8px", border: "none", backgroundColor: "#1a1a6e", color: "#fff", fontWeight: "600", fontSize: "13px", cursor: "pointer", fontFamily: "Poppins, sans-serif" }}>Approve</button>
          </div>
        )}
        {showCode && (
          <button
            onClick={() => setSelectedEnrollment(e)}
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "8px", border: "1px solid #1a1a6e", backgroundColor: "#fff", color: "#1a1a6e", fontWeight: "600", fontSize: "13px", cursor: "pointer", fontFamily: "Poppins, sans-serif" }}
          >
            <Key size={14} /> Code
          </button>
        )}
      </div>
    );
  };

  const Section = ({ title, students, showActions, showCode }) => (
    <div style={{ marginBottom: "32px" }}>
      <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1a1a6e", marginBottom: "12px" }}>
        {title} ({students.length})
      </h2>
      {students.length === 0 ? (
        <p style={{ fontSize: "13px", color: "#aaa", fontStyle: "italic" }}>No {title.toLowerCase()} enrollments</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {students.map((e) => <StudentCard key={e.enrollment_id} e={e} showActions={showActions} showCode={showCode} />)}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Poppins, sans-serif", backgroundColor: "#f5f6fa" }}>
      <AdminSidebar />
      <div style={{ marginLeft: "240px", flex: 1 }}>
        <AdminTopbar title="Approvals" />
        <div style={{ padding: "32px 40px" }}>
          {loading ? (
            <p style={{ color: "#aaa" }}>Loading...</p>
          ) : (
            <>
              <Section title="Pending" students={pending} showActions />
              <Section title="Approved" students={approved} showCode />
            </>
          )}
        </div>
      </div>

      {selectedEnrollment && (
        <StudentDetailModal
          enrollment={selectedEnrollment}
          onClose={() => setSelectedEnrollment(null)}
        />
      )}
    </div>
  );
}