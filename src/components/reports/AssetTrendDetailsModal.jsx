import visualIdentity from "../../theme/visualIdentity";
import ReportModalShell from "./ReportModalShell";

export default function AssetTrendDetailsModal({
  open,
  months,
  rows,
  selectedAsset,
  onSelect,
  onClose,
}) {
  return (
    <ReportModalShell
      open={open}
      title="تفاصيل تغير الأصول"
      subtitle={`${months} أشهر`}
      zIndex={560}
      onClose={onClose}
    >
      {rows.length ? (
        <>
          <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
            {rows.map((asset) => (
              <button
                key={asset.key}
                type="button"
                onClick={() => onSelect(asset.key)}
                style={{
                  border: `1px solid ${
                    asset.isSelected
                      ? asset.color
                      : "rgba(255,255,255,0.14)"
                  }`,
                  background: asset.isSelected
                    ? "rgba(255,198,45,0.14)"
                    : visualIdentity.gradients.innerCard,
                  borderRadius: 12,
                  padding: 9,
                  color: visualIdentity.colors.white,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textAlign: "right",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "0.8fr 1.2fr",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <div style={{ textAlign: "left" }}>
                    <b style={{ color: asset.color }}>
                      {asset.change >= 0 ? "+" : ""}
                      {asset.change.toFixed(2)}
                    </b>
                    <div
                      style={{
                        ...visualIdentity.typography.onDarkSecondary,
                        fontSize: 10,
                      }}
                    >
                      {asset.change >= 0 ? "نما" : "نقص"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800 }}>
                      {asset.label}
                    </div>
                    <div
                      style={{
                        height: 7,
                        background: "rgba(255,255,255,0.10)",
                        borderRadius: 4,
                        marginTop: 6,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${asset.width}%`,
                          background: asset.color,
                          borderRadius: 4,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {selectedAsset && (
            <div
              style={{
                ...visualIdentity.cards.inner,
                background: visualIdentity.gradients.innerCard,
                padding: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <b style={{ color: selectedAsset.change >= 0 ? "#86efac" : "#FF9B9B" }}>
                  {selectedAsset.change >= 0 ? "+" : ""}
                  {selectedAsset.change.toFixed(2)}
                </b>
                <span style={{ ...visualIdentity.typography.onDarkBody, fontSize: 12 }}>
                  {selectedAsset.label}
                </span>
              </div>

              {selectedAsset.months.map((month) => (
                <div
                  key={`${selectedAsset.key}-${month.month}`}
                  style={{
                    borderTop: "1px solid rgba(255,255,255,0.12)",
                    paddingTop: 7,
                    marginTop: 7,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 11,
                      marginBottom: 5,
                    }}
                  >
                    <span style={{ color: month.change >= 0 ? "#86efac" : "#FF9B9B" }}>
                      {month.change >= 0 ? "+" : ""}
                      {month.change.toFixed(2)}
                    </span>
                    <span style={visualIdentity.typography.onDarkSecondary}>
                      {month.month}
                    </span>
                  </div>

                  {month.reasons.real.length > 0 ? (
                    month.reasons.real.map((reason) => (
                      <div
                        key={`${month.month}-${reason.reason}`}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 11,
                          marginBottom: 4,
                        }}
                      >
                        <span style={{ color: "#FF9B9B" }}>
                          -{reason.amount.toFixed(2)}
                        </span>
                        <span style={visualIdentity.typography.onDarkBody}>
                          {reason.reason}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div
                      style={{
                        ...visualIdentity.typography.onDarkSecondary,
                        fontSize: 11,
                        marginBottom: 4,
                      }}
                    >
                      لا يوجد سبب مصروف مباشر مسجل
                    </div>
                  )}

                  {month.reasons.transfers.length > 0 && (
                    <div
                      style={{
                        marginTop: 6,
                        paddingTop: 6,
                        borderTop: "1px dashed rgba(255,255,255,0.14)",
                      }}
                    >
                      {month.reasons.transfers.map((reason) => (
                        <div
                          key={`${month.month}-${reason.reason}`}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 11,
                            marginBottom: 4,
                            color: "#93c5fd",
                          }}
                        >
                          <span>{reason.amount.toFixed(2)}</span>
                          <span>{reason.reason} · ليست نقصاً فعلياً</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div
          style={{
            ...visualIdentity.typography.onDarkSecondary,
            fontSize: 12,
            textAlign: "center",
            padding: 20,
          }}
        >
          تحتاج إلى إغلاق شهرين على الأقل للمقارنة
        </div>
      )}
    </ReportModalShell>
  );
}
