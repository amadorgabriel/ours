import type { RegisterDeviceRequest, RegisterDeviceResponse } from '@/core/domain/device';
import type { IDevice } from '@/core/domain/device/index.contract';
import type { IHttpClient } from '@/core/infra/http/index.types';

export class RegisterDeviceUseCase implements Pick<IDevice, 'registerDevice'> {
  constructor(private readonly httpClient: IHttpClient) {}

  async registerDevice(params: RegisterDeviceRequest): Promise<RegisterDeviceResponse> {
    const response = await this.httpClient.request<RegisterDeviceResponse>({
      method: 'post',
      url: '/devices',
      body: params,
    });

    return response.data;
  }
}
