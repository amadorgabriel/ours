import { colors, spacing, type } from '../tokens';

describe('design tokens', () => {
  it('exports core color tokens from DESIGN.md', () => {
    expect(colors.bgCream).toBe('#FCF8F4');
    expect(colors.serenityGreen60).toBe('#5A6838');
    expect(colors.mindfulBrown60).toBe('#6B5843');
  });

  it('exports spacing scale', () => {
    expect(spacing.md).toBe(16);
  });

  it('exports type styles from the existing font families', () => {
    expect(type.title.fontFamily).toBe('Urbanist_600SemiBold');
    expect(type.body.fontSize).toBe(14);
    expect(type.danger.color).toBe(colors.danger);
  });
});
