# Project Ours - Agent Context

> **Agent Reference**: Contexto consolidado para desenvolvimento orientado por IA

---

## 🎯 Para Agents de IA

Este documento é uma **fonte de verdade consolidada** para agents de IA trabalharem no Project Ours. Use este documento para:

1. **Entender o contexto** antes de implementar qualquer feature
2. **Consultar padrões** de código e arquitetura
3. **Validar requisitos** contra User Stories
4. **Acessar referências rápidas** de API e banco de dados

---

## Visão Condensada

### O que é
Project Ours é um app PWA para **cuidado colaborativo de pais entre irmãos**. Foco em colaboração genuína, **sem rankings** e **com privacidade financeira absoluta**.

### Diferencial Técnico
```
❌ NUNCA exponha: quanto cada irmão contribuiu individualmente
✅ SEMPRE exponha: progresso agregado apenas
✅ Header X-Family-Id para multi-família por usuário
```

### Stack
- **Frontend:** Next.js 16, TypeScript, Tailwind, Mantine, Zustand, TanStack Query
- **Backend:** .NET 8, EF Core, PostgreSQL
- **Auth:** Google OAuth → JWT próprio
- **Deploy:** Cloudflare Pages (front), VPS Docker (back)

---

## Regras de Ouro (Nunca Quebrar)

### 1. Privacidade Financeira
```typescript
// ❌ PROIBIDO
const goal = {
  contributions: [
    { user: "João", amount: 500 },  // EXPÕE INDIVIDUAL
    { user: "Maria", amount: 100 }
  ]
}

// ✅ OBRIGATÓRIO
const goal = {
  currentAmount: 600,        // AGREGADO APENAS
  targetAmount: 800,
  progressPercent: 75,
  contributionsCount: 12,    // CONTAGEM
  myTotalContribution: 150   // PRÓPRIO USUÁRIO APENAS
}
```

### 2. Sem Rankings
```typescript
// ❌ PROIBIDO
const ranking = [
  { name: "João", calls: 10 },  // RANKING
  { name: "Maria", calls: 2 }
]

// ✅ OBRIGATÓRIO
const feed = [
  { type: "call", user: "Ana", timestamp: "..." },  // CRONOLÓGICO
  { type: "call", user: "João", timestamp: "..." }
]
```

### 3. Multi-Família
```typescript
// Toda requisição de escopo familiar PRECISA do header
const headers = {
  'Authorization': `Bearer ${token}`,
  'X-Family-Id': activeFamilyId  // OBRIGATÓRIO
}
```

---

## Estrutura de Pastas (Obrigatória)

### Frontend
```
src/
├── app/                      # Next.js App Router (finas!)
│   ├── [locale]/
│   │   ├── (auth)/          # Login, onboarding
│   │   ├── (app)/           # Dashboard, protegidas
│   │   └── layout.tsx
├── core/
│   ├── domain/              # Tipos compartilhados
│   ├── application/         # Portas (interfaces)
│   ├── infrastructure/      # HTTP client, adapters
│   └── presentation/        # Shell, providers
├── modules/
│   ├── auth/
│   ├── family/
│   ├── activities/
│   ├── goals/
│   └── parents/
│       ├── domain/          # Types, rules
│       ├── application/     # Use cases, ports
│       ├── infrastructure/  # Repository impl
│       ├── presentation/    # Components, hooks
│       └── index.ts         # Public API
├── stores/                  # Zustand
└── i18n/                    # next-intl
```

**Regra:** Nunca coloque lógica de negócio em `app/`. As rotas devem ser **finas**.

### Backend
```
server/
├── src/
│   ├── ProjectOurs.API/           # Controllers
│   ├── ProjectOurs.Application/   # Services, DTOs
│   ├── ProjectOurs.Domain/        # Entities, enums
│   └── ProjectOurs.Infrastructure/ # EF, Repositories
└── tests/
    ├── ProjectOurs.UnitTests/
    └── ProjectOurs.Api.IntegrationTests/
```

---

## Fluxos de Implementação

### Fluxo 1: Nova Feature Backend
```
1. Entity (Domain) → Campos, validações
2. Repository Interface (Application) → Porta
3. Repository Implementation (Infrastructure) → EF
4. Service (Application) → Caso de uso
5. DTOs (Application) → Request/Response
6. Validator (Application) → FluentValidation
7. Controller (API) → Endpoint
8. Tests (Unit + Integration)
```

### Fluxo 2: Nova Feature Frontend
```
1. Types (Domain) → Interfaces
2. API Service (Infrastructure) → Axios
3. Hook (Presentation) → TanStack Query
4. Component (Presentation) → Mantine
5. Test (Unit) → Vitest + RTL
6. E2E Test → Playwright
```

---

## API Contracts (Essenciais)

### Auth
```typescript
// POST /api/auth/google
interface GoogleLoginRequest {
  idToken: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    picture: string;
    families: Array<{
      id: string;
      name: string;
      role: 'Admin' | 'Member';
    }>;
  };
  isNewUser: boolean;
  familyCount: number;
}
```

### Família
```typescript
// POST /api/families
interface CreateFamilyRequest {
  name: string;  // 3-50 chars
}

// GET /api/families/{id}
interface FamilyDetailResponse {
  id: string;
  name: string;
  admin: User;
  members: FamilyMember[];
  parents: Parent[];
  invite?: FamilyInvite;
}

// Header obrigatório: X-Family-Id: {uuid}
```

### Atividades
```typescript
// POST /api/activities/call
interface CreateCallRequest {
  parentId?: string;
  durationMinutes?: number;
  notes?: string;  // max 500
}

// GET /api/activities/feed
interface FeedResponse {
  activities: Activity[];
  hasMore: boolean;
  total: number;
}

// GET /api/activities/my-stats
interface MyStatsResponse {
  totalCallsThisMonth: number;
  totalCallsLastMonth: number;
  totalDurationThisMonth: number;
  currentStreakDays: number;
}
```

### Metas (⚠️ Privacidade)
```typescript
// GET /api/goals/{id} - CRÍTICO
interface GoalDetailResponse {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;        // ✅ Total agregado
  progressPercent: number;
  status: 'Active' | 'Completed' | 'Cancelled';
  contributionsCount: number;     // ✅ Contagem
  creatorName: string;
  myTotalContribution: number;  // ✅ Próprio apenas
  recentActivity: Array<{
    type: 'contribution';
    message: 'Alguém contribuiu';  // ✅ Anônimo
    timeAgo: string;
  }>;
  // ❌ NUNCA incluir: lista de GoalContributions com userId + amount
}

// POST /api/goals/{id}/contribute
interface ContributeRequest {
  amount: number;  // min 1, max restante
}

interface ContributeResponse {
  contributionId: string;
  newProgressPercent: number;
  isCompleted: boolean;
  message: string;
}
```

---

## Entidades (Banco de Dados)

### User
- id: UUID PK
- email: string UNIQUE
- name: string
- picture: string?
- createdAt: datetime

### FamilyMembership (N:N)
- id: UUID PK
- userId: UUID FK
- familyId: UUID FK
- role: 0=Admin, 1=Member
- joinedAt: datetime
- UNIQUE(userId, familyId)

### Family
- id: UUID PK
- name: string
- createdAt: datetime

### Parent
- id: UUID PK
- familyId: UUID FK
- name: string
- birthDate: date?
- medicalInfo: jsonb?
- emergencyBriefing: text?

### Activity
- id: UUID PK
- familyId: UUID FK
- userId: UUID FK
- parentId: UUID? FK
- type: 0=Call, 1=Visit, 2=Medical, 3=Task, 4=Medication
- metadata: jsonb?
- createdAt: datetime

**Metadata por tipo:**
```json
// Call
{ "durationMinutes": 15, "notes": "..." }
```

### Goal
- id: UUID PK
- familyId: UUID FK
- title: string
- targetAmount: decimal(10,2), CHECK > 0
- currentAmount: decimal(10,2), default 0
- status: 0=Active, 1=Completed, 2=Cancelled
- createdBy: UUID FK
- createdAt: datetime
- completedAt: datetime?

### GoalContribution
- id: UUID PK
- goalId: UUID FK
- userId: UUID FK
- amount: decimal(10,2), CHECK > 0
- createdAt: datetime

---

## Padrões de Código

### Backend (.NET)

```csharp
// Service Pattern
public interface IFamilyService
{
    Task<FamilyDto> CreateAsync(CreateFamilyRequest request, Guid userId);
    Task<FamilyDetailDto> GetByIdAsync(Guid familyId, Guid currentUserId);
}

public class FamilyService : IFamilyService
{
    private readonly IFamilyRepository _repo;
    private readonly ILogger<FamilyService> _logger;

    public FamilyService(IFamilyRepository repo, ILogger<FamilyService> logger)
    {
        _repo = repo;
        _logger = logger;
    }

    public async Task<FamilyDto> CreateAsync(CreateFamilyRequest request, Guid userId)
    {
        // 1. Validar
        if (string.IsNullOrWhiteSpace(request.Name) || request.Name.Length < 3)
            throw new ValidationException("Nome deve ter pelo menos 3 caracteres");

        // 2. Criar entidade
        var family = new Family { Name = request.Name };
        
        // 3. Persistir
        await _repo.AddAsync(family);
        
        // 4. Criar membership como Admin
        var membership = new FamilyMembership
        {
            UserId = userId,
            FamilyId = family.Id,
            Role = UserRole.Admin
        };
        await _membershipRepo.AddAsync(membership);

        // 5. Log
        _logger.LogInformation("Family {FamilyId} created by user {UserId}", 
            family.Id, userId);

        // 6. Retornar DTO
        return family.ToDto();
    }
}

// Controller (fino!)
[ApiController]
[Route("api/families")]
[Authorize]
public class FamiliesController : ControllerBase
{
    private readonly IFamilyService _service;

    [HttpPost]
    public async Task<ActionResult<FamilyDto>> Create(CreateFamilyRequest request)
    {
        var userId = User.GetUserId();
        var family = await _service.CreateAsync(request, userId);
        return Created($"/api/families/{family.Id}", family);
    }
}
```

### Frontend (React + TypeScript)

```typescript
// Hook Pattern
export function useCreateFamily() {
  const queryClient = useQueryClient();
  const { setActiveFamily } = useActiveFamilyStore();

  return useMutation({
    mutationFn: async (data: CreateFamilyRequest) => {
      const response = await api.post<FamilyDto>('/families', data);
      return response.data;
    },
    onSuccess: (data) => {
      // Atualizar cache
      queryClient.setQueryData(['families'], (old: FamilyDto[] = []) => 
        [...old, data]);
      
      // Setar família ativa
      setActiveFamily(data);
      
      // Toast
      toast.success('Família criada com sucesso!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Erro ao criar família');
    }
  });
}

// Component Pattern
interface FamilyCardProps {
  family: FamilyDto;
  onSelect?: (id: string) => void;
}

export function FamilyCard({ family, onSelect }: FamilyCardProps) {
  const t = useTranslations('Family');
  
  return (
    <Card 
      shadow="sm" 
      padding="lg" 
      radius="md"
      onClick={() => onSelect?.(family.id)}
      className="cursor-pointer hover:shadow-md transition"
    >
      <Group justify="space-between">
        <div>
          <Text fw={500}>{family.name}</Text>
          <Text size="sm" c="dimmed">
            {family.role === 'Admin' ? t('youAreAdmin') : t('youAreMember')}
          </Text>
        </div>
        <Badge color={family.role === 'Admin' ? 'blue' : 'gray'}>
          {family.role}
        </Badge>
      </Group>
    </Card>
  );
}
```

---

## Testes (Obrigatórios)

### Backend
```bash
# Unit tests - Services
[Fact]
public async Task CreateFamily_WithShortName_ThrowsValidationException()
{
    var service = new FamilyService(mockRepo.Object, mockLogger.Object);
    
    await Assert.ThrowsAsync<ValidationException>(() =>
        service.CreateAsync(new CreateFamilyRequest { Name = "AB" }, Guid.NewGuid()));
}

# Integration tests - Endpoints
[Fact]
public async Task GetFamily_WithoutMembership_Returns403()
{
    var response = await Client.GetAsync($"/api/families/{Guid.NewGuid()}");
    Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
}
```

### Frontend
```typescript
// Component test
describe('GoalCard', () => {
  it('does not show individual contribution amounts', () => {
    render(<GoalCard goal={mockGoal} />);
    
    expect(screen.queryByText(/contribuiu R\$/)).not.toBeInTheDocument();
  });
});

// E2E test
test('privacy: user cannot see other contributions', async ({ page }) => {
  // Setup: User 1 cria goal e contribui
  // Setup: User 2 contribui
  // Assert: User 1 não vê valor de User 2
  await expect(page.locator('text=User 2 contribuiu')).not.toBeVisible();
});
```

---

## Validações Comuns

### Backend (FluentValidation)
```csharp
public class CreateGoalRequestValidator : AbstractValidator<CreateGoalRequest>
{
    public CreateGoalRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Título é obrigatório")
            .Length(3, 100).WithMessage("Título deve ter 3-100 caracteres");
        
        RuleFor(x => x.TargetAmount)
            .GreaterThan(10).WithMessage("Valor mínimo é R$ 10,00");
    }
}
```

### Frontend (Zod)
```typescript
const createGoalSchema = z.object({
  title: z.string()
    .min(3, 'Título deve ter pelo menos 3 caracteres')
    .max(100, 'Título deve ter no máximo 100 caracteres'),
  targetAmount: z.number()
    .min(10, 'Valor mínimo é R$ 10,00')
    .positive('Valor deve ser positivo'),
});
```

---

## Mensagens de Erro (Padronizadas)

| Cenário | Mensagem (PT-BR) | HTTP |
|---------|------------------|------|
| Convite expirado | "Código de convite inválido ou expirado." | 400 |
| Já é membro | "Você já faz parte desta família." | 400 |
| Não é admin | (403 sem mensagem detalhada por segurança) | 403 |
| Meta inativa | "Esta meta não está ativa." | 400 |
| Valor mínimo contribuição | "Valor mínimo de contribuição é R$ 1,00." | 400 |
| Valor máximo excedido | "Valor excede o restante da meta." | 400 |

---

## Referências Rápidas

### Documentação Completa
- [Index](../00-index/README.md) — Navegação
- [PRD Summary](../02-reference/prd-summary.md) — User Stories
- [API Reference](../02-reference/api-reference.md) — Endpoints
- [Database Schema](../02-reference/database-schema.md) — Entidades
- [UI Design System](../02-reference/ui-design-system.md) — Wireframes

### Padrões
- [Client Standard](../client-standard.md) — Frontend patterns
- [Security Model](../01-explanation/03-security-model.md) — Segurança

### Guias
- [Testing Guide](../03-how-to/testing-guide.md) — Testes
- [DevOps Guide](../03-how-to/devops-deployment.md) — Deploy

---

## Checklist para Agents

Antes de implementar qualquer feature:

- [ ] Li a User Story correspondente no PRD Summary
- [ ] Entendi o fluxo de telas no UI Design System
- [ ] Verifiquei os endpoints necessários na API Reference
- [ ] Confirmei as entidades no Database Schema
- [ ] Validei regras de privacidade no Security Model
- [ ] Segui a estrutura de pastas do Client Standard
- [ ] Implementei testes (unit + integration/E2E)
- [ ] Validei que NÃO exponho dados individuais

---

## Comandos Úteis

```bash
# Backend
dotnet test
dotnet ef migrations add NomeMigration --project ../ProjectOurs.Infrastructure
dotnet ef database update

# Frontend
npm run lint
npm run type-check
npm run test:run
npm run test:e2e

# Deploy
gh pr create --base main --head develop
git tag -a v1.x.x -m "Release v1.x.x"
```

---

*Agent Context v1.0 | Project Ours | Maio 2026*
*Use este documento como entrada de contexto para qualquer implementação*
