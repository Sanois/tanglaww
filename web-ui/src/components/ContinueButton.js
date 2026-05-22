export default function ContinueButton({ onClick, label = "Continue" }) {
  return (
    <button onClick={onClick} className="continue-btn">
      {label}
    </button>
  );
}