import { useState } from "react";
import StepBanner from "../../components/StepBanner";
import ContinueButton from "../../components/ContinueButton";
import FormField from "../../components/FormField";
export default function Step3Personal({ data, setData, onNext }) {
  const [subStep, setSubStep] = useState(0);
  const [errors, setErrors] = useState({});
  const handleChange = (key, value) => { setData({ ...data, [key]: value }); setErrors((e) => ({ ...e, [key]: null })); };
  const validatePersonal = () => {
    const e = {};
    if (!data.firstName?.trim()) e.firstName = "Required.";
    if (!data.lastName?.trim()) e.lastName = "Required.";
    if (!data.email?.trim()) e.email = "Required.";
    if (!data.degree?.trim()) e.degree = "Required.";
    if (!data.school?.trim()) e.school = "Required.";
    if (!data.province?.trim()) e.province = "Required.";
    if (!data.unitLearner) e.unitLearner = "Required.";
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({}); setSubStep(1);
  };
  return (
    <>
      <StepBanner title={subStep === 0 ? "Personal Information" : "Promotions & Verification"} currentStep={2} />
      <div className="enroll-body">
        {subStep === 0 ? (
          <>
            <FormField label="First Name:*" fieldKey="firstName" placeholder="Given Name" value={data.firstName} onChange={handleChange} errors={errors} />
            <FormField label="Middle Name:" fieldKey="middleName" placeholder="Middle Name" value={data.middleName} onChange={handleChange} errors={errors} />
            <FormField label="Last Name:*" fieldKey="lastName" placeholder="Last Name" value={data.lastName} onChange={handleChange} errors={errors} />
            <FormField label="Email Address:*" fieldKey="email" placeholder="Email Address" value={data.email} onChange={handleChange} errors={errors} />
            <FormField label="Bachelor's Degree and Majorship Taken:*" fieldKey="degree" placeholder="E.g.: Bachelor of Secondary Education Major in English" hint="Format: [Full Degree/Program Title] Major in [Specialization if app.]" value={data.degree} onChange={handleChange} errors={errors} />
            <FormField label="Last School Attended:*" fieldKey="school" placeholder="E.g.: Polytechnic University of the Philippines - Main Campus" hint="Format: [Full School Name] - [Branch if applicable]" value={data.school} onChange={handleChange} errors={errors} />
            <FormField label="Province:*" fieldKey="province" placeholder="Province" value={data.province} onChange={handleChange} errors={errors} />
            <div className="field-group">
              <span className={`field-label ${errors.unitLearner ? "error" : ""}`}>Are you a unit learner?*</span>
              <div className="radio-group">
                {["Yes", "No"].map((opt) => (
                  <label key={opt} className="radio-label">
                    <input type="radio" name="unitLearner" checked={data.unitLearner === opt} onChange={() => { setData({ ...data, unitLearner: opt }); setErrors((e) => ({ ...e, unitLearner: null })); }} />
                    {opt}
                  </label>
                ))}
              </div>
              {errors.unitLearner && <p className="field-error">{errors.unitLearner}</p>}
            </div>
            <ContinueButton onClick={validatePersonal} />
          </>
        ) : (
          <>
            <p className="enroll-subtitle">Please fill up the necessary information:</p>
            <div className="field-group">
              <span className="field-label">Do you have a promo code?</span>
              <input className="field-input" placeholder="Promo Code (optional)" value={data.promoCode || ""} onChange={(e) => setData({ ...data, promoCode: e.target.value })} />
            </div>
            <div className="field-group">
              <span className="field-label">Upload Valid ID: (optional)</span>
              <input type="file" accept="image/*,.pdf" className="field-input" style={{ padding: "8px" }} onChange={(e) => setData({ ...data, validId: e.target.files[0] })} />
            </div>
            <ContinueButton onClick={onNext} />
          </>
        )}
      </div>
    </>
  );
}