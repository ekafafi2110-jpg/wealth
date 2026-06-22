import visualIdentity from "../../theme/visualIdentity";
import { useLocale } from "../../i18n/locale";

export default function ExpenseKeypadActions({ note, onEditNote, onAdd, buttonStyle }) {
  const { t } = useLocale();
  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: "44px 1fr",
        gap: 7,
      }}
    >
      <button
        type="button"
        title={note ? `${t("expenses.note")}: ${note}` : t("expenses.note")}
        aria-label={t("expenses.note")}
        onClick={onEditNote}
        style={buttonStyle(note ? "rgba(66,230,193,0.18)" : "rgba(255,255,255,0.10)", visualIdentity.colors.cyan, {
          minHeight: 44,
          padding: "9px",
          fontSize: 22,
          fontWeight: 900,
          border: note
              ? "1px solid rgba(66,230,193,0.55)"
              : "1px solid rgba(255,255,255,0.14)",
        })}
      >
        📝
      </button>

      <button
        type="button"
        onClick={onAdd}
        style={buttonStyle(visualIdentity.gradients.gold, visualIdentity.colors.navy, {
          width: "100%",
          minHeight: 139,
          padding: "10px",
          fontSize: 14,
          fontWeight: 900,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 6,
        })}
      >
        <span style={{ fontSize: 26, lineHeight: 1 }}>+</span>
        <span>{t("actions.add")}</span>
      </button>
    </div>
  );
}
