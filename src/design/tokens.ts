export const colors = {
  ink: "#14110f",
  inkMuted: "rgba(251, 247, 239, 0.68)",
  paper: "#fbf7ef",
  night: "#14110f",
  nightSoft: "#1d1916",
  nightRaised: "#26211d",
  clay: "#9e5f45",
  moss: "#5f6f52",
  brass: "#b9914a",
  cream: "#f4ead8",
  creamMuted: "rgba(244, 234, 216, 0.74)",
  ember: "#d29a5a",
  plum: "#6f5368",
  border: "rgba(244, 234, 216, 0.14)",
  borderStrong: "rgba(244, 234, 216, 0.28)",
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
  heading: {
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 30,
  },
  subheading: {
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 24,
  },
  caption: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
} as const;

export const radii = {
  sm: 4,
  md: 8,
  lg: 12,
} as const;
