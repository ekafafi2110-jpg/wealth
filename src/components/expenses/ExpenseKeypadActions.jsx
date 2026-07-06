import visualIdentity from "../../theme/visualIdentity";
import { useLocale } from "../../i18n/locale";

export default function ExpenseKeypadActions({ onAdd, buttonStyle }) {
  const { t } = useLocale();

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100%",
      }}
    >
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
