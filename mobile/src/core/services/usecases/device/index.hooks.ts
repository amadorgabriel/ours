import { useMutation } from '@tanstack/react-query';

import type { RegisterDeviceRequest } from '@/core/domain/device';
import { HttpClientFactory } from '@/core/infra/http/http-client-factory';

import { RegisterDeviceUseCase } from './register-device.usecase';

export function useRegisterDevice() {
  const httpClient = HttpClientFactory.create();
  const useCase = new RegisterDeviceUseCase(httpClient);

  return useMutation({
    mutationFn: (data: RegisterDeviceRequest) => useCase.registerDevice(data),
  });
}
