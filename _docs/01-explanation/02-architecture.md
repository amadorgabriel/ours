# Project Ours - Arquitetura e Integrações

> **Explanation**: Entenda as decisões arquiteturais, stack técnico e integrações

---

## Visão Arquitetural

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTE                              │
│  ┌─────────────────┐                                        │
│  │   Next.js PWA   │  Mobile-first, TypeScript, Tailwind  │
│  │   (Cloudflare)  │  Auth: Google OAuth → JWT             │
│  └────────┬────────┘                                        │
│           │ HTTPS                                           │
└───────────┼─────────────────────────────────────────────────┘
            │
┌───────────┼─────────────────────────────────────────────────┐
│           ▼                                                 │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    API REST (.NET 8)                    ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     ││
│  │  │   Controllers │  │  Services   │  │ Repositories│     ││
│  │  │   (Auth API)  │  │  (Domain)   │  │   (EF Core) │     ││
│  │  └─────────────┘  └─────────────┘  └─────────────┘     ││
│  │                                                         ││
│  │  Header: X-Family-Id (multi-família)                   ││
│  │  JWT: sub, email, exp                                   ││
│  └─────────────────────────────────────────────────────────┘│
│                      (VPS Docker)                           │
└─────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│                     PERSISTÊNCIA                            │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │ PostgreSQL  │    │   Redis*    │    │  Storage*   │      │
│  │   (EF Core) │    │   (Cache)   │    │   (Files)   │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
│                                                             │
│  * Opcional para MVP                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Stack Tecnológico

### Frontend (PWA)
| Camada | Tecnologia | Propósito |
|--------|-----------|-----------|
| Framework | Next.js 16.x (App Router) | SSR/SSG, PWA, rotas |
| Linguagem | TypeScript 5.x | Type safety |
| Styling | TailwindCSS + Mantine | UI components, utilitários |
| Estado | Zustand | Estado global leve |
| HTTP | Axios + TanStack Query | Cache, loading states |
| Validação | Zod | Schema validation |
| i18n | next-intl | pt-BR default |
| Testes | Vitest + RTL + Playwright | Unit, integration, E2E |

### Backend (API REST)
| Camada | Tecnologia | Propósito |
|--------|-----------|-----------|
| Framework | .NET 8 | API robusta, performática |
| Arquitetura | Clean/Layered | Separação de concerns |
| ORM | EF Core 8 | Acesso PostgreSQL |
| Auth | JWT Bearer + Google OAuth | Tokens seguros |
| Validação | FluentValidation | Request validation |
| Testes | xUnit + Testcontainers | Unit, integration |

### Infraestrutura
| Componente | Tecnologia | Hosting |
|------------|-----------|---------|
| Frontend | Next.js PWA | Cloudflare Pages |
| Backend API | .NET 8 Docker | VPS (DigitalOcean/Linode) |
| Database | PostgreSQL 15 | Mesmo VPS (Docker) |
| Reverse Proxy | Nginx | VPS |
| SSL | Let's Encrypt | Certbot |

---

## Camadas do Backend

```
ProjectOurs.API
├── Controllers/           # Entry points HTTP
│   ├── AuthController.cs
│   ├── FamiliesController.cs
│   ├── ActivitiesController.cs
│   └── GoalsController.cs
├── Middleware/            # Auth, error handling, X-Family-Id
└── Program.cs             # DI, CORS, Swagger

ProjectOurs.Application
├── Services/              # Casos de uso (AuthService, FamilyService)
├── DTOs/                  # Request/Response contracts
├── Interfaces/            # IRepository, IService ports
└── Validators/            # FluentValidation rules

ProjectOurs.Domain
├── Entities/              # User, Family, Goal (POCOs puros)
├── Enums/                 # UserRole, InviteStatus, GoalStatus
└── Exceptions/            # Domain exceptions

ProjectOurs.Infrastructure
├── Persistence/
│   ├── ApplicationDbContext.cs
│   └── Migrations/
├── Repositories/          # Implementações EF Core
└── Auth/
    ├── GoogleAuthService.cs
    └── JwtService.cs
```

---

## Fluxo de Autenticação

```
┌──────────┐                    ┌──────────┐                    ┌──────────┐
│  Usuário │                    │ Frontend │                    │  Backend │
└────┬─────┘                    └────┬─────┘                    └────┬─────┘
     │                               │                               │
     │  1. Clica "Entrar com Google" │                               │
     │ ─────────────────────────────>│                               │
     │                               │                               │
     │  2. Popup Google OAuth        │                               │
     │ <─────────────────────────────│                               │
     │                               │                               │
     │  3. Retorna Google ID Token   │                               │
     │ ─────────────────────────────>│                               │
     │                               │                               │
     │                               │  4. POST /api/auth/google     │
     │                               │  { idToken: "..." }          │
     │                               │ ─────────────────────────────>│
     │                               │                               │
     │                               │                               │  5. Valida token
     │                               │                               │     com Google API
     │                               │                               │
     │                               │  6. Retorna JWT próprio       │
     │                               │  { token, user, families }   │
     │                               │ <─────────────────────────────│
     │                               │                               │
     │  7. Armazena JWT              │                               │
     │     localStorage              │                               │
     │ <─────────────────────────────│                               │
     │                               │                               │
```

### Decisões de Auth
- **Google ID Token** → Validado no backend via Google API
- **JWT Próprio** → Gerado pelo backend, contém `sub` (userId), `email`, `exp`
- **X-Family-Id** → Header separado para contexto de família (não no JWT)
- **Role (Admin/Member)** → Vem do banco via `FamilyMembership`, não do JWT

---

## Multi-Família (Context Switching)

### Problema
Um usuário pode pertencer a múltiplas famílias (ex.: família de origem + família do cônjuge).

### Solução
```
┌─────────────────────────────────────────┐
│  Header: X-Family-Id: {uuid}            │
│                                         │
│  Apresentado em:                        │
│  - Feed de atividades                   │
│  - Lista de metas                       │
│  - Convites (admin)                     │
│  - Dados dos pais                       │
└─────────────────────────────────────────┘
```

### Fluxo
```
1. Login → Retorna lista de famílias do usuário
2. Cliente escolhe família ativa → Armazena (localStorage/Zustand)
3. Todas as requisições de escopo familiar incluem X-Family-Id
4. Backend valida: usuário é membro desta família?
```

---

## Integrações Externas

### 1. Google OAuth 2.0
```
Scopes: openid, email, profile
Claims usados: sub, email, email_verified, name, picture
```
- Biblioteca: `Google.Apis.Auth`
- Validação: Backend verifica assinatura do token

### 2. PostgreSQL
```
Provider: Npgsql.EntityFrameworkCore.PostgreSQL
Features: JSONB (metadata de atividades), Indexes GIN
```

### Futuras (pós-MVP)
| Integração | Propósito | Status |
|------------|-----------|--------|
| Redis | Cache de sessões, queries | Planejado |
| SendGrid | Email transacional | Planejado |
| Push (FCM/APNS) | Notificações mobile | Futuro |

---

## Decisões Arquiteturais

### Por que Next.js + PWA?
- **Mobile-first**: App instalável sem loja (iOS/Android)
- **SSR/SSG**: SEO, performance inicial
- **TypeScript**: Type safety end-to-end

### Por que .NET 8?
- **Performance**: High-throughput com poucos recursos
- **Tooling**: Excelente ecosystem de testes (xUnit)
- **PostgreSQL**: EF Core provider maduro

### Por que Clean Architecture?
- **Testabilidade**: Domain puro, fácil de testar
- **Independência**: UI e Infra são substituíveis
- **Manutenção**: Regras de negócio isoladas

### Por que Privacidade Agregada?
- **Ética**: Não expor financeiro entre irmãos
- **Engajamento**: Evitar competição, focar colaboração
- **Implementação**: Lógica de negócio no backend, nunca retornar contribuições individuais

---

## Fluxos de Dados

### Registro de Ligação
```
Frontend: "Liguei Agora" → Timer → Modal → POST /api/activities/call
                              ↓
Backend: Auth → Valida familyId → Cria Activity → Retorna 201
                              ↓
Frontend: Otimistic update → Feed atualizado instantaneamente
```

### Contribuição para Meta
```
Frontend: Input valor → POST /api/goals/{id}/contribute
                              ↓
Backend: Valida meta ativa → Cria GoalContribution
         Atualiza Goal.currentAmount
         Se >= targetAmount → Status = Completed
                              ↓
Backend: Retorna { newProgressPercent, isCompleted }
                              ↓
Frontend: Anima progress bar → Toast sucesso → Feed atualizado
```

---

## Segurança (Visão Geral)

| Camada | Medida |
|--------|--------|
| Transporte | HTTPS/TLS 1.3 (Cloudflare + Nginx) |
| Autenticação | JWT (RS256 ou HS256 com secret 32+ chars) |
| Autorização | X-Family-Id validação de membership |
| Dados Sensíveis | Contribuições NUNCA expostas (aggregated only) |
| Input | FluentValidation + Zod |
| SQL Injection | EF Core (parameterized queries) |
| XSS | React escaping + CSP headers |

Detalhes completos em [Security Model](03-security-model.md).

---

## Próximos Passos

1. **[Security Model](03-security-model.md)** — Modelo de privacidade e permissões
2. **[API Reference](../02-reference/api-reference.md)** — Endpoints detalhados
3. **[Database Schema](../02-reference/database-schema.md)** — ERD e entidades
4. **[DevOps Guide](../03-how-to/devops-deployment.md)** — Deploy e infraestrutura

---

*Última atualização: Maio 2026 | Arquitetura v1.0*
