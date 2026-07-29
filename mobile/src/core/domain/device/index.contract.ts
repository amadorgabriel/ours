import type { RegisterDeviceRequest, RegisterDeviceResponse } from './index';

export interface IDevice {
  registerDevice(params: RegisterDeviceRequest): Promise<RegisterDeviceResponse>;
}
