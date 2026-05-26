# Project Ours - Documentação Central

> **Fonte de verdade para desenvolvimento orientado por IA**

## Navegação Rápida


| Público                | Documento                                                                                                  | Propósito                                    |
| ---------------------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| **Stakeholders / PMs** | [Visão Geral](../01-explanation/01-overview.md)                                                            | Entender o produto, objetivos e diferenciais |
| **Arquitetos**         | [Arquitetura](../01-explanation/02-architecture.md)                                                        | Decisões arquiteturais, integrações, stack   |
| **Dev Frontend**       | [UI/UX Reference](../02-reference/ui-design-system.md) + [API Reference](../02-reference/api-reference.md) | Componentes, wireframes, endpoints           |
| **Dev Backend**        | [Database Schema](../02-reference/database-schema.md) + [API Reference](../02-reference/api-reference.md)  | Entidades, relações, contratos API           |
| **QA / DevOps**        | [Testing Guide](../03-how-to/testing-guide.md) + [DevOps Guide](../03-how-to/devops-deployment.md)         | Estratégia de testes, CI/CD, deploy          |
| **Agents de IA**       | [Agent Context](../04-agent/agent-context.md)                                                              | Contexto completo consolidado para IA        |


## Estrutura Diátaxis

Esta documentação segue o [framework Diátaxis](https://diataxis.fr/):

- **Explanation** (`01-explanation/`): Entender conceitos e decisões
- **Reference** (`02-reference/`): Consultar fatos técnicos rapidamente
- **How-to** (`03-how-to/`): Executar tarefas específicas
- **Agent** (`04-agent/`): Contexto especializado para IA

## Quick Start

### Novo desenvolvedor?

1. Leia [Visão Geral](../01-explanation/01-overview.md) (5 min)
2. Estude [Arquitetura](../01-explanation/02-architecture.md) (10 min)
3. Configure ambiente: [Frontend Setup](../03-how-to/devops-deployment.md#frontend) ou [Backend Setup](../03-how-to/devops-deployment.md#backend)

### Implementando uma feature?

1. Consulte [Agent Context](../04-agent/agent-context.md) para contexto completo
2. Veja [UI Design System](../02-reference/ui-design-system.md) para padrões visuais
3. Use [API Reference](../02-reference/api-reference.md) para contratos
4. Siga [Testing Guide](../03-how-to/testing-guide.md) para qualidade

### Precisa de contexto para IA?

Use [Agent Context](../04-agent/agent-context.md) — contém todo o contexto do projeto em formato otimizado para agents de IA.

## Documentos Principais

### Explanation (Conceitual)

- [Visão Geral](../01-explanation/01-overview.md) — Propósito, diferenciais, público-alvo
- [Arquitetura](../01-explanation/02-architecture.md) — Stack, camadas, integrações
- [Security Model](../01-explanation/03-security-model.md) — Privacidade, permissões, anonimização

### Reference (Técnico)

- [PRD Summary](../02-reference/prd-summary.md) — Requisitos MVP (User Stories)
- [API Reference](../02-reference/api-reference.md) — Endpoints REST completos
- [Database Schema](../02-reference/database-schema.md) — ERD, entidades, relacionamentos
- [UI Design System](../02-reference/ui-design-system.md) — Wireframes, componentes, fluxos

### How-to (Prático)

- [Login Flow](../03-how-to/login-flow.md) — Fluxo completo de autenticação
- [Bruno Testing](../03-how-to/bruno-api-testing.md) — Testes manuais de API
- [Testing Guide](../03-how-to/testing-guide.md) — Testes unit, integration, E2E
- [DevOps & Deployment](../03-how-to/devops-deployment.md) — Infra, CI/CD, ambientes
- [Observability & Ops](../03-how-to/observability-ops.md) — Logs, métricas, troubleshooting
- [Release Plan](../03-how-to/release-plan.md) — Estratégia de release, versionamento
- [Changelog](../03-how-to/changelog.md) — Histórico de mudanças

### Agent (IA)

- [Agent Context](../04-agent/agent-context.md) — Contexto consolidado para IA
- [Skills Mapping](../04-agent/skills-mapping.md) — Mapeamento de capacidades por módulo

## Glossário Rápido


| Termo           | Definição                                                    |
| --------------- | ------------------------------------------------------------ |
| **Família**     | Grupo de irmãos cuidando dos mesmos pais                     |
| **Admin**       | Administrador único da família (criador)                     |
| **Member**      | Membro da família (não admin)                                |
| **Feed**        | Lista cronológica de atividades (colaborativa, sem rankings) |
| **Goal**        | Meta financeira coletiva com privacidade de contribuições    |
| **X-Family-Id** | Header HTTP para identificar família ativa (multi-família)   |


## Status do Projeto

- **Fase:** MVP (P0)
- **Status:** Em desenvolvimento
- **Última atualização:** Maio 2026
- **Versão PRD:** 1.1

## Contato & Contribuição

- PRD completo: `product-requirements-document.md`
- Frontend standards: `client-standard.md`
- Padrões de código: `frontend-setup-prompt.md`

