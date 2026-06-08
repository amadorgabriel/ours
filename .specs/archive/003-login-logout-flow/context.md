# Context — Login / Logout (decisões de gray areas)

Decisões tomadas para destravar design e tasks. Revisar se alguma divergir da intenção do produto.

## D1 — Google Sign-In no browser

**Decisão:** `@react-oauth/google` com `GoogleOAuthProvider` no `RootProvider` e botão `GoogleLogin` (ou hook `useGoogleLogin` com popup).

**Motivo:** Padrão React maduro; `NEXT_PUBLIC_GOOGLE_CLIENT_ID` já está no `.env.example`; evita carregar script GSI manualmente.

**Alternativa descartada:** Redirect OAuth server-side — mais complexo para MVP PWA.

## D2 — Onde fica a tela de login

**Decisão:** Rota dedicada `/login` em `app/[locale]/(auth)/login/page.tsx` + módulo `presentation/modules/auth/login`.

**Motivo:** Interceptor 401 já redireciona para `/login`. Home (`/`) permanece landing com CTA que leva a `/login`.

## D3 — Restauração de sessão

**Decisão:** `GET /auth/me` retorna `AuthSessionModel` se cookie `po_auth` válido; `AuthProvider` chama no mount via `useSession` (React Query).

**Motivo:** Cookie HttpOnly não é legível no JS; sessão em memória precisa ser reidratada do server.

## D4 — Logout

**Decisão:** `POST /auth/logout` invalida cookie no server; client chama use case, depois `clearSession`, `setFamilyId(null)`, `queryClient.clear()`, `setCachedAntiforgeryToken(null)`, redirect `/login`.

**Motivo:** Segurança — cookie só o server apaga; client limpa caches derivados.

## D5 — Proteção de rotas

**Decisão:** Guards **client-side** em layouts `(app)/layout.tsx` e `(auth)/layout.tsx` usando `useAuth` + `useSession` loading state.

**Motivo:** Auth é cookie-based; middleware Next não tem acesso ao cookie de API cross-origin sem proxy. Fase futura: middleware se API for same-origin via rewrite.

**Nota:** Adicionar `rewrites` em `next.config.ts` (`/api` → `NEXT_PUBLIC_API_URL`) para dev same-origin e simplificar cookies.

## D6 — Família ativa pós-login

**Decisão:** Se `familyCount === 1`, `FamilyProvider.setFamilyId(families[0].id)` automaticamente no sucesso do login / restore.

**Motivo:** Alinha com smart routing para dashboard e header `X-Family-Id`.

## D7 — Escopo server neste change

**Decisão:** Incluir endpoints server mínimos — não shippar só com mocks.

**Motivo:** Cookie auth exige server; JWT Bearer atual não atende a spec. Client mocks permanecem para testes unitários.

## D8 — Feedback de erro

**Decisão:** Toast/Alert via componente `ui/Feedback` (wrapper Mantine notifications) em falha de login/logout.

**Motivo:** ec-v3-ui usa toast; manter UX consistente sem bloquear fluxo.
