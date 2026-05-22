export default function FormField({ label, fieldKey, placeholder, hint, value, onChange, errors }) {
  const hasError = !!errors?.[fieldKey];
  return (
    <div className="field-group">
      <span className={`field-label ${hasError ? "error" : ""}`}>{label}</span>
      {hint && <span className="field-hint">{hint}</span>}
      <input
        className={`field-input ${hasError ? "error" : ""}`}
        placeholder={placeholder}
        value={value || ""}
        onChange={(e) => onChange(fieldKey, e.target.value)}
      />
      {hasError && <p className="field-error">{errors[fieldKey]}</p>}
    </div>
  );
}
