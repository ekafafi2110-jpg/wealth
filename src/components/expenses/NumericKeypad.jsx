const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"];
import visualIdentity from "../../theme/visualIdentity";

export default function NumericKeypad({ onDigit, onBackspace, buttonStyle }) {
  const keys = [
    ...KEYS.map((label) => ({ label, action: () => onDigit(label) })),
    { label: "⌫", action: onBackspace },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 7,
      }}
    >
      {keys.map((key) => (
        <button
          key={key.label}
          type="button"
          onClick={key.action}
          style={buttonStyle("rgba(255,255,255,0.10)", visualIdentity.colors.white, {
            minHeight: 44,
            padding: "9px",
            fontSize: key.label === "⌫" ? 18 : 16,
            fontWeight: 900,
            border: "1px solid rgba(255,255,255,0.14)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
          })}
        >
          {key.label}
        </button>
      ))}
    </div>
  );
}
