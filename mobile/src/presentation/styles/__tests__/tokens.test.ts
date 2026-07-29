import { colors, spacing } from '../tokens';

describe('design tokens', () => {
  it('exports core color tokens from DESIGN.md', () => {
    expect(colors.bgCream).toBe('#FCF8F4');
    expect(colors.serenityGreen60).toBe('#5A6838');
    expect(colors.mindfulBrown60).toBe('#6B5843');
  });

  it('exports spacing scale', () => {
    expect(spacing.md).toBe(16);
  });
});
