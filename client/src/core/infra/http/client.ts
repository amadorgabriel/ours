import axios, { type AxiosError } from 'axios';

import { getActiveFamilyIdSnapshot } from '@/presentation/stores/activeFamilyStore';

export const httpClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

httpClient.interceptors.request.use((config) => {
  const familyId = getActiveFamilyIdSnapshot();

  if (familyId) {
    config.headers.set('X-Family-Id', familyId);
  }

  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => Promise.reject(error),
);
