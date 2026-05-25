# Project Ours - Resumo do PRD (Product Requirements Document)

> **Reference**: Resumo estruturado dos requisitos para consulta rápida

---

## User Stories MVP (P0)

### US-001: Autenticação e Criação de Família
**Como** primeiro irmão, **quero** criar uma família após login, **para** começar a usar o aplicativo.

| Critério | Tipo |
|----------|------|
| Tela de login exibe botão "Entrar com Google" | Funcional |
| Usuário novo redirecionado para onboarding | Funcional |
| Formulário valida nome (3-50 chars) | Funcional |
| Após criação, usuário é admin e redirecionado | Funcional |
| JWT token gerado e armazenado | Técnico |

**Regras:**
- Usuário pode pertencer a N famílias
- Criador automaticamente se torna admin daquela família
- Nome obrigatório: 3-50 caracteres

---

### US-002: Gerar Convite para Família
**Como** admin, **quero** gerar um link de convite válido por 24h, **para** adicionar meus irmãos.

| Critério | Tipo |
|----------|------|
| Apenas admin vê botão "Convidar irmão" | Funcional |
| Código gerado: 6 caracteres alfanuméricos | Funcional |
| Expiração: 24h após geração | Funcional |
| URL completa exibida e copiável | Funcional |
| Novo convite invalida anterior | Funcional |
| Contador regressivo visível | UX |

**Regras:**
- Status: Pending, Accepted, Rejected, Expired
- Código: A-Z, 0-9 (ex: ABC123)

---

### US-003: Entrar na Família via Convite
**Como** irmão convidado, **quero** entrar na família via link com aprovação do admin, **para** participar do cuidado.

| Critério | Tipo |
|----------|------|
| Link com código exibe nome da família | Funcional |
| Usuário não logado redirecionado para login | Funcional |
| Após login, retorna ao link automaticamente | Funcional |
| Solicitação cria registro pending | Funcional |
| Código expirado exibe mensagem específica | Funcional |
| Usuário já membro vê erro específico | Funcional |

**Regras:**
- Usuário não pode solicitar se já é membro
- Convite deve estar pending e não expirado
- Novo membro entra com role Member
- Admin deve aprovar explicitamente

**Mensagens:**
- Sucesso: "Solicitação enviada. Aguarde aprovação."
- Código inválido: "Código de convite inválido ou expirado."
- Já membro: "Você já faz parte desta família."

---

### US-004: Registrar Ligação
**Como** irmão, **quero** clicar em "Liguei agora" e registrar duração opcional, **para** documentar minha ligação.

| Critério | Tipo |
|----------|------|
| Botão "Liguei Agora" em destaque | UX |
| Timer inicia ao clicar (opcional) | Funcional |
| Modal permite duração e notas | Funcional |
| Registro aparece no feed em < 2s | Performance |
| Toast de confirmação | UX |

**Campos:**
- Duração (número, minutos, opcional)
- Notas (textarea, opcional, max 500 chars)
- ParentId (dropdown, opcional)

**Mensagem:** "Ligação registrada! 🎉"

---

### US-005: Visualizar Feed de Atividades
**Como** irmão, **quero** ver o feed de atividades da família ativa, **para** acompanhar o cuidado aos pais.

| Critério | Tipo |
|----------|------|
| Feed mostra apenas família ativa (X-Family-Id) | Segurança |
| Ordenação cronológica decrescente | Funcional |
| Lazy loading (20 itens) | Performance |
| Timestamps relativos | UX |
| Pull-to-refresh | UX |
| Empty state amigável | UX |

**Formatos de Display:**
- Ligação: "[Nome] ligou para [Pai] • [duração] • [tempo relativo]"
- Meta criada: "[Nome] criou a meta '[Título]'"
- Meta progresso: "Meta '[Título]' atingiu [X]%"
- Meta completa: "🎉 Meta '[Título]' foi atingida!"

---

### US-006: Criar Meta Financeira
**Como** irmão, **quero** criar uma meta financeira coletiva, **para** organizar gastos compartilhados.

| Critério | Tipo |
|----------|------|
| Qualquer membro pode criar | Funcional |
| Título obrigatório (3-100 chars) | Funcional |
| Valor alvo mínimo R$ 10,00 | Funcional |
| Meta criada com status Active | Funcional |
| Redirecionamento para detalhe | UX |
| Erros inline | UX |

**Campos:**
- Título: string, 3-100 chars, obrigatório
- TargetAmount: decimal, > R$ 10,00

---

### US-007: Contribuir para Meta
**Como** irmão, **quero** contribuir para uma meta existente sem revelar meu valor aos outros, **para** manter privacidade.

| Critério | Tipo |
|----------|------|
| Valor mínimo R$ 1,00 | Funcional |
| Progresso atualizado em tempo real | UX |
| NINGUÉM vê valor individual de outros | Segurança |
| Usuário vê próprio total | Funcional |
| Meta atingida: banner celebração | UX |
| Status muda para Completed | Funcional |

**Regras CRÍTICAS:**
- NINGUÉM vê quanto cada irmão contribuiu
- Todos veem: total arrecadado, alvo, %, contagem de contribuições
- Apenas próprio usuário vê histórico de contribuições
- Valor mínimo: R$ 1,00
- Máximo: restante da meta

**Mensagens:**
- Sucesso: "Contribuição registrada!"
- Meta completa: "🎉 Meta atingida!"
- Erro: "Valor mínimo de contribuição é R$ 1,00."

---

### US-008: Visualizar Estatísticas Pessoais
**Como** irmão, **quero** ver minhas estatísticas pessoais, **para** me motivar a continuar ajudando.

| Critério | Tipo |
|----------|------|
| Estatísticas apenas do próprio usuário | Segurança |
| Dashboard mostra resumo pessoal | Funcional |
| Streak calculado corretamente | Funcional |
| Sem comparação com outros | UX |
| Dados atualizados em tempo real | Performance |

**Métricas:**
- Ligações este mês (count)
- Ligações mês passado (count)
- Total de minutos este mês
- Streak atual (dias consecutivos com ligação)

**Regras:**
- Estatísticas filtradas pela **família ativa**
- Streak = dias consecutivos com pelo menos uma ligação
- NUNCA comparar com outros irmãos

---

### US-009: Gerenciar Dados dos Pais (Admin)
**Como** admin, **quero** editar dados dos meus pais (nome, info médica), **para** manter informações atualizadas.

| Critério | Tipo |
|----------|------|
| Apenas admin vê botão "Editar" | Segurança |
| Membros podem visualizar | Funcional |
| Nome obrigatório (2-100 chars) | Funcional |
| MedicalInfo como JSONB | Técnico |
| Alterações imediatas | Funcional |

**Campos:**
- Nome: string, 2-100 chars, obrigatório
- Data de Nascimento: date, opcional
- Informações Médicas: textarea/json, opcional
- Briefing de Emergência: textarea, opcional

---

## Entidades Principais

### User
| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| id | UUID | Sim |
| email | string(255) | Sim |
| name | string(100) | Sim |
| picture | string(500) | Não |
| createdAt | datetime | Sim |

### FamilyMembership (N:N User↔Family)
| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| id | UUID | Sim |
| userId | UUID (FK) | Sim |
| familyId | UUID (FK) | Sim |
| role | enum (Admin/Member) | Sim |
| joinedAt | datetime | Sim |

**Restrição:** par único (userId, familyId)

### Family
| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| id | UUID | Sim |
| name | string(100) | Sim |
| createdAt | datetime | Sim |

### Parent
| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| id | UUID | Sim |
| familyId | UUID (FK) | Sim |
| name | string(100) | Sim |
| birthDate | date | Não |
| medicalInfo | jsonb | Não |
| emergencyBriefing | text | Não |

### Activity
| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| id | UUID | Sim |
| familyId | UUID (FK) | Sim |
| userId | UUID (FK) | Sim |
| parentId | UUID (FK) | Não |
| type | enum | Sim |
| metadata | jsonb | Não |
| createdAt | datetime | Sim |

**Activity Types:** Call, Visit, Medical, Task, Medication

### Goal
| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| id | UUID | Sim |
| familyId | UUID (FK) | Sim |
| title | string(100) | Sim |
| targetAmount | decimal(10,2) | Sim |
| currentAmount | decimal(10,2) | Sim (default 0) |
| status | enum | Sim |
| createdBy | UUID (FK) | Sim |
| createdAt | datetime | Sim |
| completedAt | datetime | Não |

**Goal Status:** Active, Completed, Cancelled

### GoalContribution
| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| id | UUID | Sim |
| goalId | UUID (FK) | Sim |
| userId | UUID (FK) | Sim |
| amount | decimal(10,2) | Sim |
| createdAt | datetime | Sim |

---

## Enums

```csharp
enum UserRole {
    Admin = 0,
    Member = 1
}

enum InviteStatus {
    Pending = 0,
    Accepted = 1,
    Rejected = 2,
    Expired = 3
}

enum ActivityType {
    Call = 0,
    Visit = 1,
    Medical = 2,
    Task = 3,
    Medication = 4
}

enum GoalStatus {
    Active = 0,
    Completed = 1,
    Cancelled = 2
}
```

---

## Restrições do MVP

| Funcionalidade | Status |
|----------------|--------|
| Notificações push | ❌ Não incluso |
| Criptografia end-to-end | ❌ Server-side apenas |
| Múltiplas famílias por usuário | ✅ Implementado |
| Idiomas | ✅ Apenas PT-BR |
| App nativo | ❌ PWA apenas |

---

## Glossário

| Termo | Definição |
|-------|-----------|
| **Admin** | Administrador único da família |
| **Member** | Membro da família (não admin) |
| **Feed** | Lista cronológica de atividades |
| **Goal** | Meta financeira coletiva |
| **Streak** | Sequência de dias com atividade |
| **X-Family-Id** | Header para família ativa |

---

*Fonte: product-requirements-document.md | Versão 1.1*
