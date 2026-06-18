# Project Ours

App para cuidado colaborativo de pais entre irmãos — feed unificado, metas financeiras com privacidade e gestão multi-família.

**Cliente principal (scaffold ativo):** `mobile/` · **Admin PWA (ativo):** `web/` · **API:** `server/`

## Pacotes

| Path | Stack | Papel |
|------|-------|-------|
| `mobile/` | Expo SDK 56, React Native, Expo Router, NativeWind | App principal — scaffold M6 (auth + family) |
| `web/` | Next.js 16, Mantine, next-intl, PWA | Admin/suporte opcional |
| `server/` | .NET 8, PostgreSQL | API REST única |

## Documentação

**Specs (SDD):** [`.specs/README.md`](.specs/README.md)

- Visão: `.specs/project/PROJECT.md`
- Plataformas: `.specs/shared/platforms.md`
- Convenções web: `.specs/platforms/web/CONVENTIONS.md`
- Plataformas: `.specs/platforms/`

## Desenvolvimento

```bash
# Web (admin PWA)
cd web && npm install && npm run dev

# Mobile (development build — não Expo Go)
cd mobile && npm install && cp .env.example .env.local && npm run start

# Server
cd server && dotnet test && dotnet run --project src/ProjectOurs.API
```

## Gates

```bash
cd web && npm run pre-push:checks
cd mobile && npm run test && npm run type-check
cd server && dotnet test
```

## Licença

MIT
