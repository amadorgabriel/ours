# Architecture — Server

**Pacote:** `server/` · **Padrão:** Clean Architecture (Layered)

## Visão geral

```
                    ┌─────────────────────┐
                    │   ProjectOurs.API   │
                    │  Controllers, Auth  │
                    │  Middleware, DI     │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │ ProjectOurs.        │
                    │ Application         │
                    │ Services, DTOs,     │
                    │ Abstractions        │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
   ┌──────────▼────────┐ ┌─────▼─────┐ ┌────────▼────────┐
   │ ProjectOurs.      │ │  Domain   │ │ Infrastructure  │
   │ Domain            │ │  (core)   │ │ EF, Repos, JWT  │
   │ Entities, Enums   │ │           │ │ Google Auth     │
   └───────────────────┘ └───────────┘ └─────────────────┘
```

## Projetos e dependências

```text
API → Application, Infrastructure
Application → Domain
Infrastructure → Application (interfaces), Domain
Domain → (nenhum projeto Spott)
```

## API Layer (`ProjectOurs.API`)

| Componente | Responsabilidade |
|------------|------------------|
| `Controllers/` | Endpoints REST (`Auth`, `Families`, `Invites`, …) |
| `Auth/` | `AuthCookieService`, JWT factory, policies |
| `Program.cs` | DI, middleware pipeline, CORS, antiforgery |
| `Middleware/` | Exception handling, logging |

### Controllers atuais

| Controller | Rotas base | Escopo |
|------------|------------|--------|
| `AuthController` | `/api/auth` | Login Google, me, logout, antiforgery |
| `FamiliesController` | `/api/families` | CRUD família, listar minhas |
| `InvitesController` | `/api/invite`, `/api/join` | Convites e entrada |
| `HealthController` | `/health` | Liveness |

## Application Layer (`ProjectOurs.Application`)

| Módulo | Conteúdo |
|--------|----------|
| `Auth/` | `AuthService`, validação Google token |
| `Family/` | `FamilyService`, regras, DTOs, `InviteCodeGenerator` |
| `Abstractions/` | `IUserRepository`, `IFamilyRepository`, `IJwtTokenFactory` |

Regras de negócio ficam aqui — controllers são finos.

## Domain Layer (`ProjectOurs.Domain`)

Entidades: `User`, `Family`, `FamilyMembership`, `FamilyInvite`, `Parent`, `Activity`, `Goal`, `GoalContribution`.

Enums: `UserRole`, `InviteStatus`, `ActivityType`, `GoalStatus`.

## Infrastructure Layer (`ProjectOurs.Infrastructure`)

| Área | Implementação |
|------|---------------|
| `Persistence/` | `SpottContext` equivalente → `ProjectOursDbContext`, repositories EF |
| `Auth/` | Google token validation, JWT signing |
| `DependencyInjection.cs` | Registro de serviços |

## Auth multi-plataforma

| Client | Mecanismo | Implementação server |
|--------|-----------|---------------------|
| Web | Cookie `po_auth` | `AuthCookieService.Append()` após login |
| Mobile | Bearer JWT | Mesmo JWT; client envia em `Authorization` header |

Middleware de autenticação aceita cookie **ou** Bearer.

## Multi-família

- `FamilyMembership` liga User ↔ Family com `UserRole`
- Endpoints com escopo familiar exigem header `X-Family-Id`
- Validação: usuário é membro da família indicada

## Testes

| Projeto | Escopo |
|---------|--------|
| `ProjectOurs.UnitTests` | Domain rules, services isolados |
| `ProjectOurs.Api.IntegrationTests` | HTTP + Testcontainers PostgreSQL |

## Estrutura de diretórios

```
server/
├── src/
│   ├── ProjectOurs.API/
│   ├── ProjectOurs.Application/
│   ├── ProjectOurs.Domain/
│   └── ProjectOurs.Infrastructure/
├── tests/
│   ├── ProjectOurs.UnitTests/
│   └── ProjectOurs.Api.IntegrationTests/
└── collections/bruno/
```

## Evolução planejada

| Milestone | Endpoints novos |
|-----------|-----------------|
| M3 | `/api/activities/call`, `/api/activities/feed` |
| M4 | `/api/goals`, `/api/goals/{id}/contribute` |
| M5 | `/api/parents`, credenciais, anexos |

Contratos: [`.specs/shared/api-contracts.md`](../../shared/api-contracts.md)
