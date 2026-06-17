# Tech Stack — Server

**Pacote:** `server/` · **Papel:** API REST única para web e mobile  
**Última atualização:** 2026-06-17

## Runtime

| Camada | Tecnologia | Versão |
|--------|------------|--------|
| Runtime | .NET | 8 |
| ORM | Entity Framework Core | 8 |
| Database | PostgreSQL | 15+ |
| Auth | JWT + cookie (web) / Bearer (mobile) | — |
| API docs | Swagger | dev only |
| Tests unit | xUnit | — |
| Tests integration | WebApplicationFactory + Testcontainers | — |
| Collections | Bruno | `server/collections/bruno/` |

## Projetos da solução

| Projeto | Responsabilidade |
|---------|------------------|
| `ProjectOurs.API` | Controllers, middleware, auth, DI root |
| `ProjectOurs.Application` | Services, DTOs, regras de aplicação |
| `ProjectOurs.Domain` | Entidades, enums, value objects |
| `ProjectOurs.Infrastructure` | EF Core, repositories, integrações externas |
| `ProjectOurs.UnitTests` | Testes de domínio e application |
| `ProjectOurs.Api.IntegrationTests` | Testes HTTP end-to-end |

## Gate

```bash
cd server && dotnet test
```

## Infra (planejado)

- Backend + DB: VPS Docker
- Secrets: env vars (JWT key, Google client, connection string)

## Referências

- Arquitetura: [ARCHITECTURE.md](ARCHITECTURE.md)
- Contratos API: [`.specs/shared/api-contracts.md`](../../shared/api-contracts.md)
- Domínio: [`.specs/shared/domain-model.md`](../../shared/domain-model.md)
