import { createPortal } from "react-dom";
import visualIdentity from "../../theme/visualIdentity";

export default function TextInputModal({
  open,
  title,
  value,
  onChange,
  onCancel,
  onSave,
  placeholder = "",
  multiline = true,
}) {
  if (!open) return null;

  const Input = multiline ? "textarea" : "input";

  return createPortal(
    <div
      className="text-input-modal"
      onClick={(event) => event.target === event.currentTarget && onCancel()}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100dvh",
        zIndex: 1800,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: "14px 12px calc(14px + env(safe-area-inset-bottom))",
        overflowY: "auto",
        overscrollBehavior: "contain",
        background: "rgba(3,18,37,0.72)",
        backdropFilter: "blur(12px)",
        direction: "rtl",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 430,
          borderRadius: "22px 22px 18px 18px",
          border: visualIdentity.cards.outer.border,
          background: visualIdentity.gradients.appBackground,
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.14), 0 18px 44px rgba(4,18,36,0.38)",
          padding: 14,
          maxHeight: "calc(100dvh - 28px - env(safe-area-inset-bottom))",
          overflowY: "auto",
          flexShrink: 0,
        }}
      >
        <div style={{ marginBottom: 10, textAlign: "right" }}>
          <strong
            style={{
              display: "block",
              color: visualIdentity.colors.gold,
              fontSize: 16,
              fontWeight: 900,
            }}
          >
            {title}
          </strong>
        </div>

        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoFocus
          rows={multiline ? 4 : undefined}
          style={{
            width: "100%",
            minHeight: multiline ? 112 : 44,
            resize: multiline ? "vertical" : "none",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.18)",
            background: "rgba(255,255,255,0.09)",
            color: visualIdentity.colors.white,
            outline: "none",
            padding: "11px 12px",
            fontFamily: "inherit",
            fontSize: 13,
            fontWeight: 800,
            lineHeight: 1.7,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10)",
          }}
        />

        <div
          style={{
            position: "sticky",
            bottom: 0,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
            marginTop: 12,
            paddingTop: 2,
            background: visualIdentity.gradients.appBackground,
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            style={{
              minHeight: 42,
              borderRadius: 13,
              border: "1px solid rgba(255,255,255,0.16)",
              background: "rgba(255,255,255,0.08)",
              color: visualIdentity.colors.white,
              fontFamily: "inherit",
              fontSize: 12,
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={onSave}
            style={{
              minHeight: 42,
              borderRadius: 13,
              border: `1px solid ${visualIdentity.colors.gold}`,
              background: visualIdentity.gradients.gold,
              color: visualIdentity.colors.blueDeep,
              fontFamily: "inherit",
              fontSize: 12,
              fontWeight: 950,
              cursor: "pointer",
              boxShadow: "0 8px 20px rgba(228,169,0,0.22)",
            }}
          >
            حفظ
          </button>
        </div>
      </section>
    </div>,
    document.body
  );
}
