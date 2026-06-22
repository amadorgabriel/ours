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

O schema é versionado com EF Core em `src/ProjectOurs.Infrastructure/Migrations/`.

Em **Development** e **Testing**, a API aplica migrations automaticamente no startup (`Database.Migrate()`).

### Criar nova migration

```bash
cd server
dotnet ef migrations add NomeDaMigration --project src/ProjectOurs.Infrastructure --startup-project src/ProjectOurs.API
```

(Exige `dotnet tool install --global dotnet-ef` se ainda não estiver instalado.)

### Aplicar manualmente (produção ou banco existente)

```bash
cd server
dotnet ef database update --project src/ProjectOurs.Infrastructure --startup-project src/ProjectOurs.API
```

Para design-time, opcional: `PROJECTOURS_CONNECTION_STRING` aponta para o Postgres local.

## Estrutura

| Projeto | Função |
|--------|--------|
| `ProjectOurs.Domain` | Entidades e enums |
| `ProjectOurs.Application` | Contratos, regras compartilhadas (ex.: metas), header `X-Family-Id` |
| `ProjectOurs.Infrastructure` | EF Core + PostgreSQL, repositórios |
| `ProjectOurs.API` | Host HTTP, JWT/CORS/Swagger (OAuth Google em etapa futura) |
| `ProjectOurs.UnitTests` | Testes unitários |
| `ProjectOurs.Api.IntegrationTests` | `WebApplicationFactory` + Postgres (Testcontainers) |
