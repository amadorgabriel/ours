import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';

import { NotificationSettings } from '../index';

jest.mock('@/core/infra/notifications/notification-service', () => ({
  loadReminderSettings: jest.fn(() =>
    Promise.resolve({
      enabled: false,
      time: { hour: 9, minute: 0 },
      frequency: 'daily',
    })
  ),
  requestNotificationPermission: jest.fn(),
  getExpoPushToken: jest.fn(),
  getDevicePlatform: jest.fn(() => 'ios'),
  saveReminderSettings: jest.fn(),
}));

jest.mock('@/core/services/usecases/device/index.hooks', () => ({
  useRegisterDevice: jest.fn(() => ({
    mutateAsync: jest.fn(),
  })),
}));

describe('NotificationSettings', () => {
  it('renders notification settings section', async () => {
    let tree!: renderer.ReactTestRenderer;

    await act(async () => {
      tree = renderer.create(<NotificationSettings />);
    });

    const text = tree.root
      .findAllByType(Text)
      .map((node) => (typeof node.props.children === 'string' ? node.props.children : ''))
      .join(' ');

    expect(text).toContain('Notificações');
    expect(text).toContain('Lembretes');
  });
});
