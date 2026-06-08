# Project Ours

PWA para cuidado colaborativo de pais entre irmãos — feed unificado, metas financeiras com privacidade e gestão multi-família.

## Pacotes

| Path | Stack |
|------|-------|
| `client/` | Next.js 16, Mantine, next-intl |
| `server/` | .NET 8, PostgreSQL |

## Documentação

**Specs (SDD):** [`.specs/README.md`](.specs/README.md)

- Visão: `.specs/project/PROJECT.md`
- Convenções client: `.specs/codebase/CONVENTIONS.md`
- Task ativa: `.specs/changes/001-client-standards/tasks.md`

`_docs/` está deprecado.

## Desenvolvimento

```bash
# Client
cd client && npm install && npm run dev

# Server
cd server && dotnet test && dotnet run --project src/ProjectOurs.API
```

## Licença

MIT
