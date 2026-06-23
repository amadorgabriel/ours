export const WAVE_TAB_BAR_HEIGHT = 64;
export const ACTIVE_TAB_CIRCLE_SIZE = 40;

export const tabItems = [
  {
    name: 'index',
    labelKey: 'tabs.activities',
    icon: 'pulse-outline',
    activeIcon: 'pulse',
  },
  {
    name: 'calendar',
    labelKey: 'tabs.calendar',
    icon: 'calendar-outline',
    activeIcon: 'calendar',
  },
  {
    name: 'goals',
    labelKey: 'tabs.goals',
    icon: 'flag-outline',
    activeIcon: 'flag',
  },
  {
    name: 'profile',
    labelKey: 'tabs.profile',
    icon: 'person-outline',
    activeIcon: 'person',
  },
] as const;

export type TabRouteName = (typeof tabItems)[number]['name'];
