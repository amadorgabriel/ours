import { HttpClient } from './http-client';
import { HttpClientMock } from './http-client-mock';
import type { IHttpClient } from './index.types';

export class HttpClientFactory {
  private static instance: IHttpClient | null = null;
  private static mockInstance: HttpClientMock | null = null;

  static create(): IHttpClient {
    if (!this.instance) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? '/api';
      this.instance = new HttpClient(baseUrl);
    }
    return this.instance;
  }

  static createMock(): HttpClientMock {
    if (!this.mockInstance) {
      this.mockInstance = new HttpClientMock();
    }
    return this.mockInstance;
  }

  static reset(): void {
    this.instance = null;
    this.mockInstance = null;
  }
}
