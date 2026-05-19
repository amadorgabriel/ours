import type { AxiosError } from 'axios';

export function getHttpErrorMessage(error: unknown) {
  const axiosError = error as AxiosError<{ message?: string }>;

  if (axiosError.response?.data?.message) {
    return axiosError.response.data.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unexpected HTTP error';
}
