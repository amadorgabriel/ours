import 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipUnauthorizedRedirect?: boolean;
  }
}
