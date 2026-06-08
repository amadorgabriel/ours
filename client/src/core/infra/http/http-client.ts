import axios, { type AxiosError, type AxiosInstance } from 'axios';

import { getCachedAntiforgeryToken, setCachedAntiforgeryToken } from './antiforgery-store';
import { getActiveFamilyId } from './family-context';
import { HttpClientError } from './http-error';
import type { HttpRequest, HttpResponse, IHttpClient } from './index.types';

const MUTATION_METHODS = new Set(['post', 'put', 'patch', 'delete']);

function handleUnauthorized(): void {
  setCachedAntiforgeryToken(null);
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

export class HttpClient implements IHttpClient {
  private readonly client: AxiosInstance;

  constructor(baseUrl: string = '/api') {
    this.client = axios.create({
      baseURL: baseUrl,
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' },
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401 && !error.config?.skipUnauthorizedRedirect) {
          handleUnauthorized();
        }
        return Promise.reject(error);
      }
    );
  }

  private async ensureAntiforgeryToken(): Promise<string> {
    const cached = getCachedAntiforgeryToken();
    if (cached) return cached;

    const response = await this.client.get<{ requestToken: string }>('/auth/antiforgery');
    const token = response.data.requestToken;
    setCachedAntiforgeryToken(token);
    return token;
  }

  async request<TResponse = unknown, TBody = unknown>(
    config: HttpRequest<TBody>
  ): Promise<HttpResponse<TResponse>> {
    const { url, method, body, headers = {}, queryParams, skipFamilyHeader, skipAntiforgery, skipUnauthorizedRedirect } =
      config;

    const requestHeaders: Record<string, string> = { ...headers };

    if (!skipFamilyHeader) {
      const familyId = getActiveFamilyId();
      if (familyId) {
        requestHeaders['X-Family-Id'] = familyId;
      }
    }

    if (MUTATION_METHODS.has(method) && !skipAntiforgery) {
      const token = await this.ensureAntiforgeryToken();
      requestHeaders.RequestVerificationToken = token;
    }

    try {
      const response = await this.client.request<TResponse>({
        url,
        method,
        params: queryParams,
        data: body,
        headers: requestHeaders,
        skipUnauthorizedRedirect,
      });

      const responseHeaders: Record<string, string> = {};
      if (typeof response.headers?.toJSON === 'function') {
        Object.assign(responseHeaders, response.headers.toJSON());
      }

      return {
        statusCode: response.status,
        data: response.data,
        headers: responseHeaders,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new HttpClientError(error.message, {
          statusCode: error.response?.status,
          data: error.response?.data,
          cause: error,
        });
      }
      throw error;
    }
  }
}
