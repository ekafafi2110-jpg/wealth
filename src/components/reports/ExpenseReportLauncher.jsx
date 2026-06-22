import visualIdentity from "../../theme/visualIdentity";

export default function ExpenseReportLauncher({ onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      style={{
        width: "100%",
        marginBottom: 14,
        padding: "11px 16px",
        border: `1px solid ${visualIdentity.colors.gold}`,
        borderRadius: 14,
        background: visualIdentity.gradients.gold,
        color: visualIdentity.colors.blueDeep,
        boxShadow: "0 8px 20px rgba(228,169,0,0.22)",
        cursor: "pointer",
        fontFamily: "inherit",
        fontSize: 13,
        fontWeight: 800,
      }}
    >
      كشف المصروفات
    </button>
  );
}
