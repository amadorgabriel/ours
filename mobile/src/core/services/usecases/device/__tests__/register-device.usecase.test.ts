import type { Device } from '@/core/domain/device';
import type { IHttpClient } from '@/core/infra/http/index.types';

import { RegisterDeviceUseCase } from '../register-device.usecase';

describe('RegisterDeviceUseCase', () => {
  it('registers device via POST /devices', async () => {
    const device: Device = {
      id: 'device-1',
      pushToken: 'ExponentPushToken[abc]',
      platform: 'ios',
      updatedAt: '2026-06-18T12:00:00.000Z',
    };
    const request = jest.fn().mockResolvedValue({ statusCode: 200, data: device });
    const httpClient: IHttpClient = { request };

    const useCase = new RegisterDeviceUseCase(httpClient);
    const result = await useCase.registerDevice({
      pushToken: 'ExponentPushToken[abc]',
      platform: 'ios',
    });

    expect(request).toHaveBeenCalledWith({
      method: 'post',
      url: '/devices',
      body: { pushToken: 'ExponentPushToken[abc]', platform: 'ios' },
    });
    expect(result).toEqual(device);
  });
});
