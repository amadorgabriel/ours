# Change 003 — Login / Logout Flow

## Why

O client já tem domain, HTTP (cookie + antiforgery), use cases e `AuthProvider`, mas **não há fluxo utilizável**: o botão Google na home não faz nada, `/login` não existe (embora o interceptor 401 redirecione para lá), não há logout, nem guard de rotas, nem restauração de sessão ao recarregar a página.

Completar login/logout desbloqueia M1 (auth + smart routing) e serve de template para os demais módulos.

## What

1. Integrar Google Sign-In no client (`NEXT_PUBLIC_GOOGLE_CLIENT_ID`)
2. Página de login dedicada em `(auth)/login`
3. Fluxo completo: idToken → `POST /auth/google` → cookie `po_auth` → sessão em memória → smart routing
4. Restaurar sessão ao carregar app (`GET /auth/me`)
5. Logout: `POST /auth/logout` + limpar estado client (session, family, query cache, antiforgery)
6. Route guards: `(app)/*` exige auth; `(auth)/*` redireciona autenticados
7. Stub pages mínimas para destinos pós-login (`/onboarding`, `/dashboard`, `/families/select`)
8. Endpoints server correspondentes (cookie auth alinhado à spec, substituindo JWT-only no browser)

## Impact

| Área | Detalhe |
|------|---------|
| **Client** | `presentation/modules/auth`, rotas `(auth)`/`(app)`, `AuthProvider`, hooks, i18n |
| **Server** | Novos controllers `/auth/google`, `/auth/me`, `/auth/logout`, `/auth/antiforgery`; cookie + CORS credentials |
| **Risk** | Médio — gap atual server (JWT Bearer) vs spec (cookie HttpOnly) |
| **Breaking** | Home deixa de ser tela de login; landing redireciona ou linka para `/login` |

## Success

- [ ] Usuário faz login com Google e cai na rota correta (`resolvePostLoginRoute`)
- [ ] Recarregar página mantém sessão (via cookie + `/auth/me`)
- [ ] Logout limpa cookie e redireciona para `/login`
- [ ] Acesso a rota `(app)` sem sessão redireciona para `/login`
- [ ] `npm run pre-push:checks` passa
- [ ] Testes unitários cobrem novos use cases e guards

## References

- Feature spec: `.specs/features/auth/spec.md`
- Context (decisões): `.specs/changes/003-login-logout-flow/context.md`
- Design: `.specs/changes/003-login-logout-flow/design.md`
- Tasks: `.specs/changes/003-login-logout-flow/tasks.md`
