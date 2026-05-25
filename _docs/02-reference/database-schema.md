# Project Ours - Database Schema

> **Reference**: ERD completo, entidades, relacionamentos e constraints

---

## Diagrama de Entidades (ERD)

```
┌─────────────────┐         ┌──────────────────────────┐         ┌─────────────────┐
│      User       │    N    │    FamilyMembership      │    N    │     Family      │
├─────────────────┤ ◄──────►├──────────────────────────┤ ◄──────►├─────────────────┤
│ PK id (uuid)    │         │ PK id (uuid)             │         │ PK id (uuid)    │
│ email (string)  │         │ FK userId (uuid)         │         │ name (string)   │
│ name (string)   │         │ FK familyId (uuid)       │         │ createdAt (dt)  │
│ picture (string)│         │ role (enum)              │         │                 │
│ createdAt (dt)  │         │ joinedAt (dt)            │         │                 │
└─────────────────┘         └──────────────────────────┘         └─────────────────┘
                                      │                                    │
                                      │                                    │
                                      │                              ┌────┴────┐
                                      │                              │         │
                                      │                              ▼         ▼
                                      │                    ┌──────────┐  ┌──────────┐
                                      │                    │  Parent  │  │FamilyInvite
                                      │                    │  Activity│  │   Goal   │
                                      │                    │GoalContrib│  └──────────┘
                                      │                    └──────────┘
                                      │
                                      ▼
                         ┌────────────────────────┐
                         │    GoalContribution    │
                         │    Activity           │
                         │    (familyId FK)      │
                         └────────────────────────┘
```

---

## Entidades

### User

Tabela de usuários autenticados via Google OAuth.


| Campo     | Tipo         | Restrições                    | Descrição             |
| --------- | ------------ | ----------------------------- | --------------------- |
| **id**    | UUID         | PK, default gen_random_uuid() | Identificador único   |
| email     | VARCHAR(255) | UNIQUE, NOT NULL              | Email do Google       |
| name      | VARCHAR(100) | NOT NULL                      | Nome do usuário       |
| picture   | VARCHAR(500) | NULL                          | URL da foto do Google |
| createdAt | TIMESTAMP    | NOT NULL, default now()       | Data de criação       |


**Índices:**

```sql
CREATE INDEX idx_users_email ON users(email);
```

**Nota:** Papel (Admin/Member) e vínculo com família ficam em `FamilyMembership`.

---

### FamilyMembership

Tabela de junção N:N entre User e Family. Implementa multi-família por usuário.


| Campo    | Tipo      | Restrições                    | Descrição         |
| -------- | --------- | ----------------------------- | ----------------- |
| **id**   | UUID      | PK, default gen_random_uuid() | Identificador     |
| userId   | UUID      | FK → User(id), NOT NULL       | Usuário           |
| familyId | UUID      | FK → Family(id), NOT NULL     | Família           |
| role     | SMALLINT  | NOT NULL, default 1           | 0=Admin, 1=Member |
| joinedAt | TIMESTAMP | NOT NULL, default now()       | Data de entrada   |


**Constraints:**

```sql
-- Par único: um usuário não pode ter múltiplas memberships na mesma família
UNIQUE(userId, familyId)

-- Um usuário pode ser admin de várias famílias, mas apenas uma membership por família
```

**Índices:**

```sql
CREATE INDEX idx_memberships_user ON family_memberships(userId);
CREATE INDEX idx_memberships_family ON family_memberships(familyId);
CREATE INDEX idx_memberships_role ON family_memberships(familyId, role) WHERE role = 0;
```

---

### Family

Tabela de famílias (grupos de irmãos cuidando de pais).


| Campo     | Tipo         | Restrições                    | Descrição       |
| --------- | ------------ | ----------------------------- | --------------- |
| **id**    | UUID         | PK, default gen_random_uuid() | Identificador   |
| name      | VARCHAR(100) | NOT NULL                      | Nome da família |
| createdAt | TIMESTAMP    | NOT NULL, default now()       | Data de criação |


**Relacionamentos:**

- 1:N → FamilyMembership (membros)
- 1:N → Parent (pais cuidados)
- 1:N → FamilyInvite (convites)
- 1:N → Activity (atividades)
- 1:N → Goal (metas)

---

### Parent

Representa pai/mãe sendo cuidado pela família.


| Campo             | Tipo         | Restrições                    | Descrição             |
| ----------------- | ------------ | ----------------------------- | --------------------- |
| **id**            | UUID         | PK, default gen_random_uuid() | Identificador         |
| familyId          | UUID         | FK → Family(id), NOT NULL     | Família               |
| name              | VARCHAR(100) | NOT NULL                      | Nome                  |
| birthDate         | DATE         | NULL                          | Data de nascimento    |
| medicalInfo       | JSONB        | NULL                          | Info médica flexível  |
| emergencyBriefing | TEXT         | NULL                          | Instruções emergência |
| createdAt         | TIMESTAMP    | NOT NULL, default now()       | Data de criação       |


**Índices:**

```sql
CREATE INDEX idx_parents_family ON parents(familyId);
```

**Exemplo medicalInfo:**

```json
{
  "alergies": "Penicilina",
  "bloodType": "O+",
  "medications": ["Enalapril 10mg"],
  "conditions": ["Hipertensão"]
}
```

---

### FamilyInvite

Convites para entrada em família.


| Campo        | Tipo         | Restrições                    | Descrição                                    |
| ------------ | ------------ | ----------------------------- | -------------------------------------------- |
| **id**       | UUID         | PK, default gen_random_uuid() | Identificador                                |
| familyId     | UUID         | FK → Family(id), NOT NULL     | Família                                      |
| inviteCode   | VARCHAR(6)   | NOT NULL, UNIQUE              | Código alfanumérico                          |
| invitedEmail | VARCHAR(255) | NULL                          | Email do convidado (opcional)                |
| status       | SMALLINT     | NOT NULL, default 0           | 0=Pending, 1=Accepted, 2=Rejected, 3=Expired |
| expiresAt    | TIMESTAMP    | NOT NULL                      | Expiração (24h)                              |
| createdAt    | TIMESTAMP    | NOT NULL, default now()       | Data de criação                              |


**Constraints:**

```sql
-- Apenas um convite pending/active por família
-- Implementado via aplicação: novo convite invalida anterior
```

**Índices:**

```sql
CREATE INDEX idx_invites_code ON family_invites(inviteCode);
CREATE INDEX idx_invites_family ON family_invites(familyId);
CREATE INDEX idx_invites_status ON family_invites(status) WHERE status = 0;
```

---

### Activity

Registro unificado de atividades (ligações, visitas, etc).


| Campo     | Tipo      | Restrições                    | Descrição                                        |
| --------- | --------- | ----------------------------- | ------------------------------------------------ |
| **id**    | UUID      | PK, default gen_random_uuid() | Identificador                                    |
| familyId  | UUID      | FK → Family(id), NOT NULL     | Família                                          |
| userId    | UUID      | FK → User(id), NOT NULL       | Quem fez                                         |
| parentId  | UUID      | FK → Parent(id), NULL         | Para qual pai                                    |
| type      | SMALLINT  | NOT NULL                      | 0=Call, 1=Visit, 2=Medical, 3=Task, 4=Medication |
| metadata  | JSONB     | NULL                          | Dados específicos do tipo                        |
| createdAt | TIMESTAMP | NOT NULL, default now()       | Data da atividade                                |


**Índices:**

```sql
CREATE INDEX idx_activities_family ON activities(familyId);
CREATE INDEX idx_activities_user ON activities(userId);
CREATE INDEX idx_activities_created ON activities(familyId, createdAt DESC);
CREATE INDEX idx_activities_type ON activities(type);
```

**Metadata por Tipo:**


| Type       | Metadata Schema                                |
| ---------- | ---------------------------------------------- |
| Call       | `{ durationMinutes?: number, notes?: string }` |
| Visit      | `{ durationHours?: number, notes?: string }`   |
| Medical    | `{ appointmentType?: string, notes?: string }` |
| Task       | `{ taskType?: string, completed?: boolean }`   |
| Medication | `{ medicationName?: string, dosage?: string }` |


**Exemplo:**

```json
{
  "durationMinutes": 15,
  "notes": "Conversa sobre consulta médica de amanhã"
}
```

---

### Goal

Metas financeiras coletivas da família.


| Campo         | Tipo          | Restrições                    | Descrição                          |
| ------------- | ------------- | ----------------------------- | ---------------------------------- |
| **id**        | UUID          | PK, default gen_random_uuid() | Identificador                      |
| familyId      | UUID          | FK → Family(id), NOT NULL     | Família                            |
| title         | VARCHAR(100)  | NOT NULL                      | Título da meta                     |
| targetAmount  | DECIMAL(10,2) | NOT NULL, CHECK > 0           | Valor alvo                         |
| currentAmount | DECIMAL(10,2) | NOT NULL, default 0           | Valor arrecadado                   |
| status        | SMALLINT      | NOT NULL, default 0           | 0=Active, 1=Completed, 2=Cancelled |
| createdBy     | UUID          | FK → User(id), NOT NULL       | Criador                            |
| createdAt     | TIMESTAMP     | NOT NULL, default now()       | Data criação                       |
| completedAt   | TIMESTAMP     | NULL                          | Data conclusão                     |


**Constraints:**

```sql
CHECK (targetAmount > 0)
CHECK (currentAmount >= 0)
```

**Índices:**

```sql
CREATE INDEX idx_goals_family ON goals(familyId);
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_goals_family_status ON goals(familyId, status);
```

---

### GoalContribution

Contribuições individuais para metas.


| Campo     | Tipo          | Restrições                    | Descrição     |
| --------- | ------------- | ----------------------------- | ------------- |
| **id**    | UUID          | PK, default gen_random_uuid() | Identificador |
| goalId    | UUID          | FK → Goal(id), NOT NULL       | Meta          |
| userId    | UUID          | FK → User(id), NOT NULL       | Contribuinte  |
| amount    | DECIMAL(10,2) | NOT NULL, CHECK > 0           | Valor         |
| createdAt | TIMESTAMP     | NOT NULL, default now()       | Data          |


**Constraints:**

```sql
CHECK (amount > 0)
```

**Índices:**

```sql
CREATE INDEX idx_contributions_goal ON goal_contributions(goalId);
CREATE INDEX idx_contributions_user ON goal_contributions(userId);
CREATE INDEX idx_contributions_goal_user ON goal_contributions(goalId, userId);
```

---

## Relacionamentos

```
User ||--o{ FamilyMembership : "pertence a"
Family ||--o{ FamilyMembership : "tem membros"
Family ||--o{ Parent : "cuida de"
Family ||--o{ FamilyInvite : "envia"
Family ||--o{ Activity : "registra"
Family ||--o{ Goal : "define"
User ||--o{ Activity : "realiza"
User ||--o{ Goal : "cria"
User ||--o{ GoalContribution : "contribui"
Goal ||--o{ GoalContribution : "recebe"
Parent ||--o{ Activity : "recebe"
```

---

## SQL de Criação (DDL)

```sql
-- Enum types (PostgreSQL)
CREATE TYPE user_role AS ENUM ('Admin', 'Member');
CREATE TYPE invite_status AS ENUM ('Pending', 'Accepted', 'Rejected', 'Expired');
CREATE TYPE activity_type AS ENUM ('Call', 'Visit', 'Medical', 'Task', 'Medication');
CREATE TYPE goal_status AS ENUM ('Active', 'Completed', 'Cancelled');

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    picture VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Families
CREATE TABLE families (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- FamilyMemberships
CREATE TABLE family_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'Member',
    joined_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE(user_id, family_id)
);

-- Parents
CREATE TABLE parents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    birth_date DATE,
    medical_info JSONB,
    emergency_briefing TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- FamilyInvites
CREATE TABLE family_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    invite_code VARCHAR(6) NOT NULL UNIQUE,
    invited_email VARCHAR(255),
    status invite_status NOT NULL DEFAULT 'Pending',
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Activities
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES parents(id) ON DELETE SET NULL,
    type activity_type NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Goals
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    target_amount DECIMAL(10,2) NOT NULL CHECK (target_amount > 0),
    current_amount DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
    status goal_status NOT NULL DEFAULT 'Active',
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    completed_at TIMESTAMP
);

-- GoalContributions
CREATE TABLE goal_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_memberships_user ON family_memberships(user_id);
CREATE INDEX idx_memberships_family ON family_memberships(family_id);
CREATE INDEX idx_parents_family ON parents(family_id);
CREATE INDEX idx_invites_code ON family_invites(invite_code);
CREATE INDEX idx_invites_family ON family_invites(family_id);
CREATE INDEX idx_activities_family ON activities(family_id);
CREATE INDEX idx_activities_created ON activities(family_id, created_at DESC);
CREATE INDEX idx_goals_family ON goals(family_id);
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_contributions_goal ON goal_contributions(goal_id);
CREATE INDEX idx_contributions_user ON goal_contributions(user_id);
```

---

## Views (Opcional)

### vw_family_stats

Resumo de atividades por família.

```sql
CREATE VIEW vw_family_stats AS
SELECT 
    f.id as family_id,
    f.name,
    COUNT(DISTINCT fm.user_id) as member_count,
    COUNT(DISTINCT p.id) as parent_count,
    COUNT(a.id) as total_activities,
    COUNT(a.id) FILTER (WHERE a.type = 'Call') as total_calls,
    MAX(a.created_at) as last_activity_at
FROM families f
LEFT JOIN family_memberships fm ON f.id = fm.family_id
LEFT JOIN parents p ON f.id = p.family_id
LEFT JOIN activities a ON f.id = a.family_id
GROUP BY f.id, f.name;
```

---

## Migrations EF Core

### Comando para criar migration

```bash
cd src/ProjectOurs.API
dotnet ef migrations add InitialCreate --project ../ProjectOurs.Infrastructure
```

### Aplicar migration

```bash
dotnet ef database update --project ../ProjectOurs.Infrastructure
```

---

## Próximos Passos

1. **[API Reference](api-reference.md)** — Ver como as entidades são expostas via REST
2. **[Testing Guide](../03-how-to/testing-guide.md)** — Testes com Testcontainers
3. **[Agent Context](../04-agent/agent-context.md)** — Contexto para IA trabalhar com schema

---

*Versão Schema: 1.0 | PostgreSQL 15 | Última atualização: Maio 2026*