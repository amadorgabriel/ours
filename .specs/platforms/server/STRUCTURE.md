# Repository Structure — Server

```
server/
├── src/
│   ├── ProjectOurs.API/
│   │   ├── Controllers/
│   │   ├── Auth/
│   │   └── Program.cs
│   ├── ProjectOurs.Application/
│   │   ├── Auth/
│   │   ├── Family/
│   │   └── Abstractions/
│   ├── ProjectOurs.Domain/
│   │   └── Entities/
│   └── ProjectOurs.Infrastructure/
│       ├── Persistence/
│       └── DependencyInjection.cs
├── tests/
│   ├── ProjectOurs.UnitTests/
│   └── ProjectOurs.Api.IntegrationTests/
└── collections/bruno/
```

## Projetos

| Projeto | Tipo | Depende de |
|---------|------|------------|
| `ProjectOurs.API` | Web API | Application, Infrastructure |
| `ProjectOurs.Application` | Class lib | Domain |
| `ProjectOurs.Domain` | Class lib | — |
| `ProjectOurs.Infrastructure` | Class lib | Application, Domain |

## Entidades (Domain)

`User`, `Family`, `FamilyMembership`, `FamilyInvite`, `Parent`, `Activity`, `Goal`, `GoalContribution`

Detalhes: [`.specs/shared/domain-model.md`](../../shared/domain-model.md)
