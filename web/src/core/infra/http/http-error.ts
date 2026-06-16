import type { HttpError } from './index.types';

export class HttpClientError extends Error implements HttpError {
  statusCode?: number;
  data?: unknown;

  constructor(message: string, options?: { statusCode?: number; data?: unknown; cause?: unknown }) {
    super(message, { cause: options?.cause });
    this.name = 'HttpClientError';
    this.statusCode = options?.statusCode;
    this.data = options?.data;
  }
}
