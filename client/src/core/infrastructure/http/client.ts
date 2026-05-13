import axios, { type AxiosError } from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? '';

export const httpClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

httpClient.interceptors.request.use((config) => config);

httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => Promise.reject(error)
);
