export default function DueLiabilitiesButton({ count, onClick }) {
  if (Number(count || 0) <= 0) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      title="الالتزامات المستحقة هذا الشهر"
      aria-label="الالتزامات المستحقة هذا الشهر"
      style={{
        position: "relative",
        width: 30,
        height: 30,
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.16)",
        background: "rgba(255,255,255,0.08)",
        color: "#FFC62D",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        fontSize: 15,
        fontWeight: 900,
        fontFamily: "inherit",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
      }}
    >
      🔔
      <span
        style={{
          position: "absolute",
          top: -5,
          right: -5,
          minWidth: 16,
          height: 16,
          padding: "0 4px",
          borderRadius: 999,
          background: "#ef4444",
          color: "#fff",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 9,
          fontWeight: 900,
          lineHeight: 1,
          boxShadow: "0 1px 4px rgba(239,68,68,0.18)",
        }}
      >
        {count}
      </span>
    </button>
  );
}
