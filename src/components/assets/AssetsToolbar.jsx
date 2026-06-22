import visualIdentity from "../../theme/visualIdentity";

export default function AssetsToolbar({ onAddIncome, onTransfer, transferIcon }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 44px",
        gap: 8,
        marginBottom: 12,
      }}
    >
      <button
        type="button"
        onClick={onAddIncome}
        style={{
          background: visualIdentity.gradients.gold,
          color: visualIdentity.colors.navy,
          padding: "9px 14px",
          fontSize: 12,
          fontWeight: 900,
          border: 0,
          borderRadius: 12,
          cursor: "pointer",
          width: "100%",
          fontFamily: "inherit",
        }}
      >
        + دخل إضافي
      </button>

      <button
        type="button"
        title="مناقلة"
        aria-label="مناقلة"
        onClick={onTransfer}
        style={{
          width: 44,
          height: 38,
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.16)",
          background: "rgba(255,255,255,0.08)",
          color: visualIdentity.colors.gold,
          cursor: "pointer",
          fontWeight: 900,
          fontFamily: "inherit",
        }}
      >
        {transferIcon}
      </button>
    </div>
  );
}
