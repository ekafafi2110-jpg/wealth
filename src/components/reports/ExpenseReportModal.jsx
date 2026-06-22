import visualIdentity from "../../theme/visualIdentity";
import ReportModalShell from "./ReportModalShell";
import { useLocale } from "../../i18n/locale";

const detailRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 0",
  borderBottom: "1px solid rgba(255,255,255,0.12)",
  fontSize: 13,
};

function DetailRow({ label, value, valueColor, last = false }) {
  return (
    <div
      style={{
        ...detailRowStyle,
        borderBottom: last ? "none" : detailRowStyle.borderBottom,
      }}
    >
      <span style={visualIdentity.typography.onDarkSecondary}>{label}</span>
      <b style={{ color: valueColor || visualIdentity.colors.white }}>{value}</b>
    </div>
  );
}

export default function ExpenseReportModal({
  open,
  rows,
  selectedExpense,
  selectedTotal,
  selectedRecorded,
  selectedDebt,
  selectedAsset,
  onClose,
  onSelect,
  onCloseSelected,
}) {
  const { currencyLabel } = useLocale();
  return (
    <>
      <ReportModalShell
        open={open}
        title="كشف المصروفات"
        subtitle={`${rows.length} حركة`}
        zIndex={555}
        onClose={onClose}
      >
        {rows.map((row, index) => (
          <div
            key={row.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 0",
              borderBottom:
                index < rows.length - 1
                  ? "1px solid rgba(255,255,255,0.12)"
                  : "none",
              ...(row.rowStyle || {}),
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  type="button"
                  title="تفاصيل المصروف"
                  aria-label="تفاصيل المصروف"
                  onClick={() => onSelect(row.expense)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 9,
                    border: `1px solid ${visualIdentity.colors.gold}`,
                    background: "rgba(255,198,45,0.16)",
                    color: visualIdentity.colors.gold,
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  ✎
                </button>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: row.isIncome ? "#60C698" : visualIdentity.colors.white,
                  }}
                >
                  {row.isIncome ? "+" : ""}
                  {row.amount.toFixed(2)} {currencyLabel}
                </div>
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: row.isIncome
                    ? "#60C698"
                    : visualIdentity.colors.glassStrong,
                }}
              >
                {row.meta}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13 }}>{row.title}</div>
              <div style={{ fontSize: 10, color: row.categoryColor, marginTop: 2 }}>
                {row.category} | {row.paymentMethod}
              </div>
            </div>
          </div>
        ))}

        {!rows.length && (
          <div
            style={{
              ...visualIdentity.typography.onDarkSecondary,
              textAlign: "center",
              padding: "20px 0",
              fontSize: 13,
            }}
          >
            لا توجد مصروفات بعد
          </div>
        )}
      </ReportModalShell>

      <ReportModalShell
        open={Boolean(selectedExpense)}
        title="تفاصيل المصروف"
        subtitle="عرض من كشف المصروفات"
        zIndex={559}
        onClose={onCloseSelected}
      >
        {selectedExpense && (
          <>
            {selectedTotal !== selectedRecorded && (
              <div
                style={{
                  ...visualIdentity.cards.inner,
                  background: visualIdentity.gradients.innerCard,
                  padding: 10,
                  marginBottom: 10,
                }}
              >
                <DetailRow
                  label="إجمالي المصروف"
                  value={`${selectedTotal.toFixed(2)} ${currencyLabel}`}
                />
                <DetailRow
                  label="من سقف الصرف"
                  value={`${Number(selectedExpense.budgetCovered || 0).toFixed(2)} ${currencyLabel}`}
                  valueColor="#60C698"
                />
                {selectedDebt > 0 && (
                  <DetailRow
                    label="سجل كدين"
                    value={`${selectedDebt.toFixed(2)} ${currencyLabel}`}
                    valueColor="#FF9B9B"
                  />
                )}
                {selectedAsset > 0 && (
                  <DetailRow
                    label="ممّول من أصل"
                    value={`${selectedAsset.toFixed(2)} ${currencyLabel}`}
                    valueColor={visualIdentity.colors.gold}
                    last
                  />
                )}
              </div>
            )}

            <div
              style={{
                ...visualIdentity.cards.inner,
                background: visualIdentity.gradients.innerCard,
                padding: "4px 12px",
              }}
            >
              <DetailRow
                label="المبلغ"
                value={`${Number(selectedExpense.amount || 0).toFixed(2)} ${currencyLabel}`}
              />
              <DetailRow label="التصنيف" value={selectedExpense.category} />
              <DetailRow label="اسلوب الدفع" value={selectedExpense.paymentMethod} />
              <DetailRow
                label="المغطى من السقف"
                value={`${Number(selectedExpense.budgetCovered || 0).toFixed(2)} ${currencyLabel}`}
              />
              <DetailRow
                label="الملاحظة"
                value={selectedExpense.note || "بدون ملاحظة"}
              />
              <DetailRow
                label="التجاوز"
                value={`${Number(selectedExpense.overBudget || 0).toFixed(2)} ${currencyLabel}`}
                valueColor={
                  Number(selectedExpense.overBudget || 0) > 0
                    ? "#FF9B9B"
                    : visualIdentity.colors.white
                }
                last
              />
            </div>
          </>
        )}
      </ReportModalShell>
    </>
  );
}
