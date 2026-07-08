export const colors = {
  ink: "#14110f",
  inkMuted: "rgba(20, 17, 15, 0.7)",
  paper: "#fbf7ef",
  clay: "#9e5f45",
  moss: "#5f6f52",
  brass: "#b9914a",
  border: "rgba(20, 17, 15, 0.12)",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 48,
  xxxl: 64,
  screenPadding: 24,
} as const;

export const typography = {
  eyebrow: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 2,
    lineHeight: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: "700",
    lineHeight: 42,
  },
  body: {
    fontSize: 18,
    fontWeight: "400",
    lineHeight: 28,
  },
} as const;

export const radii = {
  sm: 4,
  md: 8,
  lg: 12,
} as const;
