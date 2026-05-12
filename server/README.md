# Project Ours — backend (.NET 8)

Solution em camadas alinhada ao PRD (Maio 2026): API, Application, Domain, Infrastructure e testes (xUnit).

## Pré-requisitos

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- PostgreSQL local (desenvolvimento) **ou** Docker (para testes de integração com Testcontainers)

## Executar testes

Na pasta `server/`:

```bash
dotnet test
```

Os testes de integração usam **Testcontainers** (Postgres). Se o Docker não estiver em execução, o smoke test é **ignorado** automaticamente (atributo `DockerRequiredFact`).

## Executar a API

```bash
cd src/ProjectOurs.API
dotnet run
```

Swagger (Development): `http://localhost:5280/swagger`

Health check: `GET http://localhost:5280/health`

## Configuração

- `ConnectionStrings:PostgreSQL` — banco principal.
- `JwtSettings` — emissor, audiência e chave simétrica (mínimo 32 caracteres) para JWT **da API**.
- `Authentication:Google` — placeholders até a etapa de validação do `id_token` Google.

CORS em desenvolvimento permite `http://localhost:3000` (Next.js).

## Migrations

Nesta etapa o modelo existe apenas em código (`ApplicationDbContext`). Quando for o momento de versionar o schema:

```bash
cd src/ProjectOurs.API
dotnet ef migrations add NomeDaMigration --project ../ProjectOurs.Infrastructure
```

(Exige `dotnet tool install --global dotnet-ef` se ainda não estiver instalado.)

## Estrutura

| Projeto | Função |
|--------|--------|
| `ProjectOurs.Domain` | Entidades e enums |
| `ProjectOurs.Application` | Contratos, regras compartilhadas (ex.: metas), header `X-Family-Id` |
| `ProjectOurs.Infrastructure` | EF Core + PostgreSQL, repositórios |
| `ProjectOurs.API` | Host HTTP, JWT/CORS/Swagger (OAuth Google em etapa futura) |
| `ProjectOurs.UnitTests` | Testes unitários |
| `ProjectOurs.Api.IntegrationTests` | `WebApplicationFactory` + Postgres (Testcontainers) |
