# Testing

## Client (`client/`)

| Tipo | Runner | Localização | Gate |
|------|--------|-------------|------|
| Unit / component | Vitest + RTL | `src/**/*.test.{ts,tsx}` | `npm run test:run` |
| UI playground | @vitest/ui | `npm run test:ui` | manual |
| E2E | Playwright | *planejado* fluxos auth/família | — |

**Setup:** `src/test/setup.ts`, alias `@` → `src/`.

**Hooks:**

- pre-commit: `lint-staged`, `lint`, `type-check`
- pre-push: `build`, `test:run`

## Server (`server/`)

| Tipo | Runner | Gate |
|------|--------|------|
| Unit | xUnit | `dotnet test` (UnitTests) |
| Integration | WebApplicationFactory + Testcontainers | `dotnet test` (ignora se Docker off) |

## Critérios de aceitação

Formato preferido: **WHEN/THEN/SHALL** (specs) ou **Given/When/Then** (PRD legado).

Cada user story em `.specs/features/*/spec.md` lista testes independentes.

## Parallelism

| Área | Parallel-Safe |
|------|---------------|
| Client unit tests | Yes |
| Client build | No |
| Server integration (Testcontainers) | No (Docker) |
