import visualIdentity from "../../theme/visualIdentity";
import { useLocale } from "../../i18n/locale";

export default function AssetDetailsList({
  rows,
  emptyText,
  rowStyle,
  lastRowStyle,
}) {
  const { currencyLabel } = useLocale();
  if (!rows.length) {
    return (
      <div
        style={{
          textAlign: "center",
          color: visualIdentity.colors.textSecondary,
          fontSize: 12,
          padding: "12px 0 4px",
        }}
      >
        {emptyText}
      </div>
    );
  }

  return (
    <div style={{ marginTop: 8 }}>
      {rows.map((row, index) => (
        <div
          key={row.id}
          style={{
            ...(index < rows.length - 1 ? rowStyle : lastRowStyle),
            color: visualIdentity.colors.white,
            borderBottom:
              index < rows.length - 1 ? "1px solid rgba(255,255,255,0.11)" : "none",
          }}
        >
          <div>
            <strong>{Number(row.value || 0).toFixed(2)} {currencyLabel}</strong>
            {row.meta && (
              <div
                style={{
                  fontSize: 10,
                  color: row.metaColor || visualIdentity.colors.textSecondary,
                  fontWeight: row.metaWeight,
                }}
              >
                {row.meta}
              </div>
            )}
          </div>
          <span style={row.nameStyle}>{row.name}</span>
        </div>
      ))}
    </div>
  );
}
