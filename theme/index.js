// theme/index.js
export const theme = {
  colors: {
    bg: "#F5F7FA",
    card: "#FFFFFF",
    primary: "#FF6B35",
    primaryInk: "#FFFFFF",
    accent: "#6EE7F9",
    ink: "#0A1628",
    sub: "#475569",
    disabled: "#B6CCE8",
    chipBg: "rgba(255, 107, 53, 0.08)",
    chipBorder: "rgba(255, 107, 53, 0.35)",
  },
  radius: { 
    m: 10, 
    l: 14, 
    xl: 20 
  },
  spacing: (n) => 8 * n,
};

export default theme;