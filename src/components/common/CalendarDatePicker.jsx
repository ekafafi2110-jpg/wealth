import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import visualIdentity from "../../theme/visualIdentity";

const pad = (value) => String(value).padStart(2, "0");
const currentDateParts = () => {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
};

const parseDateParts = (value) => {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return currentDateParts();
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
};

const daysInMonth = (year, month) => new Date(year, month, 0).getDate();

export default function CalendarDatePicker({
  value,
  onChange,
  label = "اختيار تاريخ الاستحقاق",
}) {
  const selected = Boolean(value);
  const [open, setOpen] = useState(false);
  const initialParts = useMemo(() => parseDateParts(value), [value]);
  const [draft, setDraft] = useState(initialParts);

  const openCalendar = () => {
    setDraft(parseDateParts(value));
    setOpen(true);
  };

  const updateDraft = (patch) => {
    setDraft((current) => {
      const next = { ...current, ...patch };
      const maxDay = daysInMonth(next.year, next.month);
      return { ...next, day: Math.min(next.day, maxDay) };
    });
  };

  const saveDate = () => {
    onChange(`${draft.year}-${pad(draft.month)}-${pad(draft.day)}`);
    setOpen(false);
  };

  const years = Array.from({ length: 9 }, (_, index) => currentDateParts().year - 2 + index);
  const dayCount = daysInMonth(draft.year, draft.month);

  return (
    <>
      <button
        type="button"
        onClick={openCalendar}
        aria-label={label}
        title={selected ? `${label}: ${value}` : label}
        style={{
          position: "relative",
          width: 42,
          height: 42,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 12,
          border: selected
            ? `1.5px solid ${visualIdentity.colors.gold}`
            : "1px solid rgba(255,255,255,0.18)",
          background: selected
            ? "rgba(255,198,45,0.14)"
            : "rgba(255,255,255,0.08)",
          color: selected
            ? visualIdentity.colors.gold
            : visualIdentity.colors.textSecondary,
          cursor: "pointer",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="5" width="18" height="16" rx="3" />
          <path d="M8 3v4M16 3v4M3 10h18" />
          {selected && <path d="m8.5 15 2 2 5-5" />}
        </svg>
      </button>

      {open && createPortal(
        <div
          className="calendar-date-picker-modal"
          onClick={(event) => event.target === event.currentTarget && setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            width: "100%",
            height: "100dvh",
            zIndex: 1810,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            padding: "14px 12px calc(14px + env(safe-area-inset-bottom))",
            overflowY: "auto",
            overscrollBehavior: "contain",
            background: "rgba(3,18,37,0.72)",
            backdropFilter: "blur(12px)",
            direction: "rtl",
          }}
        >
          <section
            style={{
              width: "100%",
              maxWidth: 390,
              borderRadius: "22px 22px 18px 18px",
              border: visualIdentity.cards.outer.border,
              background: visualIdentity.gradients.appBackground,
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.14), 0 18px 44px rgba(4,18,36,0.38)",
              padding: 14,
              maxHeight: "calc(100dvh - 28px - env(safe-area-inset-bottom))",
              overflowY: "auto",
              flexShrink: 0,
            }}
          >
            <strong
              style={{
                display: "block",
                marginBottom: 12,
                color: visualIdentity.colors.gold,
                fontSize: 16,
                fontWeight: 900,
                textAlign: "right",
              }}
            >
              {label}
            </strong>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              <PickerSelect
                label="اليوم"
                value={draft.day}
                onChange={(day) => updateDraft({ day })}
                options={Array.from({ length: dayCount }, (_, index) => index + 1)}
              />
              <PickerSelect
                label="الشهر"
                value={draft.month}
                onChange={(month) => updateDraft({ month })}
                options={Array.from({ length: 12 }, (_, index) => index + 1)}
              />
              <PickerSelect
                label="السنة"
                value={draft.year}
                onChange={(year) => updateDraft({ year })}
                options={years}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                marginTop: 12,
              }}
            >
              <button type="button" onClick={() => setOpen(false)} style={secondaryButtonStyle}>
                إلغاء
              </button>
              <button type="button" onClick={saveDate} style={primaryButtonStyle}>
                تأكيد
              </button>
            </div>
          </section>
        </div>,
        document.body
      )}
    </>
  );
}

function PickerSelect({ label, value, onChange, options }) {
  return (
    <label style={{ color: visualIdentity.colors.textSecondary, fontSize: 9, fontWeight: 800 }}>
      {label}
      <select
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{
          width: "100%",
          minHeight: 42,
          marginTop: 4,
          borderRadius: 13,
          border: "1px solid rgba(255,255,255,0.18)",
          background: "rgba(255,255,255,0.09)",
          color: visualIdentity.colors.white,
          fontFamily: "inherit",
          fontSize: 12,
          fontWeight: 900,
          outline: "none",
          textAlign: "center",
        }}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

const secondaryButtonStyle = {
  minHeight: 42,
  borderRadius: 13,
  border: "1px solid rgba(255,255,255,0.16)",
  background: "rgba(255,255,255,0.08)",
  color: visualIdentity.colors.white,
  fontFamily: "inherit",
  fontSize: 12,
  fontWeight: 900,
  cursor: "pointer",
};

const primaryButtonStyle = {
  minHeight: 42,
  borderRadius: 13,
  border: `1px solid ${visualIdentity.colors.gold}`,
  background: visualIdentity.gradients.gold,
  color: visualIdentity.colors.blueDeep,
  fontFamily: "inherit",
  fontSize: 12,
  fontWeight: 950,
  cursor: "pointer",
  boxShadow: "0 8px 20px rgba(228,169,0,0.22)",
};
