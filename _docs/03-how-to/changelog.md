# Changelog

> **How-to**: Histórico de mudanças do Project Ours

O formato segue o [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) e usa [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Adicionado

#### Documentação
- **Design System**: Novo arquivo `design-tokens.md` com mapeamento de tokens Mantine → Tailwind
- **Fluxo de Login**: Documentação completa em `login-flow.md` com diagramas de sequência
- **Coleção Bruno**: Substituída coleção Postman por coleção Bruno em `server/collections/bruno/`
- **Guia Bruno**: Documentação de uso da coleção Bruno em `bruno-api-testing.md`

#### Frontend
- **Login UI**: Tela de login refatorada seguindo wireframe do design system
  - Logo centralizado com ícone
  - Tagline "Cuide dos seus pais junto com seus irmãos"
  - Botão Google custom (48px, full-width) com GIS
  - Footer com links Termos/Privacidade
  - Estados de loading e error acessíveis
- **Smart Routing**: Lógica de roteamento pós-login implementada
  - `resolvePostLoginRoute()` — decide destino baseado em `isNewUser`/`familyCount`
  - Novo usuário → `/onboarding`
  - 1 família → `/dashboard`
  - Múltiplas famílias → `/families/select`
- **Páginas Stub**: Criadas páginas iniciais
  - `/onboarding` — Criar família
  - `/dashboard` — Tela principal com botão "Liguei Agora"
  - `/families/select` — Selecionar família ativa
- **Testes**: Novos testes Vitest
  - `postLoginRoute.test.ts` — Testes de roteamento
  - `authGateway.test.ts` — Testes de gateway com parse de JSON
  - `authService.test.ts` — Atualizado para verificar parse AuthResponse

#### i18n
- Novas chaves em `pt-BR.json`:
  - `login.tagline`, `login.ctaGoogle`, `login.footer.*`
  - `onboarding.*` — Tela de criação de família
  - `dashboard.*` — Tela principal
  - `families.select.*` — Seletor de família

### Alterado

#### Segurança
- **Auth**: Documentação atualizada de `Authorization: Bearer` para **Cookie HttpOnly + Antiforgery**
  - `api-reference.md` — Endpoints atualizados com headers corretos
  - `security-model.md` — Fluxo de JWT em cookie documentado
  - `client-standard.md` — Seção de API client atualizada

### Deprecado
- Coleção Postman `ProjectOurs.Auth.postman_collection.json` — usar coleção Bruno

### Removido
- N/A

### Corrigido
- N/A

### Segurança
- Implementada proteção CSRF via antiforgery token em todas as mutações (POST/PUT/DELETE)
- Cookie `po_auth` agora é HttpOnly, Secure, SameSite=Strict

---

## [0.1.0] - 2026-05-01

### Adicionado
- Setup inicial do projeto (Next.js + .NET)
- Autenticação Google OAuth básica
- Sessão via cookie `po_auth`
- Antiforgery para proteção CSRF
- Estrutura inicial de documentação Diátaxis

---

## Template

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Adicionado
- Novas features

### Alterado
- Mudanças em features existentes

### Deprecado
- Features que serão removidas

### Removido
- Features removidas

### Corrigido
- Bug fixes

### Segurança
- Correções de segurança
```

---

*Última atualização: Maio 2026*
