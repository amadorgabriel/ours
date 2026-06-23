export const WAVE_TAB_BAR_HEIGHT = 64;
export const ACTIVE_TAB_CIRCLE_SIZE = 40;

export const tabItems = [
  {
    name: 'index',
    label: 'Ligações',
    icon: 'call-outline',
    activeIcon: 'call',
  },
  {
    name: 'calendar',
    label: 'Calendário',
    icon: 'calendar-outline',
    activeIcon: 'calendar',
  },
  {
    name: 'goals',
    label: 'Metas',
    icon: 'flag-outline',
    activeIcon: 'flag',
  },
  {
    name: 'profile',
    label: 'Perfil',
    icon: 'person-outline',
    activeIcon: 'person',
  },
] as const;

export type TabRouteName = (typeof tabItems)[number]['name'];
