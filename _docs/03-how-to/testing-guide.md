# Project Ours - Guia de Testes

> **How-to**: Implemente testes unitários, de integração e E2E passo a passo

---

## Estratégia de Testes

### Pirâmide de Testes

```
        ▲
       /_\     E2E (Playwright)
      /___\    Fluxos críticos: auth, família, metas
     /_____\
    /_______\  Integration (xUnit + Testcontainers)
   /_________\ API contracts, DB queries, auth flow
  /___________\
 /_____________\ Unit (xUnit / Vitest)
/_______________\ Domain logic, services, components
```

### Cobertura Esperada

| Camada | Framework | Cobertura Mínima | Onde |
|--------|-----------|------------------|------|
| Unit Backend | xUnit | 80% | Domain, Application Services |
| Integration Backend | xUnit + Testcontainers | 70% | API endpoints, Repositories |
| Unit Frontend | Vitest + RTL | 70% | Hooks, utils, stores |
| Component Frontend | Vitest + RTL | 60% | Componentes isolados |
| E2E | Playwright | Fluxos críticos | Onboarding, família, metas |

---

## Backend Testing (.NET)

### 1. Testes Unitários (xUnit)

#### Estrutura de Pastas
```
server/tests/ProjectOurs.UnitTests/
├── Domain/
│   ├── Entities/
│   │   ├── UserTests.cs
│   │   ├── GoalTests.cs
│   │   └── FamilyTests.cs
│   └── Enums/
├── Application/
│   ├── Services/
│   │   ├── AuthServiceTests.cs
│   │   ├── FamilyServiceTests.cs
│   │   └── GoalServiceTests.cs
│   └── Validators/
│       └── CreateGoalRequestValidatorTests.cs
└── ProjectOurs.UnitTests.csproj
```

#### Exemplo: Teste de Service
```csharp
public class GoalServiceTests
{
    private readonly Mock<IGoalRepository> _goalRepositoryMock;
    private readonly Mock<IFamilyMembershipRepository> _membershipRepoMock;
    private readonly GoalService _service;

    public GoalServiceTests()
    {
        _goalRepositoryMock = new Mock<IGoalRepository>();
        _membershipRepoMock = new Mock<IFamilyMembershipRepository>();
        _service = new GoalService(
            _goalRepositoryMock.Object,
            _membershipRepoMock.Object
        );
    }

    [Fact]
    public async Task CreateGoal_WithValidData_ReturnsGoal()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var familyId = Guid.NewGuid();
        var request = new CreateGoalRequest
        {
            Title = "Remédio de Junho",
            TargetAmount = 500
        };

        _membershipRepoMock
            .Setup(x => x.IsUserFamilyMemberAsync(userId, familyId))
            .ReturnsAsync(true);

        // Act
        var result = await _service.CreateGoalAsync(request, userId, familyId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(request.Title, result.Title);
        Assert.Equal(request.TargetAmount, result.TargetAmount);
        Assert.Equal(GoalStatus.Active, result.Status);
        
        _goalRepositoryMock.Verify(
            x => x.AddAsync(It.Is<Goal>(g => 
                g.Title == request.Title && 
                g.TargetAmount == request.TargetAmount)),
            Times.Once
        );
    }

    [Fact]
    public async Task CreateGoal_WithAmountLessThan10_ThrowsValidationException()
    {
        // Arrange
        var request = new CreateGoalRequest
        {
            Title = "Meta",
            TargetAmount = 5 // Menor que mínimo
        };

        // Act & Assert
        await Assert.ThrowsAsync<ValidationException>(() =>
            _service.CreateGoalAsync(request, Guid.NewGuid(), Guid.NewGuid())
        );
    }

    [Fact]
    public async Task ContributeToGoal_WhenGoalCompleted_ThrowsException()
    {
        // Arrange
        var goalId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var goal = new Goal 
        { 
            Id = goalId, 
            Status = GoalStatus.Completed 
        };

        _goalRepositoryMock
            .Setup(x => x.GetByIdAsync(goalId))
            .ReturnsAsync(goal);

        // Act & Assert
        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _service.ContributeAsync(goalId, userId, 100)
        );
        
        Assert.Contains("não está ativa", ex.Message);
    }
}
```

#### Exemplo: Teste de Validator
```csharp
public class CreateGoalRequestValidatorTests
{
    private readonly CreateGoalRequestValidator _validator = new();

    [Theory]
    [InlineData("", "Título é obrigatório")]
    [InlineData("AB", "Título deve ter pelo menos 3 caracteres")]
    [InlineData("A muito longo...", "Título deve ter no máximo 100 caracteres")] // 101 chars
    public void Title_InvalidValues_ReturnsError(string title, string expectedError)
    {
        // Arrange
        var request = new CreateGoalRequest 
        { 
            Title = title,
            TargetAmount = 100 
        };

        // Act
        var result = _validator.Validate(request);

        // Assert
        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.ErrorMessage.Contains(expectedError));
    }

    [Fact]
    public void TargetAmount_LessThan10_ReturnsError()
    {
        // Arrange
        var request = new CreateGoalRequest 
        { 
            Title = "Meta válida",
            TargetAmount = 5 
        };

        // Act
        var result = _validator.Validate(request);

        // Assert
        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => 
            e.PropertyName == "TargetAmount" && 
            e.ErrorMessage.Contains("R$ 10"));
    }
}
```

---

### 2. Testes de Integração (xUnit + Testcontainers)

#### Configuração
```csharp
// IntegrationTestBase.cs
public abstract class IntegrationTestBase : IAsyncLifetime
{
    protected HttpClient Client { get; private set; }
    protected PostgreSqlContainer Postgres { get; private set; }
    protected WebApplicationFactory<Program> Factory { get; private set; }

    public async Task InitializeAsync()
    {
        Postgres = new PostgreSqlBuilder()
            .WithDatabase("project_ours_test")
            .WithUsername("test")
            .WithPassword("test")
            .Build();

        await Postgres.StartAsync();

        Factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    // Replace real DB with testcontainer
                    services.RemoveAll<DbContextOptions<ApplicationDbContext>>();
                    services.AddDbContext<ApplicationDbContext>(options =>
                        options.UseNpgsql(Postgres.GetConnectionString()));
                });
            });

        Client = Factory.CreateClient();

        // Ensure database is created
        using var scope = Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await context.Database.MigrateAsync();
    }

    public async Task DisposeAsync()
    {
        Client?.Dispose();
        Factory?.Dispose();
        await Postgres.DisposeAsync();
    }
}
```

#### Exemplo: Teste de Endpoint
```csharp
public class AuthControllerTests : IntegrationTestBase
{
    [Fact]
    public async Task GoogleLogin_WithValidToken_ReturnsAuthResponse()
    {
        // Arrange - Mock Google validation
        // (Usar biblioteca de mock de OAuth ou stub)
        
        // Act
        var response = await Client.PostAsJsonAsync("/api/auth/google", new
        {
            idToken = "valid_mock_token"
        });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var authResponse = await response.Content.ReadFromJsonAsync<AuthResponse>();
        authResponse.Should().NotBeNull();
        authResponse.Token.Should().NotBeNullOrEmpty();
        authResponse.User.Should().NotBeNull();
    }

    [Fact]
    public async Task CreateFamily_WithoutAuth_Returns401()
    {
        // Act
        var response = await Client.PostAsJsonAsync("/api/families", new
        {
            name = "Família Teste"
        });

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetFamily_WithValidFamilyId_ReturnsFamilyDetails()
    {
        // Arrange
        var (token, familyId) = await SeedUserWithFamilyAsync();
        Client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await Client.GetAsync($"/api/families/{familyId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var family = await response.Content.ReadFromJsonAsync<FamilyDto>();
        family.Should().NotBeNull();
        family.Name.Should().Be("Família Teste");
    }

    [Fact]
    public async Task ContributeToGoal_UpdatesProgressCorrectly()
    {
        // Arrange
        var (token, familyId) = await SeedUserWithFamilyAsync();
        var goalId = await SeedGoalAsync(familyId, targetAmount: 500);
        
        Client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await Client.PostAsJsonAsync(
            $"/api/goals/{goalId}/contribute", 
            new { amount = 100 }
        );

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var result = await response.Content.ReadFromJsonAsync<ContributeResponse>();
        result.NewProgressPercent.Should().Be(20);
        result.IsCompleted.Should().BeFalse();
    }
}
```

---

## Frontend Testing (Next.js)

### 1. Testes Unitários (Vitest + RTL)

#### Configuração
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

#### Exemplo: Teste de Hook
```typescript
// useFamilyPermissions.test.ts
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFamilyPermissions } from './useFamilyPermissions';
import * as authStore from '@/stores/authStore';
import * as familyStore from '@/stores/activeFamilyStore';

vi.mock('@/stores/authStore');
vi.mock('@/stores/activeFamilyStore');

describe('useFamilyPermissions', () => {
  it('returns isAdmin true when user is admin of active family', () => {
    // Arrange
    vi.mocked(authStore.useAuthStore).mockReturnValue({
      user: { id: 'user-1' }
    } as any);
    
    vi.mocked(familyStore.useActiveFamilyStore).mockReturnValue({
      activeFamily: {
        id: 'family-1',
        members: [
          { userId: 'user-1', role: 'Admin' }
        ]
      }
    } as any);

    // Act
    const { result } = renderHook(() => useFamilyPermissions());

    // Assert
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.canInvite).toBe(true);
    expect(result.current.canEditParents).toBe(true);
  });

  it('returns isAdmin false when user is member', () => {
    // Arrange
    vi.mocked(authStore.useAuthStore).mockReturnValue({
      user: { id: 'user-2' }
    } as any);
    
    vi.mocked(familyStore.useActiveFamilyStore).mockReturnValue({
      activeFamily: {
        id: 'family-1',
        members: [
          { userId: 'user-1', role: 'Admin' },
          { userId: 'user-2', role: 'Member' }
        ]
      }
    } as any);

    // Act
    const { result } = renderHook(() => useFamilyPermissions());

    // Assert
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.canInvite).toBe(false);
  });
});
```

#### Exemplo: Teste de Componente
```typescript
// GoalCard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GoalCard } from './GoalCard';

const mockGoal = {
  id: 'goal-1',
  title: 'Remédio de Junho',
  targetAmount: 500,
  currentAmount: 350,
  progressPercent: 70,
  status: 'Active',
  contributionsCount: 12
};

describe('GoalCard', () => {
  it('renders goal information correctly', () => {
    // Act
    render(<GoalCard goal={mockGoal} />);

    // Assert
    expect(screen.getByText('Remédio de Junho')).toBeInTheDocument();
    expect(screen.getByText('R$ 350 de R$ 500')).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument();
    expect(screen.getByText('12 contribuições')).toBeInTheDocument();
  });

  it('does not show individual contribution amounts', () => {
    // Act
    render(<GoalCard goal={mockGoal} />);

    // Assert - garantir privacidade
    expect(screen.queryByText(/R\$ \d+ por/)).not.toBeInTheDocument();
    expect(screen.queryByText('João contribuiu')).not.toBeInTheDocument();
  });

  it('shows progress bar with correct width', () => {
    // Act
    render(<GoalCard goal={mockGoal} />);
    
    // Assert
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '70');
  });

  it('calls onContribute when contribute button is clicked', () => {
    // Arrange
    const onContribute = vi.fn();
    render(<GoalCard goal={mockGoal} onContribute={onContribute} />);

    // Act
    fireEvent.click(screen.getByText('Contribuir'));

    // Assert
    expect(onContribute).toHaveBeenCalledWith('goal-1');
  });
});
```

---

### 2. Testes E2E (Playwright)

#### Configuração
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

#### Exemplo: Fluxo de Onboarding
```typescript
// onboarding.spec.ts
import { test, expect } from '@playwright/test';
import { mockGoogleAuth } from './utils/auth-mock';

test.describe('Onboarding Flow', () => {
  test('new user creates family', async ({ page }) => {
    // Arrange
    await mockGoogleAuth(page, {
      email: 'joao@test.com',
      name: 'João Silva',
      sub: 'google-user-1',
      isNewUser: true
    });

    // Act - Login
    await page.goto('/');
    await page.click('text=Entrar com Google');
    
    // Assert - Redirected to onboarding
    await expect(page).toHaveURL('/onboarding');
    await expect(page.locator('text=Bem-vindo')).toBeVisible();

    // Act - Create family
    await page.fill('[placeholder="Nome da Família"]', 'Família Silva');
    await page.click('text=Criar Família');

    // Assert - Redirected to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Olá, João!')).toBeVisible();
    await expect(page.locator('text=Família Silva')).toBeVisible();
  });
});
```

#### Exemplo: Fluxo de Convite
```typescript
// family-invite.spec.ts
import { test, expect } from '@playwright/test';
import { mockGoogleAuth, createFamily } from './utils/test-helpers';

test.describe('Family Invite Flow', () => {
  test('admin invites sibling and approves join request', async ({ browser }) => {
    // Arrange - Admin context
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    
    await mockGoogleAuth(adminPage, {
      email: 'admin@test.com',
      name: 'Admin User',
      sub: 'admin-1'
    });
    
    await adminPage.goto('/');
    await adminPage.click('text=Entrar com Google');
    await createFamily(adminPage, 'Família Teste');

    // Act - Generate invite
    await adminPage.click('text=Família');
    await adminPage.click('text=Convidar irmão');
    
    // Get invite code
    const inviteCode = await adminPage.locator('[data-testid="invite-code"]').textContent();
    const inviteLink = await adminPage.locator('[data-testid="invite-url"]').textContent();

    // Arrange - Sibling context
    const siblingContext = await browser.newContext();
    const siblingPage = await siblingContext.newPage();
    
    await mockGoogleAuth(siblingPage, {
      email: 'sibling@test.com',
      name: 'Irmão Silva',
      sub: 'sibling-1'
    });

    // Act - Sibling uses invite
    await siblingPage.goto(inviteLink!);
    await siblingPage.click('text=Solicitar entrada');

    // Assert - Waiting approval
    await expect(siblingPage.locator('text=Aguardando aprovação')).toBeVisible();

    // Act - Admin approves
    await adminPage.click('text=Pendentes');
    await adminPage.click('[data-testid="approve-sibling-1"]');

    // Assert - Sibling is now member
    await siblingPage.reload();
    await expect(siblingPage).toHaveURL('/dashboard');
    await expect(siblingPage.locator('text=Família Teste')).toBeVisible();

    await adminContext.close();
    await siblingContext.close();
  });
});
```

#### Exemplo: Privacidade Financeira
```typescript
// privacy.spec.ts
import { test, expect } from '@playwright/test';
import { mockGoogleAuth, createFamilyWithGoal, contributeToGoal } from './utils/test-helpers';

test.describe('Financial Privacy', () => {
  test('user cannot see other contributions', async ({ browser }) => {
    // Arrange - User 1 creates goal and contributes
    const user1Context = await browser.newContext();
    const user1Page = await user1Context.newPage();
    
    await mockGoogleAuth(user1Page, { email: 'user1@test.com', name: 'User 1', sub: 'user-1' });
    await user1Page.goto('/');
    await user1Page.click('text=Entrar com Google');
    await createFamilyWithGoal(user1Page, 'Meta Privada', 1000);
    await contributeToGoal(user1Page, 500);

    // Arrange - User 2 joins and contributes
    const user2Context = await browser.newContext();
    const user2Page = await user2Context.newPage();
    
    await mockGoogleAuth(user2Page, { email: 'user2@test.com', name: 'User 2', sub: 'user-2' });
    // ... join family and contribute 200

    // Act - User 1 views goal
    await user1Page.click('text=Metas');
    await user1Page.click('text=Meta Privada');

    // Assert - Sees aggregated data only
    await expect(user1Page.locator('text=R$ 700 de R$ 1000')).toBeVisible(); // Total
    await expect(user1Page.locator('text=2 contribuições')).toBeVisible(); // Count
    
    // Assert - Does NOT see individual contributions
    await expect(user1Page.locator('text=User 2 contribuiu R$ 200')).not.toBeVisible();
    await expect(user1Page.locator('text=R$ 200 por User 2')).not.toBeVisible();

    // Assert - Sees own contribution
    await expect(user1Page.locator('text=Você contribuiu R$ 500')).toBeVisible();

    await user1Context.close();
    await user2Context.close();
  });
});
```

---

## Checklist de Testes por Feature

### US-001: Autenticação (Cookie HttpOnly)

#### Backend (xUnit)
- [x] `GET /auth/antiforgery` retorna requestToken
- [x] `POST /auth/google` com antiforgery retorna AuthResponse + cookie `po_auth`
- [x] `POST /auth/google` sem antiforgery retorna 400
- [x] Token Google inválido retorna 401
- [x] Email não verificado retorna 403
- [x] `GET /auth/session` com cookie válido retorna 204
- [x] `GET /auth/session` sem cookie retorna 401
- [x] `POST /auth/logout` limpa cookie

#### Frontend (Vitest)
- [x] `resolvePostLoginRoute` — newUser+0 families → /onboarding
- [x] `resolvePostLoginRoute` — existing+1 family → /dashboard
- [x] `resolvePostLoginRoute` — existing+2 families → /families/select
- [x] `authGateway` — parseia AuthResponse corretamente
- [x] `authGateway` — lança erro em status não-OK

#### Manual (Bruno)
- [ ] Coleção: antiforgery → login → session → active-family → logout
- [ ] Browser: novo usuário vai para /onboarding
- [ ] Browser: usuário com 1 família vai para /dashboard
- [ ] Browser: logout bloqueia acesso a /dashboard

### US-002/003: Convites
- [ ] Apenas admin pode gerar convite
- [ ] Código tem 6 caracteres alfanuméricos
- [ ] Convite expira em 24h
- [ ] Novo convite invalida anterior
- [ ] Link com código mostra nome da família
- [ ] Solicitação cria pending approval
- [ ] Admin aprova/rejeita

### US-004: Ligações
- [ ] Botão "Liguei Agora" inicia timer
- [ ] Registro salva com duração opcional
- [ ] Atividade aparece no feed
- [ ] Feed ordenado cronologicamente

### US-006/007: Metas
- [ ] Valor mínimo de meta: R$ 10
- [ ] Valor mínimo de contribuição: R$ 1
- [ ] Progresso calculado corretamente
- [ ] Meta atingida muda status
- [ ] **PRIVACIDADE**: NINGUÉM vê contribuições individuais
- [ ] Usuário vê próprio total

---

## Testes Manuais com Bruno

Para smoke tests e exploração de API, use a [coleção Bruno](../server/collections/bruno/):

```bash
cd server/collections/bruno
bruno .
```

Fluxo recomendado: `01-antiforgery` → `02-google-login` → `03-session` → `04-me-active-family` → `05-logout`

Ver [guia completo](./bruno-api-testing.md).

---

## Comandos de Execução

### Backend
```bash
# Executar todos os testes
dotnet test

# Executar com cobertura
dotnet test --collect:"XPlat Code Coverage"

# Executar apenas unitários
dotnet test --filter "FullyQualifiedName~UnitTests"

# Executar apenas integração (se Docker disponível)
dotnet test --filter "FullyQualifiedName~IntegrationTests"
```

### Frontend
```bash
# Executar testes unitários
npm run test

# Executar com UI (playground)
npm run test:ui

# Executar com cobertura
npm run test:coverage

# Executar E2E (quando implementados)
npm run test:e2e

# Executar E2E com UI
npm run test:e2e:ui
```

---

## Próximos Passos

1. **[DevOps Guide](devops-deployment.md)** — CI/CD com testes automatizados
2. **[API Reference](../02-reference/api-reference.md)** — Contratos para testar
3. **[Agent Context](../04-agent/agent-context.md)** — Contexto de qualidade para IA

---

*Versão Testing: 1.0 | Cobertura Mínima: 70% | Última atualização: Maio 2026*
