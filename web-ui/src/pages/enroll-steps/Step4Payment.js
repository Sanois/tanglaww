import { useState } from "react";
import StepBanner from "../../components/StepBanner";
import ContinueButton from "../../components/ContinueButton";
import SummarySection from "../../components/SummarySection";
const PAYMENT_METHODS = ["GCash", "Maya", "Bank Transfer", "Others"];
export default function Step4Payment({ data, setData, onNext }) {
  const [subStep, setSubStep] = useState(0);
  const [errors, setErrors] = useState({});
  const clearError = (key) => setErrors((e) => ({ ...e, [key]: null }));
  const validatePayment = () => {
    const e = {};
    if (!data.amount?.trim()) e.amount = "Required.";
    if (!data.paymentDate) e.paymentDate = "Required.";
    if (!data.paymentChannel) e.paymentChannel = "Required.";
    if (data.paymentChannel === "Others" && !data.paymentOther?.trim()) e.paymentOther = "Please specify.";
    if (!data.referenceNumber?.trim()) e.referenceNumber = "Required.";
    if (!data.proofOfPayment) e.proofOfPayment = "Please upload proof of payment.";
    if (Object.keys(e).length) { setErrors(e); return; }
    setSubStep(1);
  };
  return (
    <>
      <StepBanner title={subStep === 0 ? "Payment Information" : "Summary"} currentStep={3} />
      <div className="enroll-body">
        {subStep === 0 ? (
          <>
            <p className="enroll-subtitle">Please fill up the necessary information:</p>
            <div className="field-group">
              <span className={`field-label ${errors.amount ? "error" : ""}`}>Amount Transferred:*</span>
              <input className={`field-input ${errors.amount ? "error" : ""}`} placeholder="E.g.: 5000" value={data.amount || ""} onChange={(e) => { setData({ ...data, amount: e.target.value }); clearError("amount"); }} />
              {errors.amount && <p className="field-error">{errors.amount}</p>}
            </div>
            <div className="field-group">
              <span className={`field-label ${errors.paymentDate ? "error" : ""}`}>Date of Payment:*</span>
              <input type="date" className={`field-input ${errors.paymentDate ? "error" : ""}`} value={data.paymentDate || ""} onChange={(e) => { setData({ ...data, paymentDate: e.target.value }); clearError("paymentDate"); }} />
              {errors.paymentDate && <p className="field-error">{errors.paymentDate}</p>}
            </div>
            <div className="field-group">
              <span className={`field-label ${errors.paymentChannel ? "error" : ""}`}>Payment Channel Used:*</span>
              <select className={`field-input ${errors.paymentChannel ? "error" : ""}`} value={data.paymentChannel || ""} onChange={(e) => { setData({ ...data, paymentChannel: e.target.value }); clearError("paymentChannel"); }}>
                <option value="">Select method</option>
                {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              {errors.paymentChannel && <p className="field-error">{errors.paymentChannel}</p>}
            </div>
            {data.paymentChannel === "Others" && (
              <div className="field-group">
                <span className={`field-label ${errors.paymentOther ? "error" : ""}`}>Please specify:*</span>
                <input className={`field-input ${errors.paymentOther ? "error" : ""}`} placeholder="Others" value={data.paymentOther || ""} onChange={(e) => { setData({ ...data, paymentOther: e.target.value }); clearError("paymentOther"); }} />
                {errors.paymentOther && <p className="field-error">{errors.paymentOther}</p>}
              </div>
            )}
            <div className="field-group">
              <span className={`field-label ${errors.referenceNumber ? "error" : ""}`}>Payment Reference Number:*</span>
              <input className={`field-input ${errors.referenceNumber ? "error" : ""}`} placeholder="E.g.: 1234 5678 9" value={data.referenceNumber || ""} onChange={(e) => { setData({ ...data, referenceNumber: e.target.value }); clearError("referenceNumber"); }} />
              {errors.referenceNumber && <p className="field-error">{errors.referenceNumber}</p>}
            </div>
            <div className="field-group">
              <span className={`field-label ${errors.proofOfPayment ? "error" : ""}`}>Upload Proof of Payment:*</span>
              <input type="file" accept="image/*,.pdf" className={`field-input ${errors.proofOfPayment ? "error" : ""}`} style={{ padding: "8px" }} onChange={(e) => { setData({ ...data, proofOfPayment: e.target.files[0] }); clearError("proofOfPayment"); }} />
              {errors.proofOfPayment && <p className="field-error">{errors.proofOfPayment}</p>}
            </div>
            <ContinueButton onClick={validatePayment} />
          </>
        ) : (
          <>
            <p className="enroll-subtitle">Kindly verify all information before proceeding.</p>
            <SummarySection title="Program & Curriculum" fields={[["Curriculum", data.curriculum], ["Specialization", data.specialization], ["Type of Taker", data.takerType]]} />
            <SummarySection title="Personal Information" fields={[["First Name", data.firstName], ["Middle Name", data.middleName], ["Last Name", data.lastName], ["Email", data.email], ["Degree", data.degree], ["School", data.school], ["Province", data.province], ["Unit Learner", data.unitLearner]]} />
            <SummarySection title="Promotions & Verification" fields={[["Promo Code", data.promoCode || "None"], ["Valid ID", data.validId?.name || "Not uploaded"]]} />
            <SummarySection title="Payment Information" fields={[["Amount", data.amount], ["Date", data.paymentDate], ["Channel", data.paymentChannel], ["Reference No.", data.referenceNumber], ["Proof of Payment", data.proofOfPayment?.name || "Uploaded"]]} />
            <ContinueButton onClick={onNext} />
          </>
        )}
      </div>
    </>
  );
}