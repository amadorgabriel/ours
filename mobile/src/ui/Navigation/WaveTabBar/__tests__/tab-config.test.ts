import {
  CENTER_BUTTON_OFFSET,
  CENTER_BUTTON_SIZE,
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

  it('exports layout constants for M-T02 and M-T03', () => {
    expect(WAVE_TAB_BAR_HEIGHT).toBe(64);
    expect(CENTER_BUTTON_OFFSET).toBe(-20);
    expect(CENTER_BUTTON_SIZE).toBe(56);
  });
});
