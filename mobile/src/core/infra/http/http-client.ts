import axios, { type AxiosError, type AxiosInstance } from 'axios';

import { getAuthToken } from './auth-token-context';
import { getActiveFamilyId } from './family-context';
import { HttpClientError } from './http-error';
import type { HttpRequest, HttpResponse, IHttpClient } from './index.types';

export const MOBILE_PLATFORM_HEADER = 'X-Client-Platform';
export const MOBILE_PLATFORM_VALUE = 'mobile';

export class HttpClient implements IHttpClient {
  private readonly client: AxiosInstance;

  constructor(baseUrl: string = '/api') {
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
        [MOBILE_PLATFORM_HEADER]: MOBILE_PLATFORM_VALUE,
      },
    });
  }

  async request<TResponse = unknown, TBody = unknown>(
    config: HttpRequest<TBody>
  ): Promise<HttpResponse<TResponse>> {
    const {
      url,
      method,
      body,
      headers = {},
      queryParams,
      skipFamilyHeader,
      skipAuthHeader,
    } = config;

    const requestHeaders: Record<string, string> = {
      [MOBILE_PLATFORM_HEADER]: MOBILE_PLATFORM_VALUE,
      ...headers,
    };

    if (!skipAuthHeader) {
      const token = getAuthToken();
      if (token) {
        requestHeaders.Authorization = `Bearer ${token}`;
      }
    }

    if (!skipFamilyHeader) {
      const familyId = getActiveFamilyId();
      if (familyId) {
        requestHeaders['X-Family-Id'] = familyId;
      }
    }

    try {
      const response = await this.client.request<TResponse>({
        url,
        method,
        params: queryParams,
        data: body,
        headers: requestHeaders,
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
