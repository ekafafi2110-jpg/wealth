import visualIdentity from "../../theme/visualIdentity";
import { useRef } from "react";

export default function CalendarDatePicker({ value, onChange, label = "اختيار تاريخ الاستحقاق" }) {
  const selected = Boolean(value);
  const inputRef = useRef(null);

  const openCalendar = () => {
    const input = inputRef.current;
    if (!input) return;
    if (typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }
    input.click();
  };

  return (
    <button
      type="button"
      onClick={openCalendar}
      aria-label={label}
      title={selected ? `${label}: ${value}` : label}
      style={{
        position: "relative",
        width: 42,
        height: 42,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
        border: selected
          ? `1.5px solid ${visualIdentity.colors.gold}`
          : "1px solid rgba(255,255,255,0.18)",
        background: selected
          ? "rgba(255,198,45,0.14)"
          : "rgba(255,255,255,0.08)",
        color: selected
          ? visualIdentity.colors.gold
          : visualIdentity.colors.textSecondary,
        cursor: "pointer",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M8 3v4M16 3v4M3 10h18" />
        {selected && <path d="m8.5 15 2 2 5-5" />}
      </svg>
      <input
        ref={inputRef}
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        tabIndex={-1}
        aria-hidden="true"
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: "none",
        }}
      />
    </button>
  );
}
