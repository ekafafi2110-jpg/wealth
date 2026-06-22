import visualIdentity from "../../theme/visualIdentity";
import ReportModalShell from "./ReportModalShell";
import { useLocale } from "../../i18n/locale";

export default function OverBudgetReportModal({
  open,
  total,
  items,
  onClose,
}) {
  const { currencyLabel } = useLocale();
  return (
    <ReportModalShell
      open={open}
      title="تفاصيل التجاوز"
      subtitle={`الإجمالي ${total.toFixed(2)} ${currencyLabel}`}
      zIndex={558}
      onClose={onClose}
    >
      {items.map((item) => (
        <div
          key={item.id}
          style={{
            background: "rgba(239,68,68,0.14)",
            border: "1px solid rgba(239,68,68,0.30)",
            borderRadius: 12,
            padding: 10,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <b style={{ color: "#FF9B9B" }}>
              {Number(item.overBudget || 0).toFixed(2)} {currencyLabel}
            </b>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  ...visualIdentity.typography.onDarkBody,
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                {item.category || "مصروف"}
              </div>
              <div
                style={{
                  ...visualIdentity.typography.onDarkSecondary,
                  fontSize: 10,
                }}
              >
                {item.note || "بدون ملاحظة"}
              </div>
            </div>
          </div>
        </div>
      ))}

      {!items.length && (
        <div
          style={{
            ...visualIdentity.typography.onDarkSecondary,
            fontSize: 12,
            textAlign: "center",
            padding: 20,
          }}
        >
          لا يوجد تجاوز في هذا الشهر
        </div>
      )}
    </ReportModalShell>
  );
}
