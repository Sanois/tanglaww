import { useState } from "react";
export default function SummarySection({ title, fields }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="summary-section">
      <div className="summary-header" onClick={() => setOpen(!open)}>
        {title}<span>{open ? "^" : "v"}</span>
      </div>
      {open && (
        <div className="summary-body">
          {fields.map(([label, value]) => (
            <div key={label}><strong>{label}:</strong> {value || "-"}</div>
          ))}
        </div>
      )}
    </div>
  );
}
