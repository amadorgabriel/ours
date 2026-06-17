# Testing — Server

| Tipo | Runner | Projeto | Gate |
|------|--------|---------|------|
| Unit | xUnit | `ProjectOurs.UnitTests` | `dotnet test` |
| Integration | WebApplicationFactory + Testcontainers | `ProjectOurs.Api.IntegrationTests` | `dotnet test` |

## Notas

- Integration tests ignoram se Docker indisponível
- Bruno collections em `server/collections/bruno/` para smoke manual
- Cada endpoint novo: integration test + entrada Bruno

```bash
cd server && dotnet test
```

## Critérios de aceitação

Formato: **WHEN/THEN/SHALL** (specs em `.specs/features/`).
