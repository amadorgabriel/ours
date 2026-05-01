# Product Requirements Document (PRD)

## Project Ours - MVP

**Versão:** 1.0  
**Data:** Maio 2026  
**Status:** Rascunho para Desenvolvimento

---

## 1. Visão do Produto

### 1.1 Contexto

Project Ours é uma aplicação web PWA para cuidado colaborativo de pais entre irmãos. A plataforma incentiva o engajamento mútuo sem fomentar competitividade, focando em colaboração genuína.

### 1.2 Objetivo Principal

Aumentar o engajamento de irmãos no cuidado dos pais através de:

- Feed unificado de atividades (sem estatísticas individuais comparativas)
- Metas financeiras coletivas com privacidade de contribuições
- Registro simples de ligações e cuidados

### 1.3 Diferenciais

- **Privacidade nas contribuições:** Ninguém vê quanto cada irmão contribuiu individualmente
- **Sem rankings:** Feed mostra atividades, não comparações
- **Admin único:** Simplifica gestão da família

---

## 2. Arquitetura Definida


| Camada   | Tecnologia                                       |
| -------- | ------------------------------------------------ |
| Frontend | Next.js 14+ com PWA, TypeScript, TailwindCSS     |
| Backend  | API REST em C# (.NET 8+)                         |
| Database | PostgreSQL                                       |
| Auth     | OAuth Google apenas                              |
| Hosting  | Cloudflare (frontend), VPS Docker (backend + DB) |


---

## 3. Funcionalidades MVP (P0)

1. Sistema de Autenticação OAuth Google + Onboarding de Família
2. Gestão de Família (admin único, convites com link 24h, aprovação de membros)
3. Registro de Ligações (botão "Liguei agora", duração opcional)
4. Feed Unificado (visualização cronológica de atividades identificadas)
5. Metas Financeiras Coletivas (criação, contribuição anônima agregada, barra de progresso)

---

## 4. User Stories

### US-001: Autenticação e Criação de Família

**Como** primeiro irmão, **quero** criar uma família após login, **para** começar a usar o aplicativo.

**Critérios de Aceitação:**

- Given usuário não autenticado, when acessa a aplicação, then vê tela de login com Google
- Given usuário faz login Google pela primeira vez, when autenticação sucede, then é redirecionado para onboarding
- Given usuário no onboarding, when clica "Criar minha família", then família é criada e ele vira admin automaticamente
- Given família criada, when redirecionado, then vê dashboard com mensagem de boas-vindas

**Regras de Negócio:**

- Usuário só pode criar uma família se não pertencer a nenhuma
- Primeiro usuário da família automaticamente se torna admin
- Nome da família é obrigatório (3-50 caracteres)

**Mensagens:**

- Sucesso: "Família criada com sucesso! Convite seus irmãos."
- Erro: "Você já pertence a uma família."

---

### US-002: Gerar Convite para Família

**Como** admin, **quero** gerar um link de convite válido por 24h, **para** adicionar meus irmãos.

**Critérios de Aceitação:**

- Given admin na tela da família, when clica "Convidar irmão", then sistema gera código de 6 caracteres
- Given convite gerado, when exibido, then mostra código, URL completa e contador de 24h
- Given convite ativo, when admin clica "Copiar link", then link é copiado para clipboard
- Given convite existente, when admin gera novo, then convite anterior é invalidado

**Regras de Negócio:**

- Apenas admin pode gerar convites
- Código: 6 caracteres alfanuméricos (A-Z, 0-9)
- Expiração: 24 horas após geração
- Status do convite: [pending, accepted, rejected, expired]

**Edge Cases:**

- Convite expirado: mostra badge "Expirado" e permite gerar novo

---

### US-003: Entrar na Família via Convite

**Como** irmão convidado, **quero** entrar na família via link com aprovação do admin, **para** participar do cuidado.

**Critérios de Aceitação:**

- Given usuário acessa link com código, when código válido, then vê nome da família e botão "Solicitar entrada"
- Given usuário clica solicitar entrada, when usuário não logado, then redirecionado para login e volta após
- Given usuário logado solicita entrada, when request enviado, then status fica "Aguardando aprovação"
- Given solicitação aprovada, when admin aprova, then usuário vira membro da família

**Regras de Negócio:**

- Usuário não pode estar em outra família
- Convite deve estar com status "pending" e não expirado
- Novo membro entra com role "Member" (não admin)
- Admin deve aprovar explicitamente

**Mensagens:**

- Sucesso: "Solicitação enviada. Aguarde aprovação do administrador."
- Erro (código inválido): "Código de convite inválido ou expirado."
- Erro (já em família): "Você já pertence a uma família."

---

### US-004: Registrar Ligação

**Como** irmão, **quero** clicar em "Liguei agora" e registrar duração opcional, **para** documentar minha ligação.

**Critérios de Aceitação:**

- Given usuário no dashboard, when vê botão "Liguei Agora", then pode clicar para iniciar
- Given clique no botão, when inicia, then timer opcional começa a contar (00:00)
- Given ligação em andamento, when clica "Finalizar", then abre modal para preencher duração e notas
- Given finaliza registro, when salva, then atividade aparece no feed imediatamente

**Regras de Negócio:**

- Duração é opcional (pode deixar em branco)
- Notas são opcionais (máx 500 caracteres)
- Pode escolher qual pai/mãe ligou (se mais de um cadastrado)
- Timestamp automaticamente registrado

**Campos:**

- Duração (número, minutos, opcional)
- Notas (textarea, opcional)
- Selecionar pai/mãe (dropdown, opcional)

**Mensagens:**

- Sucesso: "Ligação registrada! 🎉"

---

### US-005: Visualizar Feed de Atividades

**Como** irmão, **quero** ver o feed de atividades da minha família, **para** acompanhar o cuidado aos pais.

**Critérios de Aceitação:**

- Given usuário logado, when acessa dashboard, then vê feed com atividades da família
- Given feed carregado, when visualiza, then itens ordenados cronologicamente (mais recente primeiro)
- Given atividade no feed, when ligação, then mostra "Ana ligou hoje • Duração: 15min"
- Given atividade no feed, when meta atingida, then mostra "Meta X atingiu 80%"

**Regras de Negócio:**

- Apenas atividades da própria família são visíveis
- Feed mostra: nome do irmão, tipo de atividade, timestamp relativo
- Paginação: 20 itens por vez, scroll infinito ou "Carregar mais"
- Atualização automática a cada 30 segundos ou pull-to-refresh

**Formatos de Display:**

- Ligação: "[Nome] ligou para [Pai] • [duração] • [tempo relativo]"
- Meta criada: "[Nome] criou a meta '[Título]'"
- Meta progresso: "Meta '[Título]' atingiu [X]%"
- Meta completa: "🎉 Meta '[Título]' foi atingida!"

---

### US-006: Criar Meta Financeira

**Como** irmão, **quero** criar uma meta financeira coletiva, **para** organizar gastos compartilhados.

**Critérios de Aceitação:**

- Given usuário na tela de metas, when clica "Nova Meta", then abre formulário
- Given formulário preenchido, when salva, then meta é criada com status "Ativa"
- Given meta criada, when redirecionado, then vê meta na lista com progresso 0%

**Regras de Negócio:**

- Qualquer membro pode criar meta (não apenas admin)
- Campos obrigatórios: título, valor alvo (targetAmount > 0)
- Valor alvo mínimo: R$ 10,00
- Status inicial: Active

**Campos:**

- Título (string, 3-100 caracteres, obrigatório)
- Valor Meta (decimal, maior que 0, obrigatório)

**Mensagens:**

- Sucesso: "Meta criada com sucesso!"
- Erro: "Valor da meta deve ser maior que R$ 10,00."

---

### US-007: Contribuir para Meta

**Como** irmão, **quero** contribuir para uma meta existente sem revelar meu valor aos outros, **para** manter privacidade.

**Critérios de Aceitação:**

- Given usuário na tela da meta, when clica "Contribuir", then abre modal com input de valor
- Given valor informado, when confirma, then contribuição é registrada
- Given contribuição registrada, when outros veem a meta, then veem apenas progresso agregado atualizado
- Given meta atingida, when contribuição completa, then status muda para "Completa" e banner de celebração aparece

**Regras de Negócio CRÍTICAS:**

- NINGUÉM vê quanto cada irmão contribuiu individualmente
- Todos veem: valor total arrecadado, valor alvo, % de progresso, quantidade de contribuições
- Apenas o próprio usuário vê seu histórico de contribuições
- Valor mínimo de contribuição: R$ 1,00

**Campos:**

- Valor (decimal, mínimo R$ 1,00, máximo restante da meta)

**Mensagens:**

- Sucesso: "Contribuição registrada!"
- Meta completa: "🎉 Meta atingida!"
- Erro: "Valor mínimo de contribuição é R$ 1,00."

---

### US-008: Visualizar Estatísticas Pessoais

**Como** irmão, **quero** ver minhas estatísticas pessoais, **para** me motivar a continuar ajudando.

**Critérios de Aceitação:**

- Given usuário no dashboard, when acessa, then vê card com suas estatísticas
- Given visualiza estatísticas, when olha dados, then vê: ligações este mês, total de minutos, streak
- Given estatísticas carregadas, when compara com meta pessoal, then sistema mostra progresso individual

**Regras de Negócio:**

- Estatísticas são PESSOAIS (apenas o próprio usuário vê)
- Não há comparação com outros irmãos
- Streak = dias consecutivos com pelo menos uma ligação

**Métricas:**

- Ligações este mês (count)
- Ligações mês passado (count)
- Total de minutos este mês
- Streak atual (dias consecutivos)

---

### US-009: Gerenciar Dados dos Pais (Admin)

**Como** admin, **quero** editar dados dos meus pais (nome, info médica), **para** manter informações atualizadas.

**Critérios de Aceitação:**

- Given admin na tela da família, when visualiza seção pais, then vê cards com nome e resumo
- Given admin clica em card, when acessa detalhes, then vê informações completas
- Given admin clica editar, when altera dados, then pode salvar alterações

**Regras de Negócio:**

- Apenas admin pode editar dados dos pais
- Membros podem apenas visualizar
- Campos: nome (obrigatório), data de nascimento (opcional), informações médicas (opcional), briefing de emergência (opcional)

**Campos:**

- Nome (string, 2-100 caracteres, obrigatório)
- Data de Nascimento (date, opcional)
- Informações Médicas (textarea, opcional)
- Briefing de Emergência (textarea, opcional)

---

## 5. Diagrama de Entidades (ERD)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│      User       │     │     Family      │     │     Parent      │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ PK id (uuid)    │     │ PK id (uuid)    │     │ PK id (uuid)    │
│ email (string)  │────<│ FK adminId (uuid)│     │ FK familyId (uuid)│
│ name (string)   │  N:1│ name (string)   │<────│ name (string)   │
│ picture (string)│     │ createdAt (dt)  │  1:N│ birthDate (date)│
│ role (enum)     │     │                 │     │ medicalInfo (json)│
│ familyId (uuid) │>────┘                 │     │ emergencyBrief (text)│
│ joinedAt (dt)   │    1:N                │     │                 │
│ createdAt (dt)  │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │
         │                       │
         │ 1:N                   │ 1:N
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│  FamilyInvite   │     │    Activity     │
├─────────────────┤     ├─────────────────┤
│ PK id (uuid)    │     │ PK id (uuid)    │
│ FK familyId (uuid)    │ FK familyId (uuid)│
│ inviteCode (string 6) │ FK userId (uuid)│
│ invitedEmail (string?)│ FK parentId (uuid?)│
│ expiresAt (dt)  │     │ type (enum)     │
│ status (enum)   │     │ metadata (jsonb)│
│ createdAt (dt)  │     │ createdAt (dt)  │
└─────────────────┘     └─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│      Goal       │     │ GoalContribution│
├─────────────────┤     ├─────────────────┤
│ PK id (uuid)    │     │ PK id (uuid)    │
│ FK familyId (uuid)    │ FK goalId (uuid)│
│ title (string)  │<────│ FK userId (uuid)│
│ targetAmount (dec)    │ amount (dec)    │
│ currentAmount (dec)   │ createdAt (dt)  │
│ status (enum)   │     │                 │
│ createdBy (uuid)│     │                 │
│ createdAt (dt)  │     │                 │
│ completedAt (dt?)     │                 │
└─────────────────┘     └─────────────────┘
```

### 5.1 Detalhamento das Entidades

#### User


| Campo     | Tipo        | Obrigatório | Descrição                  |
| --------- | ----------- | ----------- | -------------------------- |
| id        | UUID        | Sim         | Identificador único        |
| email     | string(255) | Sim         | Email do Google            |
| name      | string(100) | Sim         | Nome do usuário            |
| picture   | string(500) | Não         | URL da foto do Google      |
| role      | enum        | Sim         | Admin, Member              |
| familyId  | UUID        | Não         | Referência à família       |
| joinedAt  | datetime    | Não         | Data de entrada na família |
| createdAt | datetime    | Sim         | Data de criação            |


#### Family


| Campo     | Tipo        | Obrigatório | Descrição           |
| --------- | ----------- | ----------- | ------------------- |
| id        | UUID        | Sim         | Identificador único |
| name      | string(100) | Sim         | Nome da família     |
| adminId   | UUID        | Sim         | FK para User admin  |
| createdAt | datetime    | Sim         | Data de criação     |


#### Parent


| Campo             | Tipo        | Obrigatório | Descrição                           |
| ----------------- | ----------- | ----------- | ----------------------------------- |
| id                | UUID        | Sim         | Identificador único                 |
| familyId          | UUID        | Sim         | FK para Family                      |
| name              | string(100) | Sim         | Nome do pai/mãe                     |
| birthDate         | date        | Não         | Data de nascimento                  |
| medicalInfo       | jsonb       | Não         | Informações médicas (JSON flexível) |
| emergencyBriefing | text        | Não         | Instruções de emergência            |


#### FamilyInvite


| Campo        | Tipo        | Obrigatório | Descrição                            |
| ------------ | ----------- | ----------- | ------------------------------------ |
| id           | UUID        | Sim         | Identificador único                  |
| familyId     | UUID        | Sim         | FK para Family                       |
| inviteCode   | string(6)   | Sim         | Código alfanumérico                  |
| invitedEmail | string(255) | Não         | Email do convidado (opcional)        |
| expiresAt    | datetime    | Sim         | Data de expiração (24h)              |
| status       | enum        | Sim         | Pending, Accepted, Rejected, Expired |
| createdAt    | datetime    | Sim         | Data de criação                      |


#### Activity


| Campo     | Tipo     | Obrigatório | Descrição                              |
| --------- | -------- | ----------- | -------------------------------------- |
| id        | UUID     | Sim         | Identificador único                    |
| familyId  | UUID     | Sim         | FK para Family                         |
| userId    | UUID     | Sim         | FK para User (quem fez)                |
| parentId  | UUID     | Não         | FK para Parent (se aplicável)          |
| type      | enum     | Sim         | Call, Visit, Medical, Task, Medication |
| metadata  | jsonb    | Não         | Dados específicos (duração, notas)     |
| createdAt | datetime | Sim         | Data da atividade                      |


**Activity Metadata por Tipo:**

- Call: `{ durationMinutes?: number, notes?: string }`
- Visit: `{ durationHours?: number, notes?: string }`
- Medical: `{ appointmentType?: string, notes?: string }`
- Task: `{ taskType?: string, completed?: boolean }`
- Medication: `{ medicationName?: string, dosage?: string }`

#### Goal


| Campo         | Tipo          | Obrigatório | Descrição                    |
| ------------- | ------------- | ----------- | ---------------------------- |
| id            | UUID          | Sim         | Identificador único          |
| familyId      | UUID          | Sim         | FK para Family               |
| title         | string(100)   | Sim         | Título da meta               |
| targetAmount  | decimal(10,2) | Sim         | Valor alvo                   |
| currentAmount | decimal(10,2) | Sim         | Valor arrecadado (default 0) |
| status        | enum          | Sim         | Active, Completed, Cancelled |
| createdBy     | UUID          | Sim         | FK para User (criador)       |
| createdAt     | datetime      | Sim         | Data de criação              |
| completedAt   | datetime      | Não         | Data de conclusão            |


#### GoalContribution


| Campo     | Tipo          | Obrigatório | Descrição                   |
| --------- | ------------- | ----------- | --------------------------- |
| id        | UUID          | Sim         | Identificador único         |
| goalId    | UUID          | Sim         | FK para Goal                |
| userId    | UUID          | Sim         | FK para User (contribuinte) |
| amount    | decimal(10,2) | Sim         | Valor contribuído           |
| createdAt | datetime      | Sim         | Data da contribuição        |


---

## 6. Endpoints API REST

### 6.1 Autenticação

#### POST /api/auth/google

Autenticação via Google OAuth.

**Request:**

```json
{
  "idToken": "string" // Google ID Token
}
```

**Response (200):**

```json
{
  "token": "jwt_token_string",
  "user": {
    "id": "uuid",
    "email": "user@email.com",
    "name": "João Silva",
    "picture": "https://...",
    "role": "Member",
    "familyId": "uuid"
  },
  "isNewUser": true,
  "hasFamily": false
}
```

**Erros:**

- 401: Token Google inválido ou expirado
- 403: Email não verificado no Google

---

### 6.2 Família

#### POST /api/families

Cria nova família (usuário vira admin).

**Headers:** Authorization: Bearer {token}

**Request:**

```json
{
  "name": "Família Silva"
}
```

**Response (201):**

```json
{
  "id": "uuid",
  "name": "Família Silva",
  "adminId": "uuid",
  "admin": { /* user object */ },
  "members": [],
  "parents": [],
  "createdAt": "2026-05-01T10:00:00Z"
}
```

**Erros:**

- 400: Usuário já pertence a uma família
- 400: Nome inválido (mín 3, máx 50 caracteres)

---

#### GET /api/families/my-family

Retorna família do usuário logado.

**Headers:** Authorization: Bearer {token}

**Response (200):**

```json
{
  "id": "uuid",
  "name": "Família Silva",
  "admin": { /* user object */ },
  "members": [
    { "id": "uuid", "name": "Ana", "role": "Member", "picture": "...", "joinedAt": "..." }
  ],
  "parents": [
    { "id": "uuid", "name": "Mãe", "birthDate": "...", "medicalInfo": {...} }
  ],
  "invite": { /* convite ativo, se houver */ }
}
```

**Erros:**

- 404: Usuário não pertence a nenhuma família

---

#### POST /api/families/invite

Gera convite para família (apenas admin).

**Headers:** Authorization: Bearer {token}

**Response (201):**

```json
{
  "inviteCode": "ABC123",
  "expiresAt": "2026-05-02T10:00:00Z",
  "inviteUrl": "https://ours.app/family/join?code=ABC123"
}
```

**Erros:**

- 403: Usuário não é admin

---

#### POST /api/families/join

Solicita entrada em família via código.

**Headers:** Authorization: Bearer {token}

**Request:**

```json
{
  "inviteCode": "ABC123"
}
```

**Response (200):**

```json
{
  "status": "pending_approval",
  "message": "Aguardando aprovação do administrador."
}
```

**Erros:**

- 400: Código inválido ou expirado
- 400: Usuário já pertence a uma família
- 400: Convite já foi usado ou rejeitado

---

#### GET /api/families/pending-approvals

Lista solicitações pendentes (apenas admin).

**Headers:** Authorization: Bearer {token}

**Response (200):**

```json
{
  "pendingUsers": [
    {
      "userId": "uuid",
      "name": "Carlos",
      "email": "carlos@email.com",
      "picture": "...",
      "requestedAt": "2026-05-01T10:00:00Z"
    }
  ]
}
```

---

#### POST /api/families/approve/{userId}

Aprova entrada de membro (apenas admin).

**Headers:** Authorization: Bearer {token}

**Response (200):**

```json
{
  "message": "Membro aprovado com sucesso.",
  "user": { /* user object atualizado */ }
}
```

---

#### POST /api/families/reject/{userId}

Rejeita solicitação de entrada (apenas admin).

**Headers:** Authorization: Bearer {token}

**Response (200):**

```json
{
  "message": "Solicitação rejeitada."
}
```

---

#### PUT /api/families/parents/{parentId}

Atualiza dados do pai/mãe (apenas admin).

**Headers:** Authorization: Bearer {token}

**Request:**

```json
{
  "name": "Mãe Atualizada",
  "birthDate": "1960-05-15",
  "medicalInfo": { "alergies": "Nenhuma" },
  "emergencyBriefing": "Contato emergência: 99999-9999"
}
```

**Response (200):**

```json
{
  "id": "uuid",
  "name": "Mãe Atualizada",
  "birthDate": "1960-05-15",
  "medicalInfo": { "alergies": "Nenhuma" },
  "emergencyBriefing": "Contato emergência: 99999-9999"
}
```

**Erros:**

- 403: Usuário não é admin
- 404: Pai/mãe não encontrado

---

### 6.3 Atividades

#### POST /api/activities/call

Registra ligação realizada.

**Headers:** Authorization: Bearer {token}

**Request:**

```json
{
  "parentId": "uuid", // opcional
  "durationMinutes": 15, // opcional
  "notes": "Conversa sobre consulta médica" // opcional
}
```

**Response (201):**

```json
{
  "id": "uuid",
  "type": "Call",
  "user": { /* user resumido */ },
  "parent": { /* parent resumido, se informado */ },
  "metadata": {
    "durationMinutes": 15,
    "notes": "Conversa sobre consulta médica"
  },
  "createdAt": "2026-05-01T14:30:00Z"
}
```

---

#### GET /api/activities/feed

Retorna feed de atividades da família.

**Headers:** Authorization: Bearer {token}

**Query Params:**

- limit: number (default 20, max 50)
- offset: number (default 0)

**Response (200):**

```json
{
  "activities": [
    {
      "id": "uuid",
      "type": "Call",
      "user": { "name": "Ana", "picture": "..." },
      "parent": { "name": "Pai" },
      "metadata": { "durationMinutes": 15 },
      "createdAt": "2026-05-01T14:30:00Z",
      "formattedTime": "hoje, 14:30"
    }
  ],
  "hasMore": true,
  "total": 156
}
```

---

#### GET /api/activities/my-stats

Retorna estatísticas pessoais do usuário.

**Headers:** Authorization: Bearer {token}

**Response (200):**

```json
{
  "totalCallsThisMonth": 8,
  "totalCallsLastMonth": 12,
  "totalDurationThisMonth": 145,
  "currentStreakDays": 5
}
```

---

### 6.4 Metas Financeiras

#### POST /api/goals

Cria nova meta financeira.

**Headers:** Authorization: Bearer {token}

**Request:**

```json
{
  "title": "Remédio de Junho",
  "targetAmount": 500.00
}
```

**Response (201):**

```json
{
  "id": "uuid",
  "title": "Remédio de Junho",
  "targetAmount": 500.00,
  "currentAmount": 0,
  "status": "Active",
  "progressPercent": 0,
  "contributionsCount": 0,
  "creatorName": "João",
  "createdAt": "2026-05-01T10:00:00Z"
}
```

**Erros:**

- 400: Valor mínimo de R$ 10,00
- 400: Título inválido

---

#### GET /api/goals

Lista metas da família.

**Headers:** Authorization: Bearer {token}

**Response (200):**

```json
{
  "goals": [
    {
      "id": "uuid",
      "title": "Remédio de Junho",
      "targetAmount": 500.00,
      "currentAmount": 350.00,
      "status": "Active",
      "progressPercent": 70,
      "contributionsCount": 12,
      "creatorName": "João"
    }
  ]
}
```

**Importante:** Não inclui valores individuais de contribuições.

---

#### GET /api/goals/{goalId}

Detalhes da meta.

**Headers:** Authorization: Bearer {token}

**Response (200):**

```json
{
  "id": "uuid",
  "title": "Remédio de Junho",
  "targetAmount": 500.00,
  "currentAmount": 350.00,
  "status": "Active",
  "progressPercent": 70,
  "contributionsCount": 12,
  "creatorName": "João",
  "isCompleted": false,
  "myTotalContribution": 150.00, // apenas do usuário logado
  "recentActivity": [
    {
      "type": "contribution",
      "message": "Alguém contribuiu",
      "timeAgo": "há 2 horas"
    }
  ],
  "createdAt": "2026-05-01T10:00:00Z"
}
```

**Nota:** O campo `recentActivity` nunca revela quem contribuiu ou quanto.

---

#### POST /api/goals/{goalId}/contribute

Contribui para meta.

**Headers:** Authorization: Bearer {token}

**Request:**

```json
{
  "amount": 100.00
}
```

**Response (200):**

```json
{
  "contributionId": "uuid",
  "newProgressPercent": 90,
  "isCompleted": false,
  "message": "Contribuição registrada!"
}
```

**Response quando completa (200):**

```json
{
  "contributionId": "uuid",
  "newProgressPercent": 100,
  "isCompleted": true,
  "message": "🎉 Meta atingida!"
}
```

**Erros:**

- 400: Valor mínimo de R$ 1,00
- 400: Meta não está ativa
- 400: Valor excede o restante da meta

---

#### GET /api/goals/my-contributions

Histórico de contribuições do usuário logado.

**Headers:** Authorization: Bearer {token}

**Response (200):**

```json
{
  "contributions": [
    {
      "id": "uuid",
      "goalId": "uuid",
      "goalTitle": "Remédio de Junho",
      "amount": 100.00,
      "createdAt": "2026-05-01T10:00:00Z"
    }
  ],
  "totalContributed": 450.00
}
```

---

#### POST /api/goals/{goalId}/cancel

Cancela meta (apenas admin ou criador).

**Headers:** Authorization: Bearer {token}

**Response (200):**

```json
{
  "message": "Meta cancelada com sucesso."
}
```

**Erros:**

- 403: Usuário não é admin nem criador
- 400: Meta já está completa ou cancelada

---

## 7. Fluxos de Telas

### 7.1 Onboarding

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Tela Login    │────>│  Onboarding     │────>│   Dashboard     │
│                 │     │                 │     │                 │
│ • Logo          │     │ • Boas-vindas   │     │ • Feed          │
│ • "Entrar com   │     │ • "Criar minha  │     │ • Botão ligação │
│   Google"       │     │   família"      │     │ • Resumo semana │
│ • Mensagem      │     │ • Input nome    │     │                 │
│   inspiradora   │     │ • Botão criar   │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │
        │ já autenticado sem família
        └───────────────────────────────────────────────┐
                                                        ▼
                                              ┌─────────────────┐
                                              │   Onboarding    │
                                              └─────────────────┘
        │ já autenticado com família
        └───────────────────────────────────────────────┐
                                                        ▼
                                              ┌─────────────────┐
                                              │   Dashboard     │
                                              └─────────────────┘
```

### 7.2 Registro de Ligação

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Dashboard     │────>│   Timer Ligação │────>│   Modal Final   │
│                 │     │                 │     │                 │
│ • Botão "Liguei │     │ • Contador      │     │ • Input duração │
│   Agora"        │     │   00:00         │     │ • Input notas   │
│                 │────>│ • Botão         │     │ • Botão salvar  │
│                 │     │   "Finalizar"   │     │                 │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                              ┌─────────────────┐
                                              │   Dashboard     │
                                              │   Atualizado    │
                                              │   • Feed com    │
                                              │     nova        │
                                              │     atividade   │
                                              └─────────────────┘
```

### 7.3 Fluxo de Convite e Aprovação

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Admin Gera     │     │  Irmão Recebe   │     │  Irmão Solicita │
│  Convite        │     │  Link           │     │  Entrada        │
│                 │     │                 │     │                 │
│ • Tela Família  │     │ • URL com       │     │ • Vê nome da    │
│ • Botão         │     │   código        │     │   família       │
│   "Convidar"    │     │ • "Você foi     │     │ • "Solicitar    │
│ • Modal com     │     │   convidado..." │     │   entrada"      │
│   código/URL    │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Admin Aprova   │<────│  Admin Vê       │<────│  Status:        │
│                 │     │  Solicitação    │     │  Aguardando     │
│ • Lista de      │     │                 │     │  Aprovação      │
│   pendentes     │     │ • Lista com     │     │                 │
│ • Botão         │     │   nome/email    │     │ • Mensagem:     │
│   "Aprovar"     │     │ • "Aprovar" /   │     │   "Aguardando   │
│ • Notificação   │     │   "Rejeitar"    │     │   aprovação"    │
│   de sucesso    │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │
        ▼
┌─────────────────┐
│  Irmão agora    │
│  é membro       │
└─────────────────┘
```

### 7.4 Criação e Contribuição para Meta

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Lista de Metas │────>│  Criar Meta     │────>│  Detalhe Meta   │
│                 │     │  (Modal)        │     │                 │
│ • Metas ativas  │     │ • Título        │     │ • Progresso     │
│ • Botão "+Nova" │     │ • Valor alvo    │     │ • Botão         │
│ • Progresso     │     │ • Botão criar   │     │   "Contribuir"  │
│   bars          │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                              ┌─────────────────┐
                                              │  Modal Contrib  │
                                              │                 │
                                              │ • Input valor   │
                                              │ • Botão         │
                                              │   confirmar     │
                                              └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Meta Completa! │<────│  Atualização    │<────│  Confirmação    │
│                 │     │  automática     │     │                 │
│ • Banner 🎉     │     │                 │     │ • Valor         │
│ • Barra 100%    │     │ • Barra         │     │   registrado    │
│ • Botão         │     │   animada       │     │ • Progresso     │
│   desabilitado  │     │ • Toast sucesso │     │   atualizado    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## 8. Wireframes Textuais (Mobile-First)

### 8.1 Tela de Login

```
┌─────────────────────────┐
│                         │
│      [LOGO]             │
│                         │
│   Cuide dos seus pais   │
│   junto com seus irmãos │
│                         │
│                         │
│  ┌───────────────────┐  │
│  │  🔵 Entrar com    │  │
│  │     Google        │  │
│  └───────────────────┘  │
│                         │
│  ────── ou ──────       │
│                         │
│  [Email input    ]      │
│  [Senha input    ]      │
│                         │
│  [   Entrar   ]         │
│                         │
│                         │
│  Esqueceu a senha?      │
│                         │
└─────────────────────────┘
```

**Nota:** MVP usa apenas Google OAuth. Email/senha é opcional futuro.

---

### 8.2 Tela de Onboarding

```
┌─────────────────────────┐
│  ←                      │
│                         │
│   Bem-vindo! 🎉         │
│                         │
│   Para começar, crie    │
│   sua família:          │
│                         │
│   Nome da Família       │
│  ┌───────────────────┐  │
│  │ Família Silva     │  │
│  └───────────────────┘  │
│                         │
│                         │
│  ┌───────────────────┐  │
│  │  Criar Família    │  │
│  └───────────────────┘  │
│                         │
│  Ao criar, você será    │
│  o administrador e      │
│  poderá convidar seus   │
│  irmãos.                │
│                         │
└─────────────────────────┘
```

---

### 8.3 Dashboard (Tela Principal)

```
┌─────────────────────────┐
│  [Logo]          [😊▼]  │  ← Header com avatar
│                         │
│  Olá, João! 👋          │
│                         │
│  ┌───────────────────┐  │
│  │  📞 LIGUEI AGORA  │  │  ← Botão principal
│  │                   │  │
│  │   (círculo       │  │
│  │    destacado)    │  │
│  └───────────────────┘  │
│                         │
│  ── Resumo da Semana ── │
│                         │
│  ┌─────┐ ┌─────┐ ┌────┐ │
│  │📞   │ │📞   │ │💰  │ │  ← Cards scrolláveis
│  │ 8   │ │ 3   │ │ 75%│ │
│  │totais│ │suas │ │meta│ │
│  └─────┘ └─────┘ └────┘ │
│                         │
│  ──── Atividades ────    │
│                         │
│  ┌───────────────────┐  │
│  │ 😊 Ana            │  │
│  │ ligou para o Pai  │  │
│  │ • 15 min • hoje   │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ 😊 Você           │  │
│  │ ligou para a Mãe  │  │
│  │ • 20 min • ontem  │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ 🎉 Meta atingida! │  │
│  │ Remédio atingiu   │  │
│  │ 100% • há 2 horas │  │
│  └───────────────────┘  │
│                         │
│  ┌────────┬────────┬───┐│
│  │ 🏠     │  👨‍👩‍👧   │ 💰││  ← Bottom nav
│  │Início  │Família │Metas│
│  └────────┴────────┴───┘│
└─────────────────────────┘
```

---

### 8.4 Registro de Ligação (Timer)

```
┌─────────────────────────┐
│  ←           Ligação    │
│                         │
│                         │
│         ┌─────┐         │
│         │ 📞  │         │
│         │     │         │
│         │15:42│         │  ← Timer
│         │     │         │
│         └─────┘         │
│                         │
│       Em andamento...   │
│                         │
│                         │
│  ┌───────────────────┐  │
│  │  Finalizar Ligação │  │
│  └───────────────────┘  │
│                         │
│                         │
└─────────────────────────┘
```

---

### 8.5 Modal Finalizar Ligação

```
┌─────────────────────────┐
│                         │
│   ┌───────────────┐     │
│   │               │     │
│   │  📞           │     │
│   │               │     │
│   │  Como foi a   │     │
│   │  ligação?     │     │
│   │               │     │
│   │  Duração      │     │
│   │  ┌─────────┐  │     │
│   │  │ 15 min  │  │     │
│   │  └─────────┘  │     │
│   │               │     │
│   │  Notas        │     │
│   │  ┌─────────┐  │     │
│   │  │Conversa │  │     │
│   │  │sobre... │  │     │
│   │  └─────────┘  │     │
│   │               │     │
│   │  ┌─────────┐  │     │
│   │  │  Salvar │  │     │
│   │  └─────────┘  │     │
│   │               │     │
│   └───────────────┘     │
│                         │
└─────────────────────────┘
```

---

### 8.6 Tela Família

```
┌─────────────────────────┐
│  ←           Família    │
│                         │
│  ┌───────────────────┐  │
│  │ 🏠 Família Silva  │  │
│  │ [Admin]           │  │  ← Badge admin
│  └───────────────────┘  │
│                         │
│  ───── Membros ──────   │
│                         │
│  ┌───────────────────┐  │
│  │ 😊 João (você)    │  │
│  │    Admin • desde  │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ 😊 Ana            │  │
│  │    Membro • desde │  │
│  └───────────────────┘  │
│                         │
│  [+ Convidar Irmão]     │  ← Apenas admin
│                         │
│  ─────── Pais ───────   │
│                         │
│  ┌───────────────────┐  │
│  │ 👤 Mãe            │  │
│  │ 64 anos           │  │
│  │ >                 │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ 👤 Pai            │  │
│  │ 66 anos           │  │
│  │ >                 │  │
│  └───────────────────┘  │
│                         │
└─────────────────────────┘
```

---

### 8.7 Modal Convidar Irmão

```
┌─────────────────────────┐
│                         │
│   ┌───────────────┐     │
│   │               │     │
│   │  👨‍👩‍👧        │     │
│   │               │     │
│   │  Convidar     │     │
│   │  Irmão        │     │
│   │               │     │
│   │  Envie este   │     │
│   │  link. Expira │     │
│   │  em 24h:      │     │
│   │               │     │
│   │  ┌─────────┐  │     │
│   │  │ABC123   │  │     │  ← Código
│   │  └─────────┘  │     │
│   │               │     │
│   │  [🔗 Copiar Link]  ││
│   │               │     │
│   │  ou           │     │
│   │               │     │
│   │  [Gerar novo] │     │
│   │               │     │
│   │  Expira:      │     │
│   │  02/05 10:00  │     │
│   │               │     │
│   └───────────────┘     │
│                         │
└─────────────────────────┘
```

---

### 8.8 Tela Metas Financeiras

```
┌─────────────────────────┐
│  ←           Metas      │
│                         │
│  ┌───────────────────┐  │
│  │ 💰 R$ 350 de R$ 500 │ │
│  │ arrecadados este mês│ │
│  └───────────────────┘  │
│                         │
│  [+ Nova Meta]          │
│                         │
│  ──── Minhas Contrib ── │
│  Você contribuiu R$ 150 │
│                         │
│  ─────── Metas ───────  │
│                         │
│  ┌───────────────────┐  │
│  │ Remédio de Junho  │  │
│  │                   │  │
│  │ ████████████░░ 70% │  │
│  │                   │  │
│  │ R$ 350 de R$ 500  │  │
│  │ 12 contribuições  │  │
│  │ [Ativa]      [>]  │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ Exame Julho       │  │
│  │                   │  │
│  │ ██████████████████ │  │
│  │ 100% 🎉           │  │
│  │ R$ 800 de R$ 800  │  │
│  │ [Completa]   [>]  │  │
│  └───────────────────┘  │
│                         │
└─────────────────────────┘
```

---

### 8.9 Tela Detalhe da Meta

```
┌─────────────────────────┐
│  ←   Remédio de Junho   │
│                         │
│  ┌───────────────────┐  │
│  │                   │  │
│  │   ████████████░   │  │
│  │      70%          │  │
│  │                   │  │
│  │  R$ 350 de R$ 500 │  │
│  │  [Ativa]          │  │
│  │                   │  │
│  │  12 contribuições │  │
│  │  no total         │  │
│  │                   │  │
│  └───────────────────┘  │
│                         │
│  ──── Sua Contribuição ─│
│  Você contribuiu R$ 150 │
│  • R$ 100 em 10/06      │
│  • R$ 50 em 15/06       │
│                         │
│  ───── Contribuir ───── │
│  Quanto quer contribuir?│
│  ┌───────────────────┐  │
│  │ R$ [    50      ] │  │
│  └───────────────────┘  │
│  [   Contribuir   ]     │
│                         │
│  ── Atividade Recent ── │
│  • Alguém contribuiu    │
│    há 2 horas           │
│  • Alguém contribuiu    │
│    ontem                │
│                         │
│  [Cancelar Meta]        │  ← Só admin/criador
│                         │
└─────────────────────────┘
```

---

## 9. Regras de Negócio Específicas

### 9.1 Permissões de Admin


| Ação                      | Admin          | Membro            |
| ------------------------- | -------------- | ----------------- |
| Criar/editar família      | ✅              | ❌                 |
| Aprovar/recusar convites  | ✅              | ❌                 |
| Gerar links de convite    | ✅              | ❌                 |
| Editar dados dos pais     | ✅              | ❌                 |
| Cancelar metas            | ✅ (ou criador) | ✅ (só se criador) |
| Criar metas               | ✅              | ✅                 |
| Contribuir para metas     | ✅              | ✅                 |
| Registrar ligações        | ✅              | ✅                 |
| Ver feed                  | ✅              | ✅                 |
| Ver estatísticas pessoais | ✅              | ✅                 |


### 9.2 Feed de Atividades

**Formatos de exibição:**

- **Ligação:** "[Nome] ligou para [Pai] • [duração] • [tempo relativo]"
  - Exemplo: "Ana ligou hoje • Duração: 15min"
- **Meta progresso:** "Meta '[Título]' atingiu [X]%"
- **Meta completa:** "🎉 Meta '[Título]' foi atingida!"

**Restrições:**

- NUNCA mostrar valores individuais de contribuição
- NUNCA mostrar ranking de irmãos
- Sempre ordenar por createdAt DESC

### 9.3 Metas Financeiras

**Privacidade:**

- ✅ Todos veem: progresso agregado, %, quantidade de contribuições
- ❌ NINGUÉM vê: quanto cada irmão contribuiu
- ✅ Usuário logado vê: seu total contribuído e histórico

**Fluxo de status:**

```
Active ──contribuição──> Active (currentAmount += amount)
   │                         │
   │                         │
   └──currentAmount >= targetAmount──> Completed
   │
   └──cancel──> Cancelled
```

### 9.4 Convites

**Ciclo de vida do convite:**

```
Pending ──expiração 24h──> Expired
   │
   ├──aceite──> Accepted
   │
   └──rejeite──> Rejected
```

**Validações:**

- Código único por família ativo (novo convite invalida anterior)
- Usuário não pode estar em outra família
- Email do convidado é opcional

### 9.5 Restrições do MVP


| Funcionalidade                 | Status                     |
| ------------------------------ | -------------------------- |
| Notificações push              | ❌ Não incluso              |
| Criptografia end-to-end        | ❌ Server-side apenas       |
| Múltiplas famílias por usuário | ❌ Um usuário = uma família |
| Idiomas                        | ✅ Apenas PT-BR             |
| App nativo                     | ❌ PWA apenas               |


---

## 10. Critérios de Aceitação por User Story

### US-001: Autenticação e Criação de Família


| #   | Critério                                                     | Tipo      |
| --- | ------------------------------------------------------------ | --------- |
| 1.1 | Tela de login exibe botão "Entrar com Google"                | Funcional |
| 1.2 | Usuário novo redirecionado para onboarding                   | Funcional |
| 1.3 | Formulário de criação de família valida nome (3-50 chars)    | Funcional |
| 1.4 | Após criação, usuário é admin e é redirecionado ao dashboard | Funcional |
| 1.5 | Tentativa de criar segunda família retorna erro 400          | Funcional |
| 1.6 | JWT token é gerado e armazenado no client                    | Técnico   |


### US-002: Gerar Convite


| #   | Critério                                     | Tipo      |
| --- | -------------------------------------------- | --------- |
| 2.1 | Apenas admin vê botão "Convidar irmão"       | Funcional |
| 2.2 | Código gerado tem 6 caracteres alfanuméricos | Funcional |
| 2.3 | Expiração é exatamente 24h após geração      | Funcional |
| 2.4 | URL completa é exibida e copiável            | Funcional |
| 2.5 | Novo convite invalida o anterior             | Funcional |
| 2.6 | Contador regressivo de 24h é visível         | UX        |


### US-003: Entrar na Família


| #   | Critério                                      | Tipo      |
| --- | --------------------------------------------- | --------- |
| 3.1 | Link com código exibe nome da família         | Funcional |
| 3.2 | Usuário não logado é redirecionado para login | Funcional |
| 3.3 | Após login, retorna ao link automaticamente   | Funcional |
| 3.4 | Solicitação cria registro com status pending  | Funcional |
| 3.5 | Código expirado exibe mensagem específica     | Funcional |
| 3.6 | Usuário em outra família vê erro específico   | Funcional |


### US-004: Registrar Ligação


| #   | Critério                                     | Tipo        |
| --- | -------------------------------------------- | ----------- |
| 4.1 | Botão "Liguei Agora" é destaque no dashboard | UX          |
| 4.2 | Timer inicia ao clicar e é opcional          | Funcional   |
| 4.3 | Modal permite duração e notas (opcionais)    | Funcional   |
| 4.4 | Registro aparece no feed em < 2s             | Performance |
| 4.5 | Toast de confirmação é exibido               | UX          |
| 4.6 | Erro de API mostra toast com retry           | Funcional   |


### US-005: Visualizar Feed


| #   | Critério                                            | Tipo        |
| --- | --------------------------------------------------- | ----------- |
| 5.1 | Feed mostra apenas atividades da família do usuário | Segurança   |
| 5.2 | Ordenação é cronológica decrescente                 | Funcional   |
| 5.3 | Lazy loading funciona (20 itens por vez)            | Performance |
| 5.4 | Timestamps são relativos (hoje, ontem, X dias)      | UX          |
| 5.5 | Pull-to-refresh atualiza o feed                     | UX          |
| 5.6 | Empty state exibe mensagem amigável                 | UX          |


### US-006: Criar Meta


| #   | Critério                              | Tipo      |
| --- | ------------------------------------- | --------- |
| 6.1 | Qualquer membro pode criar meta       | Funcional |
| 6.2 | Título obrigatório (3-100 chars)      | Funcional |
| 6.3 | Valor alvo mínimo R$ 10,00            | Funcional |
| 6.4 | Meta criada com status Active         | Funcional |
| 6.5 | Redirecionamento para detalhe da meta | UX        |
| 6.6 | Erros de validação exibidos inline    | UX        |


### US-007: Contribuir para Meta


| #   | Critério                                   | Tipo      |
| --- | ------------------------------------------ | --------- |
| 7.1 | Valor mínimo de contribuição é R$ 1,00     | Funcional |
| 7.2 | Progresso atualizado em tempo real         | UX        |
| 7.3 | NINGUÉM vê valor individual de outros      | Segurança |
| 7.4 | Usuário vê próprio total na tela da meta   | Funcional |
| 7.5 | Meta atingida exibe banner de celebração   | UX        |
| 7.6 | Status muda para Completed automaticamente | Funcional |


### US-008: Estatísticas Pessoais


| #   | Critério                                                | Tipo        |
| --- | ------------------------------------------------------- | ----------- |
| 8.1 | Estatísticas são visíveis apenas para o próprio usuário | Segurança   |
| 8.2 | Dashboard mostra resumo pessoal                         | Funcional   |
| 8.3 | Streak é calculado corretamente                         | Funcional   |
| 8.4 | Não há comparação com outros irmãos                     | UX          |
| 8.5 | Dados atualizados em tempo real                         | Performance |


### US-009: Gerenciar Dados dos Pais


| #   | Critério                             | Tipo      |
| --- | ------------------------------------ | --------- |
| 9.1 | Apenas admin vê botão "Editar"       | Segurança |
| 9.2 | Membros podem visualizar informações | Funcional |
| 9.3 | Nome é obrigatório (2-100 chars)     | Funcional |
| 9.4 | MedicalInfo armazenado como JSONB    | Técnico   |
| 9.5 | Alterações persistem e são imediatas | Funcional |


---

## 11. Definições Técnicas

### 11.1 Enums

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

### 11.2 Códigos HTTP


| Endpoint                    | 200 | 201 | 400 | 401 | 403 | 404 |
| --------------------------- | --- | --- | --- | --- | --- | --- |
| POST /auth/google           | -   | -   | ✅   | ✅   | ✅   | -   |
| POST /families              | -   | ✅   | ✅   | ✅   | -   | -   |
| GET /families/my            | ✅   | -   | -   | ✅   | -   | ✅   |
| POST /invite                | -   | ✅   | -   | ✅   | ✅   | -   |
| POST /join                  | ✅   | -   | ✅   | ✅   | -   | -   |
| POST /activities/call       | -   | ✅   | ✅   | ✅   | -   | -   |
| GET /activities/feed        | ✅   | -   | -   | ✅   | -   | -   |
| POST /goals                 | -   | ✅   | ✅   | ✅   | -   | -   |
| POST /goals/{id}/contribute | ✅   | -   | ✅   | ✅   | -   | ✅   |


---

## 12. Glossário


| Termo         | Definição                                                     |
| ------------- | ------------------------------------------------------------- |
| **Admin**     | Usuário responsável pela gestão da família, único por família |
| **Família**   | Grupo de irmãos cuidando dos mesmos pais                      |
| **Feed**      | Lista cronológica de atividades da família                    |
| **Goal/Meta** | Objetivo financeiro coletivo da família                       |
| **Member**    | Usuário participante da família (não admin)                   |
| **Parent**    | Pai ou mãe sendo cuidado pela família                         |
| **Streak**    | Sequência de dias consecutivos com atividade                  |


---

## 13. Histórico de Revisões


| Versão | Data       | Autor        | Alterações                     |
| ------ | ---------- | ------------ | ------------------------------ |
| 1.0    | 2026-05-01 | Product Team | Versão inicial do PRD para MVP |


---

## 14. Anexos

### A. Configuração OAuth Google

**Scopes necessários:**

- `openid`
- `email`
- `profile`

**Claims utilizadas:**

- `sub` (ID único do Google)
- `email`
- `email_verified`
- `name`
- `picture`

### B. Estrutura JWT

```json
{
  "sub": "user_uuid",
  "email": "user@email.com",
  "role": "Admin|Member",
  "familyId": "family_uuid",
  "iat": 1714560000,
  "exp": 1714596000,
  "iss": "project-ours-api",
  "aud": "project-ours-app"
}
```

---

**Fim do Documento**