import { useState } from "react";
import Navbar from "../components/Navbar";
import Step1Privacy from "./enroll-steps/Step1Privacy";
import Step2Curriculum from "./enroll-steps/Step2Curriculum";
import Step3Personal from "./enroll-steps/Step3Personal";
import Step4Payment from "./enroll-steps/Step4Payment";
import Step5Complete from "./enroll-steps/Step5Complete";
import "../styles/enroll.css";

const INITIAL_DATA = {
  privacy: "Agree",
  curriculum: "BEEd",
  takerType: "First time taker",
  unitLearner: "Yes",
};

export default function Enroll() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState(INITIAL_DATA);

  const next = () => setStep((s) => Math.min(s + 1, 4));

  const steps = [
    <Step1Privacy data={formData} setData={setFormData} onNext={next} />,
    <Step2Curriculum data={formData} setData={setFormData} onNext={next} />,
    <Step3Personal data={formData} setData={setFormData} onNext={next} />,
    <Step4Payment data={formData} setData={setFormData} onNext={next} />,
    <Step5Complete />,
  ];

  return (
    <div className="enroll-page">
      <Navbar />
      <div className="enroll-card">
        {steps[step]}
      </div>
    </div>
  );
}