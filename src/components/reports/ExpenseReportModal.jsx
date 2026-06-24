import { useMemo, useState } from "react";
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
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [entryType, setEntryType] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const selectedFunding = selectedExpense?.overBudgetFunding || null;
  const selectedFundingLabel = selectedFunding
    ? selectedFunding.type === "card"
      ? `بطاقة — ${selectedFunding.label || "بطاقة"}`
      : selectedFunding.type === "liability"
        ? `التزام — ${selectedFunding.label || "دائن"}`
        : `أصل — ${selectedFunding.label || "أصل"}`
    : "";
  const categories = useMemo(
    () => Array.from(new Set(rows.map((row) => row.category).filter(Boolean))),
    [rows]
  );
  const paymentMethods = useMemo(
    () => Array.from(new Set(rows.map((row) => row.paymentMethod).filter(Boolean))),
    [rows]
  );
  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return rows.filter((row) => {
      const expenseDate = String(row.expense?.date || row.expense?.createdAt || "").slice(0, 10);
      const matchesSearch =
        !normalizedSearch ||
        [row.title, row.category, row.paymentMethod, row.expense?.note]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedSearch));
      const matchesCategory = category === "all" || row.category === category;
      const matchesPayment = paymentMethod === "all" || row.paymentMethod === paymentMethod;
      const matchesType =
        entryType === "all" ||
        (entryType === "income" ? row.isIncome : !row.isIncome);
      const matchesFrom = !dateFrom || (expenseDate && expenseDate >= dateFrom);
      const matchesTo = !dateTo || (expenseDate && expenseDate <= dateTo);
      return matchesSearch && matchesCategory && matchesPayment && matchesType && matchesFrom && matchesTo;
    });
  }, [category, dateFrom, dateTo, entryType, paymentMethod, rows, search]);
  const hasFilters = Boolean(
    search || category !== "all" || paymentMethod !== "all" || entryType !== "all" || dateFrom || dateTo
  );
  const controlStyle = {
    width: "100%",
    minHeight: 38,
    padding: "7px 9px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.08)",
    color: visualIdentity.colors.white,
    fontFamily: "inherit",
    fontSize: 10,
    outline: "none",
  };
  const resetFilters = () => {
    setSearch("");
    setCategory("all");
    setPaymentMethod("all");
    setEntryType("all");
    setDateFrom("");
    setDateTo("");
  };
  return (
    <>
      <ReportModalShell
        open={open}
        title="كشف المصروفات"
        subtitle={`${filteredRows.length} من ${rows.length} حركة`}
        zIndex={555}
        onClose={onClose}
      >
        <section
          style={{
            marginBottom: 12,
            padding: 10,
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.13)",
            background: "rgba(255,255,255,0.055)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <b style={{ color: visualIdentity.colors.gold, fontSize: 11 }}>تصفية الكشف</b>
            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                style={{ border: 0, background: "transparent", color: visualIdentity.colors.cyan, fontFamily: "inherit", fontSize: 9, cursor: "pointer" }}
              >
                مسح الفلاتر
              </button>
            )}
          </div>

          <input
            type="search"
            value={search}
            placeholder="بحث بالتصنيف أو الملاحظة أو طريقة الدفع"
            onChange={(event) => setSearch(event.target.value)}
            style={{ ...controlStyle, marginBottom: 7 }}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 7 }}>
            <select value={category} onChange={(event) => setCategory(event.target.value)} style={controlStyle}>
              <option value="all">كل التصنيفات</option>
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} style={controlStyle}>
              <option value="all">كل طرق الدفع</option>
              {paymentMethods.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 8 }}>
            <label style={{ color: visualIdentity.colors.textSecondary, fontSize: 8 }}>
              من تاريخ
              <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} style={{ ...controlStyle, marginTop: 3 }} />
            </label>
            <label style={{ color: visualIdentity.colors.textSecondary, fontSize: 8 }}>
              إلى تاريخ
              <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} style={{ ...controlStyle, marginTop: 3 }} />
            </label>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
            {[
              ["all", "الكل"],
              ["expense", "مصروفات"],
              ["income", "إيرادات"],
            ].map(([id, label]) => {
              const active = entryType === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setEntryType(id)}
                  style={{
                    minHeight: 32,
                    borderRadius: 9,
                    border: active ? `1px solid ${visualIdentity.colors.cyan}77` : "1px solid rgba(255,255,255,0.12)",
                    background: active ? "rgba(85,217,255,0.18)" : "rgba(255,255,255,0.05)",
                    color: active ? visualIdentity.colors.cyan : visualIdentity.colors.textSecondary,
                    fontFamily: "inherit",
                    fontSize: 9,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </section>

        {filteredRows.map((row, index) => (
          <div
            key={row.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 0",
              borderBottom:
                index < filteredRows.length - 1
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
                {row.expense?.note || "بدون ملاحظة"} | {row.paymentMethod}
              </div>
            </div>
          </div>
        ))}

        {!filteredRows.length && (
          <div
            style={{
              ...visualIdentity.typography.onDarkSecondary,
              textAlign: "center",
              padding: "20px 0",
              fontSize: 13,
            }}
          >
            لا توجد حركات تطابق الفلاتر الحالية
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
              <DetailRow
                label="اسلوب الدفع"
                value={selectedFundingLabel ? `كاش + ${selectedFundingLabel}` : selectedExpense.paymentMethod}
              />
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
                last={!selectedFundingLabel}
              />
              {selectedFundingLabel && (
                <DetailRow
                  label="تغطية مبلغ التجاوز"
                  value={`${selectedFundingLabel} · ${Number(
                    selectedFunding.amount || selectedExpense.overBudget || 0
                  ).toFixed(2)} ${currencyLabel}`}
                  valueColor={visualIdentity.colors.cyan}
                  last
                />
              )}
            </div>
          </>
        )}
      </ReportModalShell>
    </>
  );
}
