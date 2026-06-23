import {
  ACTIVE_TAB_CIRCLE_SIZE,
  tabItems,
  WAVE_TAB_BAR_HEIGHT,
} from '../tab-config';

describe('WaveTabBar tab-config', () => {
  it('defines four tabs matching mobile.md §2', () => {
    expect(tabItems).toHaveLength(4);
    expect(tabItems.map((tab) => tab.label)).toEqual([
      'Ligações',
      'Calendário',
      'Metas',
      'Perfil',
    ]);
  });

  it('exports layout constants for tab bar', () => {
    expect(WAVE_TAB_BAR_HEIGHT).toBe(64);
    expect(ACTIVE_TAB_CIRCLE_SIZE).toBe(40);
  });
});
