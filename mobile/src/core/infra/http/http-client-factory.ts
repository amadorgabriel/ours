import { HttpClient } from './http-client';
import type { IHttpClient } from './index.types';

export class HttpClientFactory {
  private static instance: IHttpClient | null = null;

  static create(): IHttpClient {
    if (!this.instance) {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5280/api';
      this.instance = new HttpClient(baseUrl);
    }
    return this.instance;
  }

  static reset(): void {
    this.instance = null;
  }
}
