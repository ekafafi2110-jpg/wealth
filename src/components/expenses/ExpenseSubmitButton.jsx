export default function ExpenseSubmitButton({
  onSubmit,
  title,
  meta,
  buttonStyle,
  background,
  color,
  minHeight,
}) {
  return (
    <button
      type="button"
      onClick={onSubmit}
      style={buttonStyle(background, color, {
        width: "100%",
        minHeight,
        marginTop: 6,
        marginBottom: 0,
        display: "block",
        borderRadius: 16,
        fontWeight: 900,
        boxShadow: "0 9px 22px rgba(255,184,0,0.20), inset 0 1px 0 rgba(255,255,255,0.34)",
      })}
    >
      <span style={{ display: "block" }}>✓ {title}</span>
      {meta && (
        <span style={{ display: "block", marginTop: 3, fontSize: 11, fontWeight: 700 }}>
          {meta}
        </span>
      )}
    </button>
  );
}
