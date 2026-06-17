# Auth — Web Implementation

**Plataforma:** `web/` · **Status:** Concluído (M1)  
**Spec de produto:** [spec.md](spec.md)

## Implementação

| Requisito | Status | Localização |
|-----------|--------|-------------|
| AUTH-01 Login UI | ✅ | `presentation/modules/login/` |
| AUTH-02 Smart routing | ✅ | `resolvePostLoginRoute` |
| AUTH-03 Cookie + antiforgery | ✅ | `core/infra/http/`, `AuthProvider` |
| AUTH-04 Session restore | ✅ | `GET /auth/me` no boot |
| AUTH-05 Logout | ✅ | `logout.usecase.ts` |
| AUTH-06 Route guards | ✅ | `(auth)/`, `(app)/` layouts |
| AUTH-07 E2E manual | Deferred | Playwright |

## Rotas

| Path | Guard |
|------|-------|
| `/` | smart redirect |
| `/login` | GuestGuard |
| `/dashboard` | AuthGuard |
| `/onboarding` | AuthGuard |
| `/families/select` | AuthGuard |

## Change arquivado

`.specs/archive/003-login-logout-flow/`

## Gate

```bash
cd web && npm run pre-push:checks
```
