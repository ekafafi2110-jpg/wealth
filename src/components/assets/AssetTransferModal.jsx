import TransferAllocationRow from "./TransferAllocationRow";
import visualIdentity from "../../theme/visualIdentity";
import { useLocale } from "../../i18n/locale";

export default function AssetTransferModal({
  open,
  sources,
  fromAsset,
  amount,
  allocations,
  onClose,
  onFromAssetChange,
  onAmountChange,
  onAddRow,
  onRemoveRow,
  onUpdateRow,
  getDestinationOptions,
  onSubmit,
  allowMultiple = true,
  allowedAllocations,
  allowNewTarget = true,
  inputStyle,
  closeButtonStyle,
  addButtonStyle,
  removeButtonStyle,
  submitButtonStyle,
  sourceSaleFields,
  onSourceUnitsChange,
  onSourcePriceChange,
  amountReadOnly = false,
  showAllocations = true,
}) {
  const { currencyLabel } = useLocale();
  if (!open) return null;

  return (
    <div
      onClick={(event) => event.target === event.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(4,20,40,0.78)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 1200,
      }}
    >
      <div
        className="asset-modal"
        style={{
          background: visualIdentity.gradients.appBackground,
          color: visualIdentity.colors.white,
          borderRadius: "20px 20px 0 0",
          border: visualIdentity.cards.outer.border,
          boxShadow: "0 -18px 42px rgba(3,18,37,0.34)",
          padding: "22px 18px 44px",
          width: "100%",
          maxWidth: 440,
          direction: "rtl",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <button type="button" onClick={onClose} style={closeButtonStyle}>
            ✕
          </button>
          <span style={{ fontSize: 15, fontWeight: 900, color: visualIdentity.colors.white }}>
            ⇄ مناقلة بين الأصول
          </span>
        </div>

        <label style={{ fontSize: 11, color: visualIdentity.colors.textSecondary }}>من أصل</label>
        <select
          value={fromAsset}
          onChange={(event) => onFromAssetChange(event.target.value)}
          style={{ ...inputStyle, marginBottom: 10 }}
        >
          {sources.map((source) => (
            <option key={source.key} value={source.key}>
              {source.label} — متاح {Number(source.available || 0).toFixed(2)} {currencyLabel}
            </option>
          ))}
        </select>

        <input
          type="number"
          value={amount}
          onChange={(event) => onAmountChange(event.target.value)}
          readOnly={amountReadOnly}
          placeholder="قيمة المناقلة"
          style={{ ...inputStyle, marginBottom: 12 }}
        />

        {sourceSaleFields && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <input
              type="number"
              value={sourceSaleFields.units}
              onChange={(event) => onSourceUnitsChange(event.target.value)}
              placeholder="عدد الوحدات المباعة"
              style={inputStyle}
            />
            <input
              type="number"
              value={sourceSaleFields.price}
              onChange={(event) => onSourcePriceChange(event.target.value)}
              placeholder="سعر بيع الوحدة"
              style={inputStyle}
            />
          </div>
        )}

        {showAllocations && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              {allowMultiple && (
                <button type="button" onClick={onAddRow} style={addButtonStyle}>
                  +
                </button>
              )}
              <div style={{ fontSize: 12, color: visualIdentity.colors.textSecondary }}>توزيع القيمة</div>
            </div>

            {allocations.map((row) => (
              <TransferAllocationRow
                key={row.id}
                row={row}
                options={getDestinationOptions(row.allocation)}
                onUpdate={(patch) => onUpdateRow(row.id, patch)}
                onRemove={() => onRemoveRow(row.id)}
                allowRemove={allowMultiple}
                allowedAllocations={allowedAllocations}
                allowNewTarget={allowNewTarget}
                inputStyle={inputStyle}
                removeButtonStyle={removeButtonStyle}
              />
            ))}
          </>
        )}

        <button type="button" onClick={onSubmit} style={submitButtonStyle}>
          تنفيذ المناقلة
        </button>
      </div>
    </div>
  );
}
