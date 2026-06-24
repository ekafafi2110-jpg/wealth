import { Gauge, Plus, TriangleAlert } from "lucide-react";
import visualIdentity from "../../theme/visualIdentity";
import { useLocale } from "../../i18n/locale";

const money = (value) =>
  Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function ExpenseCategoryCapsSettings({
  categories,
  caps,
  spendingCap,
  onChange,
  onAddCategory,
  inputStyle,
}) {
  const { currencyLabel } = useLocale();
  const plannedTotal = categories.reduce(
    (sum, category) => sum + Number(caps?.[category.label] || 0),
    0
  );
  const exceedsMainCap = plannedTotal > Number(spendingCap || 0);
  const remainingToPlan = Math.max(0, Number(spendingCap || 0) - plannedTotal);

  return (
    <section
      style={{
        marginTop: 6,
        paddingTop: 14,
        borderTop: "1px solid rgba(255,255,255,0.13)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 900 }}>
            <Gauge size={16} color={visualIdentity.semantic.warning} />
            سقوف بنود المصروف
          </div>
          <div style={{ marginTop: 3, color: visualIdentity.colors.textSecondary, fontSize: 9 }}>
            للمراقبة والتخطيط فقط ولا تمنع تسجيل المصروف
          </div>
        </div>
        <div style={{ textAlign: "left" }}>
          <small style={{ display: "block", color: visualIdentity.colors.textSecondary, fontSize: 8 }}>
            المخطط / المتاح
          </small>
          <b style={{ color: exceedsMainCap ? visualIdentity.colors.red : visualIdentity.semantic.warning, fontSize: 12 }}>
            {money(plannedTotal)} / {money(remainingToPlan)} {currencyLabel}
          </b>
        </div>
      </div>

      {exceedsMainCap && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            marginBottom: 10,
            padding: "8px 9px",
            borderRadius: 11,
            border: `1px solid ${visualIdentity.colors.red}55`,
            background: `${visualIdentity.colors.red}16`,
            color: "#FFB2B2",
            fontSize: 9,
          }}
        >
          <TriangleAlert size={14} />
          مجموع السقوف الحالي أعلى من سقف الصرف. خفّض البنود لتصحيح المجموع.
        </div>
      )}

      <div style={{ display: "grid", gap: 8 }}>
        {categories.map((category) => (
          <label
            key={category.id || category.label}
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,1fr) 126px",
              alignItems: "center",
              gap: 10,
              minHeight: 50,
              padding: "7px 9px",
              borderRadius: 13,
              border: "1px solid rgba(255,255,255,0.11)",
              background: "rgba(255,255,255,0.055)",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
              <span
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 9,
                  display: "grid",
                  placeItems: "center",
                  flex: "0 0 30px",
                  background: `${category.color || visualIdentity.colors.cyan}1f`,
                  border: `1px solid ${category.color || visualIdentity.colors.cyan}55`,
                }}
              >
                {category.icon || "•"}
              </span>
              <b style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 11 }}>
                {category.label}
              </b>
            </span>
            <span style={{ position: "relative" }}>
              <input
                type="number"
                min="0"
                step="0.01"
                value={caps?.[category.label] ?? ""}
                placeholder="0.00"
                onChange={(event) =>
                  onChange(category.label, Math.max(0, Number(event.target.value || 0)))
                }
                style={{ ...inputStyle, width: "100%", paddingLeft: 38 }}
              />
              <small style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: visualIdentity.colors.textFaint, fontSize: 8 }}>
                {currencyLabel}
              </small>
            </span>
          </label>
        ))}
      </div>

      <button
        type="button"
        onClick={onAddCategory}
        style={{
          width: "100%",
          minHeight: 42,
          marginTop: 10,
          borderRadius: 13,
          border: `1px dashed ${visualIdentity.colors.cyan}88`,
          background: `${visualIdentity.colors.cyan}12`,
          color: visualIdentity.colors.cyan,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          fontFamily: "inherit",
          fontSize: 11,
          fontWeight: 900,
          cursor: "pointer",
        }}
      >
        <Plus size={16} />
        إضافة بند مصروف جديد
      </button>
    </section>
  );
}
