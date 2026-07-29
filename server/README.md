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
- `Authentication:Google` — client IDs OAuth (Web + Android).

CORS em desenvolvimento permite `http://localhost:3000` (Next.js). Em Production, `appsettings.Production.json` inclui `https://ours.app` (sobrescrevível por env).

### Produção (env vars)

Secrets **não** vão no git. Template: [`.env.production.example`](./.env.production.example). Na VM Oracle o arquivo real é `/etc/projectours/env` (chmod 600), carregado pelo systemd.

| Env var | Obrigatória | Notas |
|---------|-------------|--------|
| `ASPNETCORE_ENVIRONMENT` | sim | `Production` |
| `ASPNETCORE_URLS` | sim | `http://127.0.0.1:5280` (só loopback; Tunnel na frente) |
| `ConnectionStrings__PostgreSQL` | sim | Neon com `SSL Mode=Require` |
| `JwtSettings__SigningKey` | sim | ≥ 32 chars; ver rotação abaixo |
| `JwtSettings__Issuer` | sim | tipicamente `project-ours-api` |
| `JwtSettings__Audience` | sim | tipicamente `project-ours-clients` |
| `Authentication__Google__ClientId` | sim | OAuth Web |
| `Authentication__Google__AndroidClientId` | sim | OAuth Android |
| `Cors__AllowedOrigins__0` | sim | `https://ours.app` (+ extras se Quick Tunnel) |

**Windows (migrations locais contra Neon):** use `$env:PROJECTOURS_CONNECTION_STRING` — nome **diferente** do binding ASP.NET na VM (`ConnectionStrings__PostgreSQL`). Não misturar.

#### Rotação de JWT (`JwtSettings__SigningKey`)

1. Gere uma nova chave (≥ 32 chars aleatórios).
2. Atualize `/etc/projectours/env` na VM (`sudo` + editor; mantenha chmod 600).
3. `sudo systemctl restart projectours-api`.
4. Tokens emitidos com a chave antiga **deixam de validar** — usuários precisam fazer login de novo (cookie/`po_auth` inválido).
5. Não reutilize a chave de Development; não commite o valor.

Deploy: `scripts/infra/deploy-api.sh` (migrate → publish → rsync → restart → health).

### CI — GitHub Actions (`deploy-api.yml`)

Push em `main` (paths `server/**`, `scripts/infra/**`) ou **workflow_dispatch** → `dotnet test` → deploy via SSH.

**Health check público:** `https://*.trycloudflare.com/health` (Quick Tunnel; **não** `api.ours.app` — AD-012).

**Secrets obrigatórios** (Settings → Secrets and variables → Actions):

| Secret | Exemplo de valor (não commitar) |
|--------|----------------------------------|
| `ORACLE_SSH_KEY` | Conteúdo da chave privada SSH |
| `ORACLE_HOST` | `ubuntu@<vm-ip>` |
| `NEON_CONNECTION_STRING` | Neon com `SSL Mode=Require` |

Opcional: variable `PUBLIC_API_BASE_URL` = `https://<subdomain>.trycloudflare.com`. Lista completa: [`scripts/infra/README.md`](../scripts/infra/README.md).

## Migrations

O schema é versionado com EF Core em `src/ProjectOurs.Infrastructure/Migrations/`.

Em **Development** e **Testing**, a API aplica migrations automaticamente no startup (`Database.MigrateAsync()`). Em **Production**, o startup **não** chama `MigrateAsync()` — migrations rodam no deploy/CI (`dotnet ef database update`).

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

Para design-time, opcional: `PROJECTOURS_CONNECTION_STRING` aponta para o Postgres (local ou Neon).

## Estrutura

| Projeto | Função |
|--------|--------|
| `ProjectOurs.Domain` | Entidades e enums |
| `ProjectOurs.Application` | Contratos, regras compartilhadas (ex.: metas), header `X-Family-Id` |
| `ProjectOurs.Infrastructure` | EF Core + PostgreSQL, repositórios |
| `ProjectOurs.API` | Host HTTP, JWT/CORS/Swagger (OAuth Google em etapa futura) |
| `ProjectOurs.UnitTests` | Testes unitários |
| `ProjectOurs.Api.IntegrationTests` | `WebApplicationFactory` + Postgres (Testcontainers) |
