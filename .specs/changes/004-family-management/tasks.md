# Tasks — Change 004 Family Management

**Spec:** `.specs/changes/004-family-management/spec.md`  
**Design:** `.specs/changes/004-family-management/design.md`  
**Gate:** `cd client && npm run pre-push:checks` + `cd server && dotnet test`

## Execution Plan

```
Phase 1 — Foundation
  T1 [P]  i18n namespace family
  T2 [P]  client domain + IFamily contract extensions
  T3      IFamilyRepository + FamilyRepository (EF)

Phase 2 — Server application
  T4      FamilyService.CreateFamily + validation
  T5      FamilyService.ListMine
  T6      FamilyService.CreateInvite + InviteCodeGenerator
  T7      FamilyService.JoinWithCode
  T8      FamilyService unit tests

Phase 3 — Server API
  T9      FamiliesController (POST, GET my)
  T10     InvitesController (POST invite, POST join)
  T11     Bruno collection entries

Phase 4 — Client use cases
  T12 [P] create-family.usecase + test
  T13 [P] list-families.usecase + test
  T14 [P] create-invite.usecase + test
  T15 [P] join-family.usecase + test
  T16      hooks + mocks + session invalidation

Phase 5 — Client UI
  T17     OnboardingPage (create + join)
  T18     FamilySelectPage
  T19     InviteModal + dashboard Admin CTA
  T20     Wire routes + manual smoke checklist
```

## Granularity Check

| Task | Atomic? | One deliverable |
|------|---------|-----------------|
| T1–T20 | ✅ | Um arquivo/conceito por task |

## Diagram-Definition Cross-Check

| Task | Depends on | In diagram |
|------|------------|------------|
| T1 | — | Phase 1 |
| T2 | — | Phase 1 |
| T3 | — | Phase 1 |
| T4 | T3 | Phase 2 |
| T5 | T3 | Phase 2 |
| T6 | T3 | Phase 2 |
| T7 | T3 | Phase 2 |
| T8 | T4, T5, T6, T7 | Phase 2 |
| T9 | T4, T5 | Phase 3 |
| T10 | T6, T7 | Phase 3 |
| T11 | T9, T10 | Phase 3 |
| T12 | T2 | Phase 4 |
| T13 | T2 | Phase 4 |
| T14 | T2 | Phase 4 |
| T15 | T2 | Phase 4 |
| T16 | T12–T15 | Phase 4 |
| T17 | T1, T16 | Phase 5 |
| T18 | T1, T13, T16 | Phase 5 |
| T19 | T1, T14, T16 | Phase 5 |
| T20 | T9–T19 | Phase 5 |

## Test Co-location Validation

| Task | Layer | Tests in Done When | TESTING.md |
|------|-------|-------------------|------------|
| T8 | server service | `FamilyServiceTests.cs` | unit ✅ |
| T12 | usecase | `create-family.usecase.test.ts` | unit ✅ |
| T13 | usecase | `list-families.usecase.test.ts` | unit ✅ |
| T14 | usecase | `create-invite.usecase.test.ts` | unit ✅ |
| T15 | usecase | `join-family.usecase.test.ts` | unit ✅ |
| T17–T19 | module | component test where non-trivial | unit ✅ |
| T9–T10 | API | gate: dotnet build + optional integration | gate ✅ |

---

## Tasks

### T1: i18n namespace `family` [P]

**What:** Strings pt-BR para onboarding, select, invite, erros.  
**Where:** `client/messages/pt-BR.json` (ou estrutura next-intl existente)  
**Depends on:** None  
**Requirement:** FAM-01, FAM-02, FAM-03, FAM-04

**Done when:**

- [ ] Chaves `family.onboarding.*`, `family.select.*`, `family.invite.*`
- [ ] Sem strings hardcoded nos módulos family

**Tests:** none  
**Gate:** quick (`npm run type-check`)

---

### T2: Domain + contract extensions [P]

**What:** DTOs invite/join/list; estender `IFamily`.  
**Where:** `client/src/core/domain/family/`  
**Depends on:** None  
**Reuses:** `index.ts`, `index.contract.ts` existentes  
**Requirement:** FAM-01–FAM-04

**Done when:**

- [ ] Tipos exportados conforme design.md
- [ ] `IFamily`: `create`, `listMine`, `createInvite`, `join`

**Tests:** none  
**Gate:** quick

---

### T3: FamilyRepository (EF)

**What:** Implementar `IFamilyRepository` — insert family+membership, list by user, invite CRUD queries.  
**Where:** `server/src/ProjectOurs.Application/Abstractions/`, `Infrastructure/Persistence/`  
**Depends on:** None  
**Reuses:** `ApplicationDbContext`, entidades Domain

**Done when:**

- [ ] Registrado em DI
- [ ] `dotnet build` passa

**Tests:** none (covered in T8)  
**Gate:** `dotnet build`

---

### T4: FamilyService.CreateFamily

**What:** Criar Family + Membership Admin; validar nome 1–100.  
**Where:** `server/src/ProjectOurs.Application/Family/`  
**Depends on:** T3  
**Requirement:** FAM-01, FAM-05

**Done when:**

- [ ] Retorna `FamilyDto`
- [ ] `AdminId` = userId criador

**Tests:** covered in T8  
**Gate:** T8

---

### T5: FamilyService.ListMine

**What:** Listar famílias do usuário com role.  
**Where:** `server/src/ProjectOurs.Application/Family/`  
**Depends on:** T3  
**Requirement:** FAM-03

**Done when:**

- [ ] Retorna `FamilyWithRoleDto[]`

**Tests:** covered in T8  
**Gate:** T8

---

### T6: FamilyService.CreateInvite + InviteCodeGenerator

**What:** Gerar código 6 chars A-Z0-9, ExpiresAt +24h, status Pending; validar Admin.  
**Where:** `server/src/ProjectOurs.Application/Family/`  
**Depends on:** T3  
**Requirement:** FAM-04, FAM-07, FAM-08

**Done when:**

- [ ] Unicidade de código com retry
- [ ] 403 se não Admin da família

**Tests:** covered in T8  
**Gate:** T8

---

### T7: FamilyService.JoinWithCode

**What:** Validar código, expiração, membership duplicada; criar Member.  
**Where:** `server/src/ProjectOurs.Application/Family/`  
**Depends on:** T3  
**Requirement:** FAM-02, FAM-08

**Done when:**

- [ ] Marca invite Accepted
- [ ] 409 se já membro

**Tests:** covered in T8  
**Gate:** T8

---

### T8: FamilyService unit tests

**What:** xUnit para create, invite, join, validações.  
**Where:** `server/tests/ProjectOurs.UnitTests/Application/FamilyServiceTests.cs`  
**Depends on:** T4, T5, T6, T7

**Done when:**

- [ ] Casos: nome inválido, código expirado, não-admin, join ok
- [ ] Gate: `dotnet test --filter FamilyService`

**Tests:** unit  
**Gate:** full (`dotnet test`)

---

### T9: FamiliesController

**What:** `POST /api/families`, `GET /api/families/my`.  
**Where:** `server/src/ProjectOurs.API/Controllers/FamiliesController.cs`  
**Depends on:** T4, T5  
**Requirement:** FAM-01, FAM-03

**Done when:**

- [ ] `[Authorize]` em ambos
- [ ] Antiforgery em POST

**Tests:** optional integration  
**Gate:** `dotnet build`

---

### T10: InvitesController

**What:** `POST /api/invite` (+ X-Family-Id), `POST /api/join`.  
**Where:** `server/src/ProjectOurs.API/Controllers/InvitesController.cs`  
**Depends on:** T6, T7  
**Requirement:** FAM-02, FAM-04, FAM-07

**Done when:**

- [ ] Header `X-Family-Id` validado em invite
- [ ] Erros conforme design.md

**Tests:** optional integration  
**Gate:** `dotnet build`

---

### T11: Bruno collection [P]

**What:** Requests families + invite + join.  
**Where:** `server/collections/bruno/` (criar se ausente)  
**Depends on:** T9, T10

**Done when:**

- [ ] 4 requests documentados com exemplos

**Tests:** none  
**Gate:** manual

---

### T12: create-family.usecase + test [P]

**What:** POST `/api/families`.  
**Where:** `client/src/core/services/usecases/family/`  
**Depends on:** T2  
**Requirement:** FAM-01

**Done when:**

- [ ] Teste Vitest mock HTTP
- [ ] Gate: `npm run test:run -- create-family`

**Tests:** unit  
**Gate:** quick

---

### T13: list-families.usecase + test [P]

**What:** GET `/api/families/my`.  
**Where:** `client/src/core/services/usecases/family/`  
**Depends on:** T2  
**Requirement:** FAM-03

**Done when:**

- [ ] Teste Vitest passa

**Tests:** unit  
**Gate:** quick

---

### T14: create-invite.usecase + test [P]

**What:** POST `/api/invite` com family header.  
**Where:** `client/src/core/services/usecases/family/`  
**Depends on:** T2  
**Requirement:** FAM-04

**Done when:**

- [ ] Teste Vitest passa

**Tests:** unit  
**Gate:** quick

---

### T15: join-family.usecase + test [P]

**What:** POST `/api/join`.  
**Where:** `client/src/core/services/usecases/family/`  
**Depends on:** T2  
**Requirement:** FAM-02

**Done when:**

- [ ] Normaliza código uppercase
- [ ] Teste Vitest passa

**Tests:** unit  
**Gate:** quick

---

### T16: Hooks, mocks, session invalidation

**What:** `useCreateFamily`, `useJoinFamily`, `useCreateInvite`, `useMyFamilies`; invalidar auth query on success.  
**Where:** `client/src/core/services/usecases/family/index.hooks.ts`, `index.mock.ts`  
**Depends on:** T12–T15  
**Reuses:** `applyActiveFamilyFromSession`, auth query keys  
**Requirement:** FAM-06

**Done when:**

- [ ] Mutations chamam refetch `/auth/me`
- [ ] Mocks MSW/handlers atualizados

**Tests:** unit (hooks se padrão existir)  
**Gate:** quick

---

### T17: OnboardingPage

**What:** Substituir stub — forms create + join.  
**Where:** `client/src/presentation/modules/family/onboarding/`  
**Depends on:** T1, T16  
**Reuses:** `ui/DataEntry`, `ui/Feedback`  
**Requirement:** FAM-01, FAM-02

**Done when:**

- [ ] Sucesso → dashboard
- [ ] Erros exibidos via i18n

**Tests:** unit (smoke render)  
**Gate:** quick

---

### T18: FamilySelectPage

**What:** Substituir stub — lista famílias, pick → setFamilyId → dashboard.  
**Where:** `client/src/presentation/modules/family/select/`  
**Depends on:** T1, T13, T16  
**Requirement:** FAM-03

**Done when:**

- [ ] Usa sessão ou `listMine`
- [ ] Rotas `app/.../families/select` apontam para módulo

**Tests:** unit  
**Gate:** quick

---

### T19: InviteModal + dashboard Admin CTA

**What:** Modal convite; botão no dashboard se Admin da família ativa.  
**Where:** `presentation/modules/family/invite/`, patch `stubs/dashboard.tsx`  
**Depends on:** T1, T14, T16  
**Requirement:** FAM-04

**Done when:**

- [ ] Copiar código funciona
- [ ] Exibe expiração

**Tests:** unit  
**Gate:** quick

---

### T20: Integration + smoke checklist

**What:** Atualizar rotas onboarding; checklist manual E2E.  
**Where:** `app/[locale]/(app)/onboarding/page.tsx`, `.specs/changes/004-family-management/SMOKE.md`  
**Depends on:** T9–T19

**Done when:**

- [ ] `npm run pre-push:checks` passa
- [ ] `dotnet test` passa
- [ ] Smoke: criar família → convite → join (2 usuários) documentado

**Tests:** gate  
**Gate:** full

**Commit sugerido por task:** `feat(family): <descrição Tn>`

---

## Parallel Execution Map

```
Phase 1:  T1 ─┐
          T2 ─┼─→ T3
          (T1,T2 parallel)

Phase 2:  T3 → T4,T5,T6,T7 → T8

Phase 3:  T8 → T9,T10 → T11

Phase 4:  T2 → T12,T13,T14,T15 (parallel) → T16

Phase 5:  T16 → T17,T18,T19 (partial parallel) → T20
```

**Commit:** `feat/004-family-management` — implementar T1→T20 sequencialmente ou fases conforme plano.
