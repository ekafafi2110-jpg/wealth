import ExpenseKeypadActions from "./ExpenseKeypadActions";
import NumericKeypad from "./NumericKeypad";
import visualIdentity from "../../theme/visualIdentity";

export default function ExpenseEntryPad({
  spendingProgress,
  onDigit,
  onBackspace,
  note,
  onEditNote,
  onAdd,
  buttonStyle,
}) {
  const showProgress = Number.isFinite(spendingProgress);

  return (
    <div
      style={{
        marginBottom: 12,
        background: visualIdentity.gradients.innerCard,
        border: visualIdentity.cards.inner.border,
        borderRadius: visualIdentity.cards.inner.borderRadius,
        padding: 10,
        boxShadow: visualIdentity.cards.inner.boxShadow,
      }}
    >
      {showProgress && (
        <div
          style={{
            height: 7,
            background: "rgba(255,255,255,0.10)",
            borderRadius: 99,
            overflow: "hidden",
            marginBottom: 10,
          }}
        >
          <div
            style={{
              width: `${spendingProgress}%`,
              height: "100%",
              background:
                spendingProgress >= 100
                  ? "#D95555"
                  : visualIdentity.gradients.gold,
              borderRadius: 99,
            }}
          />
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 92px",
          gap: 8,
          direction: "ltr",
          alignItems: "stretch",
        }}
      >
        <NumericKeypad
          onDigit={onDigit}
          onBackspace={onBackspace}
          buttonStyle={buttonStyle}
        />

        <ExpenseKeypadActions
          note={note}
          onEditNote={onEditNote}
          onAdd={onAdd}
          buttonStyle={buttonStyle}
        />
      </div>
    </div>
  );
}
