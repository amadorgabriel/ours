# Project Ours - Modelo de Segurança e Privacidade

> **Explanation**: Entenda como protegemos dados e garantimos privacidade colaborativa

---

## Princípios Fundamentais

### 1. Privacidade Financeira Absoluta
> **Regra de Ouro**: NINGUÉM vê quanto cada irmão contribuiu individualmente.

```
❌ Anti-padrão (NUNCA fazer):
   GET /api/goals/{id}
   {
     "contributions": [
       { "user": "João", "amount": 500 },
       { "user": "Maria", "amount": 100 }  ← EXPÕE DADOS PRIVADOS
     ]
   }

✅ Padrão Correto:
   GET /api/goals/{id}
   {
     "currentAmount": 600,           ← Total agregado
     "targetAmount": 800,
     "progressPercent": 75,
     "contributionsCount": 12,       ← Contagem anônima
     "myTotalContribution": 150      ← Apenas próprio usuário
   }
```

### 2. Sem Rankings ou Comparações
> **Regra**: O feed mostra atividades cronologicamente, NUNCA rankings.

```
❌ Anti-padrão:
   "🏆 Ranking do Mês:
    1. João - 10 ligações
    2. Maria - 2 ligações"           ← Fomenta competição

✅ Padrão Correto:
   "Ana ligou para o Pai • 15min • hoje, 14:30
    Você ligou para a Mãe • 20min • ontem
    Pedro criou a meta 'Remédio de Junho' • há 2 dias"
```

### 3. Admin Único com Delegação Controlada
- Exatamente um admin por família
- Admin gerencia convites, aprovações, dados dos pais
- Membros participam mas não administram

---

## Modelo de Permissões

### Matriz de Acesso

| Ação | Admin | Membro | Notas |
|------|-------|--------|-------|
| **Família** ||||
| Criar família | ✅ | ✅ | Quem cria vira admin |
| Editar nome da família | ✅ | ❌ | ||
| Gerar convites | ✅ | ❌ | Código 24h ||
| Aprovar/rejeitar membros | ✅ | ❌ | ||
| **Pais** ||||
| Ver dados dos pais | ✅ | ✅ | ||
| Editar dados dos pais | ✅ | ❌ | Informações médicas ||
| **Atividades** ||||
| Registrar ligação | ✅ | ✅ | ||
| Ver feed | ✅ | ✅ | Apenas família ativa |
| **Metas** ||||
| Criar meta | ✅ | ✅ | ||
| Contribuir | ✅ | ✅ | ||
| Ver progresso | ✅ | ✅ | Agregado apenas |
| Ver próprias contribuições | ✅ | ✅ | Só vê o próprio |
| Cancelar meta | ✅ | ✅ | Apenas se criador |
| **Estatísticas** ||||
| Ver estatísticas pessoais | ✅ | ✅ | Apenas próprias |

### Implementação de Permissões

#### Backend (.NET)
```csharp
[Authorize]
[HttpPost("families/invite")]
public async Task<IActionResult> GenerateInvite(
    [FromHeader(Name = "X-Family-Id")] Guid familyId)
{
    // 1. Extrai userId do JWT
    var userId = User.GetUserId();
    
    // 2. Valida membership E role
    var membership = await _familyService.GetMembershipAsync(userId, familyId);
    
    if (membership == null || membership.Role != UserRole.Admin)
        return Forbid(); // 403
    
    // 3. Executa ação
    var invite = await _familyService.GenerateInviteAsync(familyId);
    return Ok(invite);
}
```

#### Frontend (React)
```typescript
// Hook para verificar permissões
function useFamilyPermissions() {
  const { activeFamily } = useActiveFamilyStore();
  const { user } = useAuthStore();
  
  const membership = activeFamily?.members.find(m => m.userId === user.id);
  
  return {
    isAdmin: membership?.role === 'Admin',
    isMember: membership?.role === 'Member',
    canManageFamily: membership?.role === 'Admin',
    canInvite: membership?.role === 'Admin',
    canEditParents: membership?.role === 'Admin',
  };
}

// Uso em componente
function FamilyPage() {
  const { isAdmin } = useFamilyPermissions();
  
  return (
    <div>
      {isAdmin && <InviteButton />}  {/* Só admin vê */}
      <MembersList />                 {/* Todos veem */}
    </div>
  );
}
```

---

## Privacidade de Dados

### Classificação de Dados

| Nível | Dados | Acesso | Exemplo |
|-------|-------|--------|---------|
| **Público** | Nome da família, título da meta | Membros da família | "Família Silva" |
| **Privado** | Contribuições individuais | Apenas próprio usuário | "Você contribuiu R$ 150" |
| **Sensível** | Informações médicas dos pais | Membros da família | "Alergia a penicilina" |
| **Restrito** | Email de convidados | Admin apenas | "convidado@email.com" |

### Implementação da Privacidade Financeira

#### Backend: Repository Pattern
```csharp
public class GoalRepository : IGoalRepository
{
    public async Task<GoalDetailDto> GetGoalDetailAsync(Guid goalId, Guid currentUserId)
    {
        var goal = await _context.Goals
            .Include(g => g.Contributions)
            .FirstOrDefaultAsync(g => g.Id == goalId);
        
        // Agrega dados (NUNCA expõe individual)
        return new GoalDetailDto
        {
            Id = goal.Id,
            Title = goal.Title,
            TargetAmount = goal.TargetAmount,
            CurrentAmount = goal.CurrentAmount,           // ✅ Agregado
            ProgressPercent = CalculateProgress(goal),
            ContributionsCount = goal.Contributions.Count, // ✅ Contagem apenas
            
            // Apenas contribuições do usuário logado
            MyContributions = goal.Contributions           // ✅ Filtrado
                .Where(c => c.UserId == currentUserId)
                .Select(c => new ContributionDto 
                { 
                    Amount = c.Amount, 
                    CreatedAt = c.CreatedAt 
                })
                .ToList(),
            
            // Atividade anônima
            RecentActivity = goal.Contributions
                .OrderByDescending(c => c.CreatedAt)
                .Take(10)
                .Select(c => new ActivityDto
                {
                    Message = "Alguém contribuiu",        // ✅ Anônimo
                    TimeAgo = FormatTimeAgo(c.CreatedAt)
                })
                .ToList()
        };
    }
}
```

#### Banco de Dados: Row-Level Security (Futuro)
```sql
-- Política opcional para PostgreSQL RLS
CREATE POLICY "Users only see own contributions detail" 
ON goal_contributions 
FOR SELECT 
USING (
  user_id = current_setting('app.current_user_id')::UUID 
  OR 
  EXISTS (
    SELECT 1 FROM family_memberships 
    WHERE user_id = current_setting('app.current_user_id')::UUID
    AND family_id = goal_contributions.family_id
    AND role = 'Admin'
  )
);
```

---

## Segurança Técnica

### Autenticação

#### Fluxo JWT + Cookie HttpOnly

```
1. Google OAuth → Validação Google → Gera JWT próprio
2. JWT emitido pelo servidor, armazenado em cookie HttpOnly `po_auth`
3. NÃO expõe JWT no localStorage/sessionStorage
4. Antiforgery token em mutações (POST/PUT/DELETE) para CSRF protection
5. Expiração: 24 horas (cookie)
6. Refresh: Não implementado no MVP (re-login após expirar)
```

#### Configuração JWT (Backend)
```csharp
// appsettings.json
{
  "JwtSettings": {
    "Secret": "super-secret-key-32-chars-min!!",
    "Issuer": "project-ours-api",
    "Audience": "project-ours-app",
    "ExpirationHours": 24
  }
}
```

#### Cookie HttpOnly (Segurança)

| Atributo | Valor | Proteção |
|----------|-------|----------|
| `HttpOnly` | `true` | JavaScript não acessa o token |
| `Secure` | `true` (prod) | Só HTTPS |
| `SameSite` | `Strict` | CSRF via links externos |
| `Max-Age` | 24 horas | Expiração automática |

#### Antiforgery Token

Toda mutação (POST/PUT/DELETE) requer antiforgery token no header:

```
POST /api/auth/google
RequestVerificationToken: <token_obtido_em_GET_/api/auth/antiforgery>
```

```
POST /api/auth/logout
RequestVerificationToken: <token_renovado>
```

**Por que antiforgery + cookie?**
- Cookie HttpOnly previne XSS no token JWT
- Antiforgery previne CSRF (ataques cross-site forjados)

### Autorização

#### Multi-Família: Header X-Family-Id
```csharp
public class FamilyAuthorizationFilter : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(
        ActionExecutingContext context, 
        ActionExecutionDelegate next)
    {
        var userId = context.HttpContext.User.GetUserId();
        var familyId = context.HttpContext.Request.Headers["X-Family-Id"].ToString();
        
        if (string.IsNullOrEmpty(familyId))
        {
            context.Result = new BadRequestObjectResult(
                new { error = "X-Family-Id header required" });
            return;
        }
        
        // Valida se usuário é membro desta família
        var isMember = await _familyService.IsUserFamilyMemberAsync(
            userId, Guid.Parse(familyId));
        
        if (!isMember)
        {
            context.Result = new ForbidResult();
            return;
        }
        
        await next();
    }
}
```

### Validação de Input

#### Backend (FluentValidation)
```csharp
public class CreateGoalRequestValidator : AbstractValidator<CreateGoalRequest>
{
    public CreateGoalRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty()
            .Length(3, 100)
            .WithMessage("Título deve ter entre 3 e 100 caracteres");
        
        RuleFor(x => x.TargetAmount)
            .GreaterThan(10)
            .WithMessage("Valor mínimo da meta é R$ 10,00");
    }
}
```

#### Frontend (Zod)
```typescript
const createGoalSchema = z.object({
  title: z.string()
    .min(3, "Título deve ter pelo menos 3 caracteres")
    .max(100, "Título deve ter no máximo 100 caracteres"),
  targetAmount: z.number()
    .min(10, "Valor mínimo é R$ 10,00")
    .positive("Valor deve ser positivo"),
});
```

---

## Proteção Contra Ameaças Comuns

| Ameaça | Mitigação | Implementação |
|--------|-----------|---------------|
| **SQL Injection** | EF Core ORM | Parameterized queries |
| **XSS** | React escaping, CSP | `Content-Security-Policy` headers |
| **CSRF** | Antiforgery token + SameSite cookie | `RequestVerificationToken` header em mutações |
| **IDOR** | Validação de ownership | Verificar userId em toda requisição |
| **Data Leak** | Anonimização | Repository pattern com filtro |
| **Brute Force** | Rate limiting | Nginx limit_req ou middleware |
| **Information Disclosure** | Headers de segurança | `X-Content-Type-Options`, `X-Frame-Options` |
| **Session Hijacking** | HttpOnly cookie + HTTPS | Cookie não acessível via JS |

---

## Checklist de Segurança para Features

### Nova endpoint API?
- [ ] Autenticação via `[Authorize]`
- [ ] Validação de `X-Family-Id` quando aplicável
- [ ] Verificação de ownership/membership
- [ ] Validação de input (FluentValidation)
- [ ] Rate limiting se sensível
- [ ] Nunca expor dados de outros usuários sem filtro

### Nova tela/fluxo?
- [ ] Verificar permissões antes de mostrar ações
- [ ] UI adaptativa (esconder botões sem permissão)
- [ ] Mensagens de erro genéricas (não expor detalhes)
- [ ] Loading states para prevenir double-submit

### Dados sensíveis?
- [ ] Classificar nível de sensibilidade
- [ ] Implementar filtro de acesso
- [ ] Auditar queries que acessam estes dados
- [ ] Testar: usuário A não vê dados de usuário B

---

## Incident Response (Plano)

### Se houver vazamento de contribuições individuais:
1. **Detectar**: Monitoramento de queries ou relatório de usuário
2. **Conter**: Desabilitar endpoint imediatamente
3. **Investigar**: Auditar logs de acesso
4. **Comunicar**: Notificar usuários afetados (transparência)
5. **Corrigir**: Patch e testes adicionais
6. **Prevenir**: Adicionar testes automatizados para prevenir regressão

---

## Próximos Passos

1. **[Login Flow](../03-how-to/login-flow.md)** — Diagrama completo de autenticação
2. **[API Reference](../02-reference/api-reference.md)** — Ver segurança em endpoints
3. **[Testing Guide](../03-how-to/testing-guide.md)** — Testes de segurança
4. **[Database Schema](../02-reference/database-schema.md)** — Modelo de dados seguro

---

*Última atualização: Maio 2026 | Security Model v1.1*
