import { CalendarClock, CheckCircle2, ChevronDown, ChevronUp, WalletCards } from "lucide-react";
import { useState } from "react";
import { useLocale } from "../../i18n/locale";
import visualIdentity from "../../theme/visualIdentity";

export default function ReservedPaymentsCard({ rows, onPay, onPostpone }) {
  const { currencyLabel } = useLocale();
  const [open, setOpen] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [postponeDates, setPostponeDates] = useState({});
  const total = rows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const accent = visualIdentity.semantic.success;

  return (
    <section
      className="asset-dashboard-card"
      style={{
        position: "relative",
        padding: 14,
        marginBottom: 12,
        borderRadius: visualIdentity.cards.outer.borderRadius,
        border: `1px solid ${accent}66`,
        background: visualIdentity.gradients.outerCard,
        boxShadow: `${visualIdentity.cards.outer.boxShadow}, 0 0 22px ${accent}10`,
        color: visualIdentity.colors.white,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          insetInlineStart: 0,
          top: 18,
          bottom: 18,
          width: 3,
          borderRadius: 99,
          background: accent,
          boxShadow: `0 0 12px ${accent}88`,
        }}
      />

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        style={{
          width: "100%",
          padding: 0,
          border: 0,
          background: "transparent",
          color: "inherit",
          display: "grid",
          gridTemplateColumns: "44px minmax(0,1fr) auto",
          alignItems: "center",
          gap: 10,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        <span
          className="asset-icon-shell"
          style={{
            width: 42,
            height: 42,
            borderRadius: 13,
            display: "grid",
            placeItems: "center",
            color: accent,
            border: `1px solid ${accent}66`,
            background: `${accent}18`,
          }}
        >
          <WalletCards size={21} />
        </span>
        <span style={{ minWidth: 0, textAlign: "right" }}>
          <strong style={{ display: "block", fontSize: 15 }}>أرصدة برسم الدفع</strong>
          <small style={{ color: visualIdentity.colors.textSecondary, fontSize: 9 }}>
            مبالغ محجوزة من السقف بانتظار موعد الدفع
          </small>
        </span>
        <span style={{ textAlign: "left" }}>
          <strong style={{ display: "block", color: accent, fontSize: 18 }}>
            {total.toFixed(2)} <small style={{ fontSize: 8 }}>{currencyLabel}</small>
          </strong>
          {open ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
        </span>
      </button>

      {open && (
        <div style={{ marginTop: 12 }}>
          {rows.map((row) => {
            const isOpen = openId === row.item.id;
            const nextDate = postponeDates[row.item.id] || row.item.dueDate || "";
            return (
              <div
                key={row.item.id}
                style={{
                  padding: 11,
                  marginBottom: 8,
                  borderRadius: 14,
                  border: visualIdentity.cards.inner.border,
                  background: visualIdentity.gradients.innerCard,
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : row.item.id)}
                  style={{
                    width: "100%",
                    padding: 0,
                    border: 0,
                    background: "transparent",
                    color: "inherit",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    textAlign: "right",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  <span>
                    <strong style={{ display: "block", fontSize: 13 }}>{row.sourceLabel || row.category}</strong>
                    <small style={{ color: visualIdentity.colors.textSecondary, fontSize: 9 }}>
                      {row.category}{row.note ? ` · ${row.note}` : ""} · {row.dueText}
                    </small>
                  </span>
                  <strong style={{ color: accent, fontSize: 15, whiteSpace: "nowrap" }}>
                    {row.amount.toFixed(2)} {currencyLabel}
                  </strong>
                </button>

                {isOpen && (
                  <div style={{ marginTop: 10 }}>
                    {row.canAct ? (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 42px", gap: 7 }}>
                        <button
                          type="button"
                          onClick={() => onPay(row.item)}
                          title="سداد من المبلغ المحجوز"
                          style={{
                            minHeight: 40,
                            borderRadius: 11,
                            border: `1px solid ${accent}66`,
                            background: `${accent}18`,
                            color: accent,
                            fontFamily: "inherit",
                            fontWeight: 900,
                            cursor: "pointer",
                          }}
                        >
                          <CheckCircle2 size={16} style={{ verticalAlign: "middle", marginLeft: 5 }} />
                          سداد من المحجوز
                        </button>
                        <CalendarClock size={18} style={{ alignSelf: "center", justifySelf: "center", color: visualIdentity.semantic.warning }} />
                      </div>
                    ) : (
                      <div style={{ color: visualIdentity.colors.textSecondary, fontSize: 10 }}>
                        سيتاح السداد عند حلول شهر الاستحقاق.
                      </div>
                    )}

                    {row.canAct && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 7, marginTop: 8 }}>
                        <input
                          type="date"
                          value={nextDate}
                          onChange={(event) =>
                            setPostponeDates((prev) => ({
                              ...prev,
                              [row.item.id]: event.target.value,
                            }))
                          }
                          style={{
                            minWidth: 0,
                            padding: "9px 8px",
                            borderRadius: 10,
                            border: visualIdentity.cards.inner.border,
                            background: "rgba(255,255,255,0.08)",
                            color: visualIdentity.colors.white,
                            fontFamily: "inherit",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => onPostpone(row.item, nextDate)}
                          style={{
                            borderRadius: 10,
                            border: `1px solid ${visualIdentity.semantic.warning}66`,
                            background: `${visualIdentity.semantic.warning}18`,
                            color: visualIdentity.semantic.warning,
                            fontFamily: "inherit",
                            fontWeight: 900,
                            cursor: "pointer",
                          }}
                        >
                          تأجيل
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {!rows.length && (
            <div style={{ padding: "16px 0 6px", textAlign: "center", color: visualIdentity.colors.textSecondary, fontSize: 12 }}>
              لا توجد أرصدة برسم الدفع
            </div>
          )}
        </div>
      )}
    </section>
  );
}

