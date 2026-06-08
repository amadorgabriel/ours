import type {
  AntiforgeryResponse,
  GoogleAuthRequest,
  GoogleAuthResponse,
} from './index';

export interface IAuth {
  getAntiforgeryToken(): Promise<AntiforgeryResponse>;
  loginWithGoogle(params: GoogleAuthRequest): Promise<GoogleAuthResponse>;
}
