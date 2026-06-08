import type { HttpMethod, HttpRequest, HttpResponse, IHttpClient } from './index.types';

type MockEntry = {
  method: HttpMethod;
  pattern: string | RegExp;
  response: HttpResponse<unknown>;
};

export class HttpClientMock implements IHttpClient {
  private mockResponses = new Map<string, MockEntry>();
  readonly requests: HttpRequest[] = [];
  delayMs = 0;

  setMockResponse<T>(
    url: string | RegExp,
    method: HttpMethod,
    response: HttpResponse<T>
  ): void {
    const key = `${method}:${url.toString()}`;
    this.mockResponses.set(key, { method, pattern: url, response });
  }

  private findMatchingResponse(method: string, url: string): HttpResponse<unknown> | null {
    for (const { method: storedMethod, pattern, response } of this.mockResponses.values()) {
      if (storedMethod.toLowerCase() !== method.toLowerCase()) continue;
      if (pattern instanceof RegExp) {
        if (pattern.test(url)) return response;
      } else if (url === pattern) {
        return response;
      }
    }
    return null;
  }

  async request<TResponse = unknown, TBody = unknown>(
    config: HttpRequest<TBody>
  ): Promise<HttpResponse<TResponse>> {
    this.requests.push(config);
    const mockResponse = this.findMatchingResponse(config.method, config.url);

    const payload: HttpResponse<TResponse> = mockResponse
      ? (mockResponse as HttpResponse<TResponse>)
      : {
          statusCode: 200,
          data: {} as TResponse,
        };

    if (this.delayMs <= 0) return payload;

    return new Promise((resolve) => {
      setTimeout(() => resolve(payload), this.delayMs);
    });
  }
}
