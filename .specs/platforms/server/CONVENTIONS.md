# Conventions — Server

Pacote: `server/` · Padrão: Clean Architecture

## Organização

| Camada | Namespace | Conteúdo |
|--------|-----------|----------|
| API | `ProjectOurs.API` | Controllers finos, sem lógica de negócio |
| Application | `ProjectOurs.Application` | Services, DTOs, interfaces |
| Domain | `ProjectOurs.Domain` | Entidades puras, sem dependências externas |
| Infrastructure | `ProjectOurs.Infrastructure` | EF, repos, integrações |

## Controllers

- Rota base: `[Route("api/{resource}")]`
- Retornos tipados com `ProducesResponseType`
- Validação de input no controller ou via FluentValidation (quando adicionado)
- Erros de domínio → exceptions mapeadas em middleware

## Naming

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Entity | PascalCase singular | `Family`, `FamilyInvite` |
| Service | `{Domain}Service` | `FamilyService` |
| Repository | `I{Entity}Repository` | `IFamilyRepository` |
| DTO request | `{Action}Request` | `GoogleAuthRequest` |
| DTO response | `{Entity}Response` | `AuthSessionResponse` |

## Persistência

- EF Core com `DbContext` em Infrastructure
- Repositories implementam interfaces em Application.Abstractions
- Migrations versionadas em `ProjectOurs.Infrastructure`

## Testes

- Unit: xUnit, Arrange-Act-Assert
- Integration: `WebApplicationFactory`, Testcontainers PostgreSQL
- Nome: `{Method}_{Scenario}_{Expected}`

## API

- Base path: `/api`
- JSON: camelCase
- Erros: `{ message: string }` ou ProblemDetails
- Coleção Bruno: `server/collections/bruno/` — atualizar ao adicionar endpoints

## Segurança

- JWT signing key via env em produção
- `[Authorize]` em endpoints autenticados
- Admin-only: validar role via `FamilyMembership` + `X-Family-Id`
