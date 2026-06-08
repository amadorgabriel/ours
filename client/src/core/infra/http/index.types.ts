export type HttpMethod = 'get' | 'put' | 'delete' | 'post' | 'patch';

export interface HttpRequest<TBody = unknown> {
  url: string;
  method: HttpMethod;
  body?: TBody;
  headers?: Record<string, string>;
  queryParams?: Record<string, string | number | boolean>;
  skipFamilyHeader?: boolean;
  skipAntiforgery?: boolean;
}

export interface HttpResponse<TData = unknown> {
  statusCode: number;
  data: TData;
  headers?: Record<string, string>;
}

export interface HttpError<TError = unknown> extends Error {
  statusCode?: number;
  data?: TError;
}

export interface IHttpClient {
  request<TResponse = unknown, TBody = unknown>(
    params: HttpRequest<TBody>
  ): Promise<HttpResponse<TResponse>>;
}
