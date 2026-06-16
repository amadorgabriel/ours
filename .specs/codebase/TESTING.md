# Testing

## Web (`web/`)

| Tipo | Runner | Localização | Gate |
|------|--------|-------------|------|
| Unit / component | Vitest + RTL | `web/src/**/*.test.{ts,tsx}` | `npm run test:run` |
| UI playground | @vitest/ui | `npm run test:ui` | manual |
| E2E | Playwright | *planejado* fluxos auth/família | — |

**Setup:** `web/src/test/setup.ts`, alias `@` → `src/`.

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
| Web unit tests | Yes |
| Web build | No |
| Server integration (Testcontainers) | No (Docker) |
