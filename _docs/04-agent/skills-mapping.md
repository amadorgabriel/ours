# Project Ours - Skills Mapping

> **Agent Reference**: Mapeamento de habilidades por módulo para agents de IA

---

## Mapa de Capacidades

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROJECT OURS - SKILLS                        │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  CORE SKILLS (Obrigatórios para todos)                   │   │
│  │  • Diátaxis Documentation                               │   │
│  │  • Clean Architecture (Frontend + Backend)              │   │
│  │  • Test-Driven Development                              │   │
│  │  • Privacy-First Development                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   MODULE     │  │   MODULE     │  │   MODULE     │          │
│  │    AUTH      │  │   FAMILY     │  │  ACTIVITIES  │          │
│  │              │  │              │  │              │          │
│  │ • OAuth      │  │ • CRUD       │  │ • Timer      │          │
│  │ • JWT        │  │ • Invites    │  │ • Feed       │          │
│  │ • Middleware │  │ • Approvals  │  │ • Stats      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   MODULE     │  │   MODULE     │  │   MODULE     │          │
│  │    GOALS     │  │   PARENTS    │  │    CORE      │          │
│  │              │  │              │  │              │          │
│  │ • Privacy ⚠️ │  │ • Medical    │  │ • i18n       │          │
│  │ • Aggregates │  │ • Emergency  │  │ • UI System  │          │
│  │ • Progress   │  │ • Admin only │  │ • Validation │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Core Skills (Base)

### 1. Clean Architecture
**Aplicação:** Todos os módulos

**Frontend:**
```
src/modules/{feature}/
├── domain/          # Types, rules
├── application/     # Use cases, ports
├── infrastructure/  # API calls
└── presentation/    # Components, hooks
```

**Backend:**
```
ProjectOurs.Application/  # Services, DTOs, ports
ProjectOurs.Domain/       # Entities, enums
ProjectOurs.Infrastructure/ # EF, Repositories
```

**Checklist:**
- [ ] Domain não depende de framework
- [ ] Infrastructure implementa ports de Application
- [ ] Presentation orquestra use cases
- [ ] Nunca chamar infraestrutura direto de presentation

---

### 2. Privacy-First Development
**Aplicação:** Principalmente Goals, mas vigilância em todo app

**Regras:**
```typescript
// Verificação obrigatória
function validatePrivacy<T>(data: T, context: PrivacyContext): boolean {
  // 1. Nunca retornar array de contribuições com userId
  // 2. Sempre agregar: sum, count, avg
  // 3. Próprio usuário: filtrar por currentUserId
  // 4. Outros usuários: NUNCA mostrar valores individuais
  return checkNoIndividualExposure(data);
}
```

**Audit Points:**
- GoalRepository.GetByIdAsync()
- GoalController.GetGoal()
- GoalDetail page
- Activity feed (não expor duração de outros se privado)

---

### 3. Test-Driven Development
**Aplicação:** Todos os módulos

**Padrão:**
```
Red:  Escrever teste que falha
Green: Implementar código mínimo
Refactor: Otimizar
```

**Cobertura Mínima por Módulo:**
| Módulo | Unit | Integration | E2E |
|--------|------|-------------|-----|
| Auth | 90% | 80% | Sim |
| Family | 80% | 70% | Sim |
| Activities | 70% | 60% | Sim |
| Goals | 85% | 75% | Sim (privacy) |
| Parents | 70% | 60% | Não |

---

## Module Skills

### Módulo: Auth

**Responsabilidade:** Autenticação e sessão

**Skills Específicas:**
```yaml
OAuth:
  - Google Sign-In
  - Token validation
  - ID token parsing
  
JWT:
  - Generation (HS256)
  - Validation middleware
  - Claims extraction
  
Session:
  - Storage (localStorage/Zustand)
  - Refresh (se implementado)
  - Logout cleanup
```

**Endpoints:**
- `POST /api/auth/google`

**Fluxos:**
```
1. Login Google → ID Token
2. Validar no backend → Gerar JWT
3. Armazenar no client
4. Usar em todas as requisições
```

**Testes Críticos:**
- Token inválido → 401
- Email não verificado → 403
- Novo usuário → onboarding
- Usuário existente → dashboard

---

### Módulo: Family

**Responsabilidade:** Gestão de famílias e membros

**Skills Específicos:**
```yaml
CRUD:
  - Create family
  - List families of user
  - Get family details
  
Invites:
  - Generate code (6 chars, alfanum)
  - 24h expiration
  - Invalidate previous
  
Memberships:
  - Multi-family per user
  - Role: Admin/Member
  - Approval workflow
```

**Endpoints:**
- `POST /api/families`
- `GET /api/families`
- `GET /api/families/{id}`
- `POST /api/families/invite`
- `POST /api/families/join`
- `GET /api/families/pending-approvals`
- `POST /api/families/approve/{userId}`
- `POST /api/families/reject/{userId}`

**Regras de Negócio:**
- Um usuário pode estar em N famílias
- Criador é admin daquela família
- Apenas admin gera convites
- Convite expira em 24h
- Novo membro entra pending

---

### Módulo: Activities

**Responsabilidade:** Registro de ligações e feed

**Skills Específicos:**
```yaml
Timer:
  - Start/stop/reset
  - Formatação 00:00
  - Opcional (pode não usar)
  
Feed:
  - Infinite scroll
  - Cronológico (DESC)
  - Lazy loading (20 items)
  
Stats:
  - Calls this month
  - Duration sum
  - Streak calculation
```

**Endpoints:**
- `POST /api/activities/call`
- `GET /api/activities/feed`
- `GET /api/activities/my-stats`

**Cálculos:**
```typescript
// Streak
function calculateStreak(activities: Activity[]): number {
  const callDates = activities
    .filter(a => a.type === 'Call')
    .map(a => new Date(a.createdAt).toDateString())
    .sort().reverse();
  
  let streak = 0;
  let currentDate = new Date();
  
  for (const date of callDates) {
    if (date === currentDate.toDateString()) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}
```

---

### Módulo: Goals (⚠️ Privacy Critical)

**Responsabilidade:** Metas financeiras com privacidade

**Skills Específicos:**
```yaml
Privacy:
  - Aggregate data only
  - Never expose individual contributions
  - My contributions vs Others
  
Progress:
  - Percentage calculation
  - Animated bars
  - Status transitions
  
Contributions:
  - Min: R$ 1,00
  - Max: remaining amount
  - Anonymous in feed
```

**Endpoints:**
- `POST /api/goals`
- `GET /api/goals`
- `GET /api/goals/{id}` ⚠️ CRÍTICO
- `POST /api/goals/{id}/contribute`
- `GET /api/goals/my-contributions`
- `POST /api/goals/{id}/cancel`

**Regras de Privacidade:**
```csharp
// Repository - NUNCA fazer isso:
public async Task<List<GoalContribution>> GetAllContributions(Guid goalId)
{
    // ❌ EXPÕE DADOS INDIVIDUAIS
    return await _context.GoalContributions
        .Where(c => c.GoalId == goalId)
        .Include(c => c.User)
        .ToListAsync();
}

// ✅ FAÇA ISSO:
public async Task<GoalDetailDto> GetGoalDetailAsync(Guid goalId, Guid currentUserId)
{
    var goal = await _context.Goals.FindAsync(goalId);
    
    var allContributions = await _context.GoalContributions
        .Where(c => c.GoalId == goalId)
        .ToListAsync();
    
    return new GoalDetailDto
    {
        // Agregado
        CurrentAmount = allContributions.Sum(c => c.Amount),
        ContributionsCount = allContributions.Count,
        
        // Apenas próprio
        MyTotalContribution = allContributions
            .Where(c => c.UserId == currentUserId)
            .Sum(c => c.Amount),
        
        // Anônimo
        RecentActivity = allContributions
            .OrderByDescending(c => c.CreatedAt)
            .Take(10)
            .Select(c => new ActivityDto
            {
                Message = "Alguém contribuiu",  // Nunca "João contribuiu R$ 50"
                TimeAgo = FormatTimeAgo(c.CreatedAt)
            })
            .ToList()
    };
}
```

**Testes de Privacidade (Obrigatórios):**
```typescript
// E2E
test('privacy: user1 cannot see user2 contribution amount', async ({ page }) => {
  // User 1 cria meta
  // User 2 contribui R$ 100
  // User 1 vê meta
  
  await expect(page.locator('text=R$ 100')).not.toBeVisible();
  await expect(page.locator('text=User 2 contribuiu')).not.toBeVisible();
  await expect(page.locator('text=Alguém contribuiu')).toBeVisible();
});
```

---

### Módulo: Parents

**Responsabilidade:** Dados dos pais cuidados

**Skills Específicos:**
```yaml
CRUD:
  - Create (implicit ao criar família)
  - Read (todos os membros)
  - Update (admin only)
  
Medical:
  - JSONB flexible
  - Schema validation
  - Emergency briefing
```

**Endpoints:**
- `PUT /api/families/parents/{id}` (admin only)

**Permissões:**
- Todos veem: nome, idade, info médica
- Apenas admin: editar

---

## Cross-Cutting Skills

### i18n (next-intl)
**Aplicação:** Todos os módulos

```typescript
// Estrutura
src/i18n/
├── messages/
│   └── pt-BR.json
├── request.ts
└── routing.ts

// Uso
const t = useTranslations('Goals');
<Text>{t('createGoal')}</Text>
```

**Padrão de Chaves:**
```json
{
  "Goals": {
    "createGoal": "Criar Meta",
    "contribute": "Contribuir",
    "progress": "{percent}% concluído",
    "privacyNotice": "Valores individuais são mantidos em sigilo"
  }
}
```

---

### UI Components (Mantine)
**Aplicação:** Todos os módulos

**Biblioteca Base:**
```typescript
// Core components
import { Button, Card, Text, Group, Badge } from '@mantine/core';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

// Icons
import { IconPhone, IconUsers, IconTarget } from '@tabler/icons-react';
```

**Tema Customizado:**
```typescript
// theme.ts
export const theme = createTheme({
  primaryColor: 'blue',
  colors: {
    family: ['#EEF2FF', '#E0E7FF', '#C7D2FE', '#A5B4FC', '#818CF8', '#6366F1'],
    goal: ['#F5F3FF', '#EDE9FE', '#DDD6FE', '#C4B5FD', '#A78BFA', '#8B5CF6'],
    call: ['#ECFDF5', '#D1FAE5', '#A7F3D0', '#6EE7B7', '#34D399', '#10B981'],
  }
});
```

---

### State Management (Zustand)
**Aplicação:** Auth, Family ativa

```typescript
// stores/authStore.ts
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (googleToken: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  login: async (googleToken) => {
    const response = await authService.login(googleToken);
    set({ 
      user: response.user, 
      token: response.token, 
      isAuthenticated: true 
    });
  },
  logout: () => set({ user: null, token: null, isAuthenticated: false }),
}));
```

---

## Skill Assessment

### Para cada módulo, verifique:

| Skill | Nível | Evidência |
|-------|-------|-----------|
| Clean Architecture | ★★★ | Pastas corretas, imports corretos |
| Privacy | ★★★★★ | Nenhum dado individual exposto |
| Tests | ★★★ | Unit + integration passando |
| i18n | ★★★ | Todas as strings no JSON |
| UI/UX | ★★★ | Mobile-first, acessível |

### Níveis
- ★★★★★ = Expert (pode ensinar outros)
- ★★★★ = Advanced (independente)
- ★★★ = Intermediate (com review)
- ★★ = Beginner (precisa de mentoria)
- ★ = Novice (não implementar solo)

---

## Referências

### Documentos por Skill
| Skill | Documento |
|-------|-----------|
| Clean Architecture | `client-standard.md` |
| Privacy | `01-explanation/03-security-model.md` |
| Testing | `03-how-to/testing-guide.md` |
| i18n | `frontend-setup-prompt.md` |
| UI/UX | `02-reference/ui-design-system.md` |
| Module Details | `02-reference/prd-summary.md` |

---

*Skills Mapping v1.0 | Use para avaliar capacidades e gaps*
