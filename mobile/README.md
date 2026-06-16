# Project Ours — Mobile (placeholder)

**Status:** não desenvolvido — change futuro (M6)

## Papel

Cliente **principal** do Project Ours. Experiência diária dos irmãos:

- Onboarding e autenticação
- Feed de atividades da família
- Registrar ligações e cuidados
- Metas financeiras (visão agregada)
- Estatísticas pessoais

## O que não é

- Este diretório **não** contém código de app ainda
- Gestão administrativa avançada fica em `web/` (PWA admin opcional)

## Stack

**TBD** — a definir em change dedicado. Candidatos: React Native / Expo (avaliar na spec M6).

## API

Consumirá a mesma API REST em `server/` que o `web/`. Contratos: `.specs/shared/api-contracts.md`

## Design

Herdará tokens de `.specs/design/DESIGN.md` quando o app for iniciado.

## Documentação

- Visão do produto: `.specs/project/PROJECT.md`
- Matriz de plataformas: `.specs/shared/platforms.md`
- Change de split: `.specs/changes/006-client-platform-split/`

## Desenvolvimento

Nenhum comando disponível até M6. Para trabalho ativo no frontend, use `web/`.
