# Testing — Web

| Tipo | Runner | Localização | Gate |
|------|--------|-------------|------|
| Unit / component | Vitest + RTL | `web/src/**/*.test.{ts,tsx}` | `npm run test:run` |
| UI playground | @vitest/ui | `npm run test:ui` | manual |
| E2E | Playwright | *planejado* | — |

**Setup:** `web/src/test/setup.ts`, alias `@` → `src/`.

**Hooks:**

- pre-commit: `lint-staged`, `lint`, `type-check`
- pre-push: `build`, `test:run`

```bash
cd web && npm run pre-push:checks
```
