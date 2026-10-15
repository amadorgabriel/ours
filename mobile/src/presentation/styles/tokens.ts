/** Design tokens — maps DESIGN.md §1 for NativeWind / runtime use */
export const colors = {
  bgCream: '#FCF8F4',
  serenityGreen60: '#5A6838',
  mindfulBrown60: '#6B5843',
  trustBlue60: '#2B5F8A',
  bgDarkGreen: '#2D3E26',
  textLight: '#FCF8F4',
  /** Matches NativeWind `text-red-600` used by form errors. */
  danger: '#DC2626',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
} as const;

export const fontFamily = {
  regular: 'Urbanist_400Regular',
  semibold: 'Urbanist_600SemiBold',
} as const;

/** Named text styles for `@expo/ui` Text, aligned with the NativeWind ramp. */
export const type = {
  title: {
    fontSize: 20,
    fontFamily: fontFamily.semibold,
    color: colors.mindfulBrown60,
  },
  body: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.mindfulBrown60,
  },
  caption: {
    fontSize: 12,
    fontFamily: fontFamily.regular,
    color: colors.mindfulBrown60,
  },
  danger: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.danger,
  },
  dangerCaption: {
    fontSize: 12,
    fontFamily: fontFamily.regular,
    color: colors.danger,
  },
} as const;
