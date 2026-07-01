import { Trash2 } from "lucide-react";
import visualIdentity from "../../theme/visualIdentity";
import { useLocale } from "../../i18n/locale";

const money = (value) => Number(value || 0).toFixed(2);

export default function PendingExpensesReview({ items, total, onRemove }) {
  const { currencyLabel, direction, t } = useLocale();
  if (!items.length) return null;

  return (
    <section
      className="asset-dashboard-card"
      style={{
        marginBottom: 12,
        padding: 11,
        borderRadius: visualIdentity.cards.inner.borderRadius,
        border: `1px solid ${visualIdentity.colors.cyan}55`,
        background: visualIdentity.gradients.innerCard,
        boxShadow: visualIdentity.cards.inner.boxShadow,
        color: visualIdentity.colors.white,
        direction,
      }}
    >
      <div style={{ marginBottom: 7, textAlign: "right" }}>
        <b style={{ fontSize: 13 }}>{t("expenses.pendingReview")} ({items.length})</b>
      </div>

      {items.map((item, index) => (
        <div
          key={item.id}
          style={{
            minHeight: 52,
            display: "grid",
            gridTemplateColumns: "34px minmax(0,1fr) auto",
            gap: 8,
            alignItems: "center",
            borderTop: index > 0 ? "1px solid rgba(255,255,255,0.10)" : "none",
          }}
        >
          <button
            type="button"
            title="حذف البند"
            aria-label={`حذف ${item.category}`}
            onClick={() => onRemove(item.id)}
            style={{
              width: 30,
              height: 30,
              padding: 0,
              display: "grid",
              placeItems: "center",
              borderRadius: 9,
              border: "1px solid rgba(255,104,104,0.38)",
              background: "rgba(255,104,104,0.11)",
              color: visualIdentity.colors.red,
              cursor: "pointer",
            }}
          >
            <Trash2 size={15} />
          </button>

          <div style={{ minWidth: 0, textAlign: "right" }}>
            <div style={{ fontSize: 12, fontWeight: 900 }}>{item.category}</div>
            <div
              style={{
                marginTop: 2,
                color: visualIdentity.colors.textSecondary,
                fontSize: 9,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {item.note || item.date}
            </div>
          </div>

          <b style={{ color: visualIdentity.colors.gold, fontSize: 12, whiteSpace: "nowrap" }}>
            {money(item.amount)} {currencyLabel}
          </b>
        </div>
      ))}

      <div
        style={{
          marginTop: 8,
          paddingTop: 8,
          borderTop: "1px solid rgba(255,255,255,0.12)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ color: visualIdentity.colors.textSecondary, fontSize: 10, fontWeight: 800 }}>
          {t("expenses.total")}
        </span>
        <b style={{ color: visualIdentity.colors.cyan, fontSize: 13 }}>
          {money(total)} {currencyLabel}
        </b>
      </div>
    </section>
  );
}
