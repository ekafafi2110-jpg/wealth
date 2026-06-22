const iconButtonStyle = (color) => ({
  width: 34,
  height: 34,
  borderRadius: 10,
  border: "1px solid var(--border-soft)",
  background: "var(--bg-card)",
  color,
  cursor: "pointer",
  fontWeight: 900,
  fontFamily: "inherit",
});

export default function CreditCardsSettingsSection({
  open,
  cards,
  mode,
  selectedCardId,
  name,
  limit,
  balance,
  dueDay,
  onToggle,
  onAdd,
  onEdit,
  onPrepareDelete,
  onCancel,
  onNameChange,
  onLimitChange,
  onBalanceChange,
  onDueDayChange,
  onSelectedCardChange,
  onSave,
  onDelete,
  inputStyle,
}) {
  return (
    <div
      style={{
        borderTop: "1px solid var(--border-soft)",
        paddingTop: 12,
        marginTop: 8,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button type="button" onClick={onAdd} style={iconButtonStyle("#86efac")}>
            +
          </button>
          <button
            type="button"
            onClick={onToggle}
            style={iconButtonStyle("var(--text-body)")}
          >
            {open ? "−" : "⋯"}
          </button>
        </div>
        <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-heading)" }}>
          💳 البطاقات
        </div>
      </div>

      {open && (
        <>
          <div style={{ display: "grid", gap: 8, marginBottom: mode ? 10 : 0 }}>
            {cards.map((card) => {
              const used = Number(card.balance || 0);
              const creditLimit = Number(card.creditLimit || 0);
              const available = Math.max(0, creditLimit - used);

              return (
                <div
                  key={card.id}
                  style={{
                    border: "1px solid var(--border-soft)",
                    borderRadius: 12,
                    padding: 10,
                    background: "linear-gradient(135deg,var(--gold-light),var(--bg-card))",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => onEdit(card)}
                        style={iconButtonStyle("#93c5fd")}
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        onClick={() => onPrepareDelete(card.id)}
                        style={iconButtonStyle("#fecaca")}
                      >
                        🗑
                      </button>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 900, fontSize: 13 }}>{card.name}</div>
                      <div style={{ color: "#93c5fd", fontSize: 10 }}>
                        {used.toFixed(2)} / {creditLimit.toFixed(2)} · متاح{" "}
                        {available.toFixed(2)}
                      </div>
                      <div style={{ color: "var(--text-body)", fontSize: 10, marginTop: 2 }}>
                        {card.dueDay
                          ? `يوم الاستحقاق ${card.dueDay}`
                          : "بلا يوم استحقاق"}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {!cards.length && (
              <div
                style={{
                  color: "var(--text-faint)",
                  fontSize: 12,
                  textAlign: "center",
                  padding: 8,
                }}
              >
                لا توجد بطاقات
              </div>
            )}
          </div>

          {(mode === "add" || mode === "edit") && (
            <div>
              <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 8 }}>
                <button type="button" onClick={onCancel} style={iconButtonStyle("#fecaca")}>
                  ×
                </button>
              </div>
              <label style={{ fontSize: 10, color: "var(--text-faint)" }}>اسم البطاقة</label>
              <input
                value={name}
                onChange={(event) => onNameChange(event.target.value)}
                placeholder="مثال: فيزا البنك"
                style={{ ...inputStyle, marginBottom: 8 }}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div>
                  <label style={{ fontSize: 10, color: "var(--text-faint)" }}>
                    سقف البطاقة
                  </label>
                  <input
                    type="number"
                    value={limit}
                    onChange={(event) => onLimitChange(event.target.value)}
                    placeholder="0.00"
                    style={{ ...inputStyle, marginBottom: 8 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 10, color: "var(--text-faint)" }}>
                    المستخدم الآن
                  </label>
                  <input
                    type="number"
                    value={balance}
                    onChange={(event) => onBalanceChange(event.target.value)}
                    placeholder="0.00"
                    style={{ ...inputStyle, marginBottom: 8 }}
                  />
                </div>
              </div>
              <label style={{ fontSize: 10, color: "var(--text-faint)" }}>
                يوم الاستحقاق الشهري
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={dueDay}
                onChange={(event) => onDueDayChange(event.target.value)}
                placeholder="مثال: 20"
                style={{ ...inputStyle, marginBottom: 8 }}
              />
              <button
                type="button"
                onClick={onSave}
                style={{
                  width: "100%",
                  border: 0,
                  borderRadius: 12,
                  padding: "10px 20px",
                  background: "#17341f",
                  color: "#86efac",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontWeight: 700,
                }}
              >
                {mode === "edit" ? "حفظ التعديل" : "حفظ البطاقة"}
              </button>
            </div>
          )}

          {mode === "delete" && (
            <div>
              <select
                value={selectedCardId}
                onChange={(event) => onSelectedCardChange(event.target.value)}
                style={{ ...inputStyle, marginBottom: 8 }}
              >
                <option value="">اختر البطاقة</option>
                {cards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.name} - الرصيد: {Number(card.balance || 0).toFixed(2)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={onDelete}
                style={{
                  width: "100%",
                  border: 0,
                  borderRadius: 12,
                  padding: "10px 20px",
                  background: "#2b1111",
                  color: "#fecaca",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontWeight: 700,
                }}
              >
                حذف البطاقة المختارة
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
