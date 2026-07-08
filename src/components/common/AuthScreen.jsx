import visualIdentity from "../../theme/visualIdentity";

export default function AuthScreen({
  email,
  password,
  mode,
  loading,
  error,
  notice,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onToggleMode,
  onPasswordReset,
  appStyle,
}) {
  const signingUp = mode === "signup";
  const { colors, gradients } = visualIdentity;

  const fieldWrap = {
    position: "relative",
    marginBottom: 14,
    textAlign: "right",
  };
  const labelStyle = {
    position: "absolute",
    top: -13,
    right: 26,
    padding: "0 10px",
    color: colors.navy,
    background: "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(226,239,249,0.96))",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 800,
    textShadow: "0 1px 0 rgba(255,255,255,0.9)",
    zIndex: 1,
  };
  const inputStyle = {
    width: "100%",
    height: 44,
    border: 0,
    borderRadius: 24,
    outline: "none",
    padding: "0 22px",
    direction: "ltr",
    textAlign: "left",
    color: colors.navy,
    background: "linear-gradient(145deg, #eef7ff, #ffffff)",
    boxShadow:
      "inset 6px 6px 12px rgba(0,0,0,0.10), inset -8px -8px 14px rgba(255,255,255,0.92)",
    fontFamily: "inherit",
    fontSize: 15,
    fontWeight: 700,
  };

  return (
    <div
      style={{
      ...appStyle,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 18,
        background: gradients.appBackground,
        direction: "rtl",
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          width: "clamp(340px, 86vw, 390px)",
          height: "clamp(340px, 86vw, 390px)",
          maxWidth: 390,
          maxHeight: 390,
          padding: "clamp(44px, 12vw, 54px) clamp(30px, 9vw, 38px) 30px",
          borderRadius: "50%",
          background: "linear-gradient(145deg, #f7fbff, #d8e7f3)",
          boxShadow:
            "18px 18px 35px rgba(3,18,37,0.28), -12px -12px 25px rgba(145,215,255,0.20), inset 2px 2px 4px rgba(255,255,255,0.78), inset -3px -3px 6px rgba(11,43,82,0.10)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 13,
            borderRadius: "50%",
            boxShadow: `inset 10px 10px 22px rgba(11,43,82,0.10), inset -10px -10px 22px rgba(255,255,255,0.88), 0 0 0 1px ${colors.gold}22`,
            pointerEvents: "none",
          }}
        />

        <h1
          style={{
            margin: "0 0 26px",
            color: colors.navy,
            fontSize: 31,
            fontWeight: 950,
            letterSpacing: 0,
            textShadow: `0 2px 2px rgba(11,43,82,0.20), 0 -1px 0 rgba(255,255,255,0.95)`,
            position: "relative",
          }}
        >
          {signingUp ? "إنشاء حساب" : "Login"}
        </h1>

        <div style={{ position: "relative" }}>
          <div style={fieldWrap}>
            <span style={labelStyle}>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              placeholder="name@example.com"
              required
              style={inputStyle}
            />
          </div>
          <div style={fieldWrap}>
            <span style={labelStyle}>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              style={inputStyle}
            />
          </div>
        </div>

        {(error || notice) && (
          <div
            style={{
              minHeight: 18,
            margin: "-4px 24px 7px",
              color: error ? "#b43737" : "#16814e",
              fontSize: 10,
              fontWeight: 800,
              lineHeight: 1.5,
              position: "relative",
            }}
          >
            {error || notice}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            height: 48,
            border: 0,
            borderRadius: 28,
            background: gradients.gold,
            color: colors.navy,
            boxShadow:
              "9px 9px 18px rgba(11,43,82,0.18), -9px -9px 18px rgba(255,255,255,0.58), inset 1px 1px 0 rgba(255,255,255,0.86)",
            fontFamily: "inherit",
            fontSize: 17,
            fontWeight: 950,
            cursor: loading ? "default" : "pointer",
            opacity: loading ? 0.72 : 1,
            position: "relative",
          }}
        >
          {loading ? "جاري الدخول" : signingUp ? "إنشاء حساب" : "Sign In"}
        </button>

        <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 12, position: "relative" }}>
          <button type="button" onClick={onToggleMode} style={linkButtonStyle}>
            {signingUp ? "لدي حساب" : "حساب جديد"}
          </button>
          <button type="button" onClick={onPasswordReset} disabled={loading} style={linkButtonStyle}>
            استعادة المرور
          </button>
        </div>
      </form>
    </div>
  );
}

const linkButtonStyle = {
  border: "none",
  background: "transparent",
  color: "#4b4e54",
  fontFamily: "inherit",
  fontSize: 11,
  fontWeight: 900,
  cursor: "pointer",
  textShadow: "0 1px 0 rgba(255,255,255,0.82)",
};
