# Testing — Mobile

**Status:** definido — implementação pendente (M6)

| Tipo | Runner | Localização | Gate |
|------|--------|-------------|------|
| Unit / component | Jest + RNTL | `mobile/src/**/*.test.{ts,tsx}` | `npm run test` |
| E2E | Maestro ou Detox | *planejado pós-M6* | — |

## Padrões

- Testes colocados ao lado do código (`*.test.ts`)
- Mock de HTTP via `core/infra/http/mock.ts`
- Providers: wrap com `RootProvider` em testes de tela

## Critérios por feature

Cada story em `.specs/features/*/mobile.md` lista testes independentes.

```bash
cd mobile && npm run test && npm run type-check
```
