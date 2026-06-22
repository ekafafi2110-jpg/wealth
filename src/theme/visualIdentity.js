export const visualIdentity = {
  colors: {
    blueDeep: "#123A6B",
    blueMid: "#2D6197",
    blueLight: "#3A74A6",
    navy: "#0B2B52",
    gold: "#FFC62D",
    goldDark: "#D9A900",
    white: "#FFFFFF",
    cyan: "#55D9FF",
    green: "#4CE58C",
    purple: "#A879FF",
    coral: "#FF7A78",
    sky: "#61B8FF",
    red: "#FF7070",
    glassStrong: "rgba(255,255,255,0.16)",
    glassSoft: "rgba(255,255,255,0.08)",
    textSecondary: "rgba(255,255,255,0.72)",
    textFaint: "rgba(255,255,255,0.48)",
  },
  semantic: {
    info: "#0D6DCF",
    success: "#04C95C",
    warning: "#FFD12B",
    danger: "#FF7070",
  },
  gradients: {
    outerCard:
      "linear-gradient(145deg, #3478B8 0%, #245B98 52%, #17477F 100%)",
    appBackground:
      "linear-gradient(180deg, #0B4B89 0%, #123F76 48%, #082A55 100%)",
    innerCard:
      "linear-gradient(145deg, rgba(105,188,255,0.18), rgba(255,255,255,0.075))",
    glassTrack:
      "linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.08))",
    gold: "linear-gradient(135deg, #FFD348 0%, #FFB800 100%)",
    positive: "linear-gradient(135deg, rgba(76,229,140,0.28), rgba(24,105,92,0.18))",
    data: "linear-gradient(135deg, rgba(85,217,255,0.28), rgba(34,95,157,0.18))",
    investment: "linear-gradient(135deg, rgba(168,121,255,0.28), rgba(66,65,151,0.18))",
    warning: "linear-gradient(135deg, rgba(255,198,45,0.25), rgba(112,81,13,0.16))",
  },
  cards: {
    outer: {
      border: "1px solid rgba(255,255,255,0.18)",
      borderRadius: 20,
      boxShadow:
        "inset 0 1px 0 rgba(255,255,255,0.12), 0 12px 26px rgba(4,24,48,0.22)",
    },
    inner: {
      border: "1px solid rgba(255,255,255,0.15)",
      borderRadius: 18,
      boxShadow:
        "inset 0 1px 0 rgba(255,255,255,0.10), 0 8px 20px rgba(5,25,51,0.15)",
    },
  },
  layout: {
    screenPadding: 14,
    sectionGap: 14,
    controlRadius: 14,
  },
  typography: {
    fontFamily: "'Tajawal', sans-serif",
    titleWeight: 800,
    bodyWeight: 700,
    titleColor: "#FFFFFF",
    bodyColor: "#FFFFFF",
    textShadow: "0 1px 2px rgba(0,0,0,0.22)",
    onDarkTitle: {
      fontFamily: "'Tajawal', sans-serif",
      color: "#FFFFFF",
      fontWeight: 800,
      textShadow: "0 1px 2px rgba(0,0,0,0.22)",
    },
    onDarkBody: {
      fontFamily: "'Tajawal', sans-serif",
      color: "#FFFFFF",
      fontWeight: 700,
      textShadow: "0 1px 2px rgba(0,0,0,0.22)",
    },
    onDarkSecondary: {
      fontFamily: "'Tajawal', sans-serif",
      color: "rgba(255,255,255,0.78)",
      fontWeight: 700,
    },
  },
  lighting: {
    cardSheen: "rgba(255,255,255,0.16)",
    ambientBeam: "rgba(72,196,255,0.12)",
    hoverBorder: "rgba(158,225,255,0.62)",
    hoverGlow: "rgba(55,183,255,0.12)",
    iconBrightnessFrom: 0.96,
    iconBrightnessTo: 1.14,
    iconSaturationTo: 1.18,
  },
  motion: {
    pageEntryDuration: "240ms",
    cardSheenDuration: "8s",
    iconGlowDuration: "3.6s",
    ambientLightDuration: "14s",
    hoverDuration: "180ms",
    staggerStep: "1.2s",
    reducedMotionMedia: "(prefers-reduced-motion: reduce)",
  },
};

export default visualIdentity;
