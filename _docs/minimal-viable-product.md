Excelente! Com todas as decisões tomadas, aqui estão os **prompts estruturados** segregados em planejamento e técnicos.

---

# 📋 PROMPTS DE PLANEJAMENTO (MVP - Project Ours)

---

## Prompt 1: PRD Técnico - MVP Project Ours

```markdown
Atue como Product Manager técnico e crie um PRD (Product Requirements Document) completo para o MVP do "Project Ours" — uma aplicação web PWA para cuidado colaborativo de pais entre irmãos.

**Contexto do Produto:**
- Objetivo: Aumentar engajamento de irmãos no cuidado dos pais sem fomentar competitividade
- Diferencial: Feed unificado mostrando atividades (não estatísticas individuais), metas financeiras coletivas com privacidade de contribuições

**Arquitetura Definida:**
- Frontend: Next.js 14+ com PWA, TypeScript, TailwindCSS
- Backend: API REST em C# (.NET 8+)
- Database: PostgreSQL
- Auth: OAuth Google apenas
- Hosting: Cloudflare (frontend), VPS Docker (backend + DB)

**Funcionalidades MVP (P0):**
1. Sistema de Autenticação OAuth Google + Onboarding de Família
2. Gestão de Família (admin único, convites com link 24h, aprovação de membros)
3. Registro de Ligações (botão "Liguei agora", duração opcional)
4. Feed Unificado (visualização cronológica de atividades identificadas)
5. Metas Financeiras Coletivas (criação, contribuição anônima agregada, barra de progresso)

**Entregáveis do PRD:**
1. User Stories detalhadas por funcionalidade (formato: Como [persona], quero [ação], para [objetivo])
2. Diagrama de entidades (ERD) com campos, tipos e relacionamentos
3. Definição de endpoints API REST (métodos, rotas, request/response bodies)
4. Fluxos de telas principais (onboarding, dashboard, registro de ligação, criação de meta)
5. Regras de negócio específicas:
   - Admin único pode: criar/editar família, aprovar/recusar convites, editar dados dos pais
   - Feed mostra: "Ana ligou hoje • Duração: 15min" / "Meta X atingiu 80%"
   - Metas: mostrar progresso agregado, NUNCA valor individual por irmão
   - Convites: link expira em 24h, status [pending, accepted, rejected, expired]
6. Wireframes textuais descrevendo layout mobile-first das 5 telas principais
7. Critérios de aceitação por user story

**Restrições:**
- Sem notificações push no MVP
- Sem criptografia end-to-end (server-side apenas)
- Um usuário pertence a apenas uma família
- Interface em português do Brasil

Gere o PRD completo em formato markdown estruturado.
```

---

## Prompt 2: User Stories Detalhadas

```markdown
Baseado no contexto do Project Ours, expanda as seguintes user stories em detalhes completos:

**Contexto:** Aplicativo PWA Next.js para cuidado colaborativo de pais. Auth OAuth Google. Um admin por família.

**User Stories para Expandir:**

US-001: Como primeiro irmão, quero criar uma família após login, para começar a usar o aplicativo.
US-002: Como admin, quero gerar um link de convite válido por 24h, para adicionar meus irmãos.
US-003: Como irmão convidado, quero entrar na família via link com aprovação do admin, para participar do cuidado.
US-004: Como irmão, quero clicar em "Liguei agora" e registrar duração opcional, para documentar minha ligação.
US-005: Como irmão, quero ver o feed de atividades da minha família, para acompanhar o cuidado aos pais.
US-006: Como irmão, quero criar uma meta financeira coletiva, para organizar gastos compartilhados.
US-007: Como irmão, quero contribuir para uma meta existente sem revelar meu valor aos outros, para manter privacidade.
US-008: Como irmão, quero ver minhas estatísticas pessoais, para me motivar a continuar ajudando.
US-009: Como admin, quero editar dados dos meus pais (nome, info médica), para manter informações atualizadas.

Para cada user story, forneça:
- Critérios de aceitação (Given/When/Then)
- Regras de negócio específicas
- Campos de formulário (se aplicável)
- Mensagens de erro/sucesso
- Edge cases (ex: convite expirado, meta já atingida, usuário já em outra família)
```

---

# 🔧 PROMPTS TÉCNICOS (Para Cursor AI)

---

## Prompt 3: Setup Inicial - Backend C# + PostgreSQL

```markdown
Crie a estrutura inicial do backend API para o Project Ours usando C# .NET 8 e PostgreSQL.

**Contexto:**
- Sistema de cuidado colaborativo de pais entre irmãos
- Auth: OAuth Google (JWT tokens)
- Arquitetura: Clean Architecture ou Layered Architecture
- Deploy: Docker container em VPS

**Estrutura Requerida:**

1. **Projeto Solution** com separação:
   - `ProjectOurs.API` (controllers, middleware)
   - `ProjectOurs.Application` (services, DTOs, interfaces)
   - `ProjectOurs.Domain` (entities, enums)
   - `ProjectOurs.Infrastructure` (DbContext, repositories, auth)

2. **Configurações:**
   - `appsettings.json` com estrutura para:
     - ConnectionStrings (PostgreSQL)
     - JwtSettings (para tokens Google)
     - OAuth Google config
   - `Program.cs` com:
     - Entity Framework Core (PostgreSQL provider)
     - Autenticação JWT
     - CORS para Next.js frontend
     - Swagger/OpenAPI

3. **Docker:**
   - `Dockerfile` otimizado para .NET 8
   - `docker-compose.yml` com:
     - API service
     - PostgreSQL service
     - Volume persistente para DB
     - Network interna

4. **Primeira Migration:**
   - Entities base: User, Family, FamilyInvite
   - Enums: InviteStatus, UserRole
   - Relacionamentos:
     - User 1:1 Family (nullable)
     - Family 1:N FamilyInvite
     - Family 1:N User (members)

**Não implemente ainda:**
- Lógica de OAuth (só estrutura)
- Endpoints de negócio
- Services completos

Foque na estrutura de projeto, configurações e migrations iniciais funcionais.
```

---

## Prompt 4: Autenticação OAuth Google + JWT

```markdown
Implemente a autenticação completa OAuth Google + JWT no backend ProjectOurs.

**Contexto:** 
- Frontend Next.js fará login via Google e enviará `id_token`
- Backend valida token Google, cria/atualiza usuário, retorna JWT próprio
- JWT usado para todas as rotas protegidas

**Implementações Necessárias:**

1. **Pacotes NuGet:**
   - `Google.Apis.Auth` para validação de tokens
   - `System.IdentityModel.Tokens.Jwt` para geração de tokens

2. **Configuração:**
   - `GoogleAuthSettings` com ClientId
   - `JwtSettings` com Secret, Issuer, Audience, ExpirationHours

3. **DTOs:**
   - `GoogleLoginRequest` { idToken: string }
   - `AuthResponse` { token: string, user: UserDto, isNewUser: boolean, hasFamily: boolean }

4. **Service - `AuthService`:**
   - `AuthenticateWithGoogle(string idToken)`:
     - Valida token com Google (biblioteca oficial)
     - Extrai: email, name, picture
     - Cria usuário se não existir
     - Gera JWT com claims: userId, email, role, familyId (nullable)
     - Retorna AuthResponse

5. **JWT Utilities:**
   - `IJwtService` com `GenerateToken(User)` e `ValidateToken(string)`
   - Configuração em `Program.cs` (AddAuthentication JwtBearer)

6. **Controller - `AuthController`:**
   - `POST /api/auth/google` → recebe GoogleLoginRequest, retorna AuthResponse
   - `POST /api/auth/refresh` → (para futuro, retornar 501 por enquanto)

7. **Middleware/Attribute:**
   - `[Authorize]` configurado
   - `CurrentUserService` para extrair UserId do token em controllers

8. **Tratamento de Erros:**
   - Token Google inválido/expirado → 401
   - Email não verificado no Google → 403

**Teste:** Inclua um `TEST_AUTH.md` explicando como testar com curl/Postman usando um token Google.
```

---

## Prompt 5: Módulo Família - Entidades e CRUD

```markdown
Implemente o módulo completo de Gestão de Família no backend.

**Regras de Negócio:**
- Um usuário pode estar em apenas uma família
- Cada família tem exatamente um admin
- Convite por link expira em 24h
- Novos membros entram com status "pending" até aprovação do admin

**Entidades a Criar/Atualizar:**

1. **Family:**
   - Id, Name, AdminId, CreatedAt
   - Navigation: Admin (User), Members (List<User>), Parents (List<Parent>), Invites (List<FamilyInvite>)

2. **Parent (representa pai/mãe cuidado):**
   - Id, FamilyId, Name, BirthDate?, MedicalInfo (JSONB/string), EmergencyBriefing (text)
   - Navigation: Family

3. **FamilyInvite:**
   - Id, FamilyId, InviteCode (6 chars alfanumérico), ExpiresAt, Status [Pending, Accepted, Rejected, Expired], InvitedUserEmail?
   - Navigation: Family

4. **Atualizar User:**
   - Adicionar: FamilyId (nullable), Role [Admin, Member], JoinedAt?

**Endpoints a Implementar:**

1. `POST /api/families` (autenticado)
   - Cria família, usuário vira admin automaticamente
   - Retorna family completa

2. `GET /api/families/my-family` (autenticado)
   - Retorna família do usuário logado com: admin, members[], parents[]

3. `POST /api/families/invite` (só admin)
   - Gera código de 6 caracteres aleatórios
   - ExpiresAt = Now + 24h
   - Retorna: { inviteCode, expiresAt, inviteUrl }

4. `POST /api/families/join` (autenticado)
   - Body: { inviteCode }
   - Valida: código existe, não expirou, status pending
   - Cria FamilyInvite com status Pending para aprovação
   - Retorna: { status: "pending_approval" }

5. `GET /api/families/pending-approvals` (só admin)
   - Retorna lista de convites pendentes com dados do usuário

6. `POST /api/families/approve/{userId}` (só admin)
   - Aprova entrada do usuário na família
   - Atualiza User.FamilyId e User.Role = Member

7. `POST /api/families/reject/{userId}` (só admin)
   - Rejeita convite, atualiza FamilyInvite.Status = Rejected

8. `PUT /api/families/parents/{parentId}` (só admin)
   - Atualiza dados do pai/mãe

**Services Necessários:**
- `IFamilyService` com todas as operações acima
- Validações de permissão (só admin pode admin)

**Tratamento de Erros:**
- Usuário já em família → 400
- Convite expirado → 400 com mensagem específica
- Não é admin tentando ação admin → 403
```

---

## Prompt 6: Módulo Ligações + Feed - Backend

```markdown
Implemente o módulo de Registro de Ligações e Feed de Atividades.

**Contexto:** Irmão registra ligação realizada. Feed mostra atividades cronologicamente.

**Entidades:**

1. **Activity (tabela unificada de atividades):**
   - Id, FamilyId, UserId, ParentId?, Type [Call, Visit, Medical, Task, Medication], 
   - Metadata (JSONB): para ligações = { durationMinutes?: number, notes?: string }
   - CreatedAt

2. **Atualizar DTOs:**
   - ActivityDto, CreateCallActivityRequest

**Endpoints:**

1. `POST /api/activities/call` (autenticado, membro de família)
   - Body: { parentId?, durationMinutes?, notes? }
   - Cria Activity.Type = Call
   - Metadata JSON: { durationMinutes, notes }
   - Retorna Activity completa

2. `GET /api/activities/feed` (autenticado)
   - Query params: ?limit=20&offset=0
   - Retorna atividades da família do usuário, ordenadas por CreatedAt DESC
   - Inclui: User (nome, avatar), Type, Metadata, CreatedAt (formatado)
   - Filtra: apenas família do usuário logado

3. `GET /api/activities/my-stats` (autenticado)
   - Retorna estatísticas pessoais do usuário:
     - totalCallsThisMonth
     - totalCallsLastMonth  
     - totalDurationThisMonth (minutos)
     - currentStreakDays (dias consecutivos com atividade)

**Regras de Negócio:**
- Usuário só vê atividades da própria família
- Feed não mostra valores de contribuição (isso é em Goals)
- "Liguei agora" cria registro com CreatedAt = now

**Include no retorno:**
- User.Name, User.Picture (do Google)
- Parent.Name (se ParentId informado)
```

---

## Prompt 7: Módulo Metas Financeiras - Backend

```markdown
Implemente o módulo de Metas Financeiras Coletivas com privacidade agregada.

**Regras de Negócio Críticas:**
- Todos veem progresso agregado da meta (barra de progresso)
- NINGUÉM vê quanto cada irmão contribuiu individualmente
- Apenas o próprio usuário vê seu histórico de contribuições

**Entidades:**

1. **Goal:**
   - Id, FamilyId, Title, TargetAmount, CurrentAmount, Status [Active, Completed, Cancelled], CreatedBy, CreatedAt, CompletedAt?

2. **GoalContribution:**
   - Id, GoalId, UserId, Amount, CreatedAt
   - Índice único: GoalId + UserId (um usuário pode contribuir múltiplas vezes, mas somamos)

**Endpoints:**

1. `POST /api/goals` (autenticado)
   - Body: { title, targetAmount }
   - Cria meta com Status = Active, CurrentAmount = 0
   - Retorna GoalDto

2. `GET /api/goals` (autenticado)
   - Retorna metas da família com:
     - Id, Title, TargetAmount, CurrentAmount, Status, ProgressPercent
     - ContributionsCount (quantidade de contribuições, não valores individuais)
     - CreatorName

3. `GET /api/goals/{goalId}` (autenticado)
   - Retorna meta completa
   - Inclui: lista de contribuições ANÔNIMA (soma por usuário omitida)
   - Marca quais contribuições são do usuário logado (para ele ver seus próprios valores)

4. `POST /api/goals/{goalId}/contribute` (autenticado)
   - Body: { amount: decimal }
   - Valida: amount > 0, meta ativa
   - Cria GoalContribution
   - Atualiza Goal.CurrentAmount += amount
   - Se CurrentAmount >= TargetAmount → Status = Completed, CompletedAt = now
   - Retorna: { contributionId, newProgressPercent, isCompleted }

5. `GET /api/goals/my-contributions` (autenticado)
   - Retorna todas as contribuições do usuário logado
   - Inclui: GoalTitle, Amount, CreatedAt

6. `POST /api/goals/{goalId}/cancel` (só admin ou creator)
   - Cancela meta, Status = Cancelled

**Respostas de Segurança:**
- GoalDto NUNCA inclui lista de GoalContributions com valores individuais
- GoalContributionDto para feed só mostra "Usuário contribuiu" sem valor
```

---

## Prompt 8: Frontend Next.js - Setup Inicial + PWA

```markdown
Crie a estrutura inicial do frontend Project Ours com Next.js 14, TypeScript, TailwindCSS e configuração PWA.

**Requisitos:**

1. **Next.js App Router** estrutura:
   ```
   src/
   ├── app/
   │   ├── (auth)/           # Rotas públicas
   │   │   ├── login/page.tsx
   │   │   └── layout.tsx
   │   ├── (app)/            # Rotas protegidas (dashboard)
   │   │   ├── dashboard/page.tsx
   │   │   ├── family/page.tsx
   │   │   ├── goals/page.tsx
   │   │   └── layout.tsx
   │   ├── api/auth/callback/route.ts  # Callback OAuth
   │   ├── layout.tsx
   │   └── globals.css
   ├── components/
   ├── hooks/
   ├── lib/
   ├── stores/               # Zustand
   ├── types/
   └── services/             # API calls
   ```

2. **Configuração PWA:**
   - `next-pwa` configurado
   - `manifest.json` com: name, short_name, icons, start_url, display=standalone
   - Service worker para cache de assets
   - Ícones placeholders (serão substituídos depois)

3. **Dependências:**
   - TailwindCSS + shadcn/ui (instalação configurada)
   - Zustand (gerenciamento de estado)
   - React Query / SWR (opcional, pode ser fetch simples inicialmente)
   - date-fns (formatação de datas pt-BR)

4. **Configurações:**
   - `tailwind.config.ts` com tema: cores primária (azul suave), secundária (verde)
   - `next.config.js` com PWA e rewrites para API
   - Environment variables: NEXT_PUBLIC_API_URL

5. **Layout Base:**
   - `app/layout.tsx` com providers (Zustand)
   - `app/(app)/layout.tsx` com: BottomNavigation (mobile) ou Sidebar (desktop)
   - Navegação: Dashboard | Família | Metas | Perfil

6. **Componentes Base (shadcn):**
   - Button, Card, Input, Dialog, Toast/Sonner
   - Instale via CLI do shadcn

**Não implemente ainda:**
- Lógica de autenticação
- Chamadas de API reais
- Telas completas

Foque na estrutura, configurações e navegação funcionando.
```

---

## Prompt 9: Frontend - Autenticação Google + Zustand

```markdown
Implemente a autenticação completa OAuth Google no frontend Next.js usando Zustand para estado global.

**Arquitetura de Auth:**

1. **Zustand Store - `useAuthStore`:**
   ```typescript
   interface AuthState {
     user: User | null;
     token: string | null;
     isAuthenticated: boolean;
     isLoading: boolean;
     hasFamily: boolean;
     login: (googleIdToken: string) => Promise<void>;
     logout: () => void;
     checkAuth: () => void;
   }
   ```

2. **Componente `GoogleLoginButton`:**
   - Usar `@react-oauth/google` ou script oficial
   - ClientId do Google
   - onSuccess: extrai `credential` (id_token), chama `authStore.login(credential)`

3. **Service `authService`:**
   - `loginWithGoogle(idToken: string): Promise<AuthResponse>`
   - Chamada POST para `/api/auth/google`
   - Armazena token JWT retornado no localStorage
   - Retorna: { user, token, isNewUser, hasFamily }

4. **Hook `useAuth`:**
   - Wrapper em volta do store para conveniência
   - `useEffect` inicial: verifica token no localStorage, valida se válido

5. **Middleware/Roteamento:**
   - `middleware.ts`: redireciona `/` → `/login` se não autenticado
   - Redireciona `/login` → `/onboarding` se autenticado sem família
   - Redireciona `/login` → `/dashboard` se autenticado com família

6. **Tela `LoginPage`:**
   - Centro da tela: logo + botão "Entrar com Google"
   - Mensagem: "Cuide dos seus pais junto com seus irmãos"
   - Após login, redireciona baseado em `hasFamily`

7. **Tela `OnboardingPage`:**
   - Se `isNewUser` e não tem família:
   - Botão: "Criar minha família" → POST /api/families → redirect /dashboard

8. **Header/Menu:**
   - Mostra avatar do usuário (Google picture)
   - Dropdown: "Minha Família", "Sair"
   - Logout limpa store e localStorage

**Tratamento de Erros:**
- Toast de erro se login Google falhar
- Se API retornar 401, redireciona para login
- Loading states em botões

**Tipagens:**
- Interfaces `User`, `AuthResponse`, `Family` em `types/`
```

---

## Prompt 10: Frontend - Dashboard + Feed de Atividades

```markdown
Implemente a tela Dashboard com Feed de Atividades e botão "Liguei Agora".

**Layout Dashboard:**

1. **Estrutura Mobile-First:**
   - Header: Logo pequeno + Avatar usuário (dropdown)
   - Seção "Resumo da Semana": cards horizontais scrolláveis
   - Seção "Ações Rápidas": botão principal "Liguei Agora"
   - Seção "Feed": lista cronológica de atividades

2. **Componente `WeeklySummary`:**
   - Dados: "Esta semana"
   - Cards: 
     - "Ligações: 8 totais" (ícone telefone)
     - "Sua contribuição: 3 ligações" (destaque pessoal)
     - "Meta ativa: 75% atingida" (se houver meta)
   - Não mostrar ranking/ranking implícito

3. **Componente `QuickCallButton`:**
   - Botão grande, circular ou card destacado
   - Texto: "📞 Liguei Agora"
   - Ao clicar:
     - Inicia timer opcional (mostra "00:00" cronometrando)
     - Botão muda para "Finalizar Ligação"
     - Ao finalizar: abre modal com input "Duração (min)" + "Notas (opcional)"
     - POST /api/activities/call
     - Atualiza feed automaticamente

4. **Componente `ActivityFeed`:**
   - Lista vertical de `ActivityCard`
   - Cada card:
     - Avatar do irmão (pequeno, redondo)
     - Nome do irmão + ação ("ligou para o Pai")
     - Hora relativa ("hoje, 14:30" / "ontem" / "3 dias atrás")
     - Se ligação: mostrar duração "• 15 minutos"
   - Skeleton loading enquanto carrega
   - Pull-to-refresh (ou botão atualizar)

5. **Hook `useActivities`:**
   - `useEffect` carrega feed ao montar
   - `createCallActivity(data)` para nova ligação
   - Otimistic update: insere no feed imediatamente, confirma depois

6. **Hook `useMyStats`:**
   - Carrega estatísticas pessoais do endpoint /api/activities/my-stats
   - Mostra no topo: "Você ligou 5 vezes este mês 🎉"

**Empty States:**
- Feed vazio: "Nenhuma atividade ainda. Seja o primeiro a ligar!"
- Primeiro uso: tutorial/tooltip no botão "Liguei Agora"

**Estados de UI:**
- Loading inicial: skeleton
- Erro: toast + retry button
- Sucesso: toast "Ligação registrada!"
```

---

## Prompt 11: Frontend - Módulo Família e Convites

```markdown
Implemente as telas de Gestão de Família: criação, membros, convites e aprovações.

**Telas/Rotas:**

1. **Tela `/family` (visualização):**
   - Se não tem família: mostra botão "Criar Família"
   - Se tem família:
     - Card: Nome da família + "Você é o admin" (badge)
     - Lista de membros: avatar, nome, "Membro desde..."
     - Seção "Pais": cards com nome, idade, botão "Ver briefing de emergência"
     - Se admin: botão "Convidar irmão"

2. **Modal/Dialog `CreateFamily`:**
   - Input: "Nome da Família (ex: Família Silva)"
   - Botão: "Criar"
   - POST /api/families
   - Após criar: redireciona para /family (agora com dados)

3. **Modal `InviteSibling`:**
   - Explica: "Envie este link para seus irmãos. Expira em 24h."
   - Mostra: código de 6 caracteres + URL completa
   - Botão: "Copiar link"
   - Botão: "Gerar novo convite" (invalida anterior)

4. **Tela `/family/join` (acessível por link):**
   - Recebe query param: `?code=ABC123`
   - Mostra: "Você foi convidado para Família [Nome]"
   - Se não logado: redireciona para login primeiro, volta para cá
   - Botão: "Solicitar entrada"
   - POST /api/families/join com código
   - Mensagem: "Aguardando aprovação do admin"

5. **Tela `/family/pending` (só admin):**
   - Lista: Nome + Email + "Aprovar" / "Recusar"
   - Botões com confirmação
   - Atualiza lista após ação

6. **Tela `/family/parents/[id]` (detalhe do pai):**
   - Nome, data de nascimento
   - Seção "Briefing de Emergência" (texto livre editável só admin)
   - Se admin: botão "Editar" que abre modal/form

**Hook `useFamily`:**
   - `createFamily(name)`, `getMyFamily()`, `generateInvite()`, `joinFamily(code)`, `approveMember(userId)`, `rejectMember(userId)`

**Permissões visuais:**
   - Botões de admin só aparecem se `user.role === 'admin'`
   - Convite expirado: mostra badge "Expirado", desabilita ações

**Toast de feedback:**
   - "Link copiado!"
   - "Entrada solicitada. Aguarde aprovação."
   - "Irmão aprovado com sucesso."
```

---

## Prompt 12: Frontend - Metas Financeiras

```markdown
Implemente o módulo de Metas Financeiras Coletivas no frontend.

**Tela `/goals` (listagem):**

1. **Header:**
   - Título: "Metas da Família"
   - Se admin: botão "+ Nova Meta"

2. **Lista de Metas:**
   - Card para cada meta:
     - Título: "Remédio de Junho"
     - Barra de progresso visual (verde = ativa, azul = completa, cinza = cancelada)
     - Texto: "R$ 350 de R$ 500 arrecadados (70%)"
     - Badge de status
     - Indicador: "12 contribuições" (anônimo)

3. **Modal `CreateGoal` (só admin):**
   - Input: Título
   - Input: Valor Meta (R$)
   - Botão: "Criar Meta"
   - POST /api/goals

**Tela `/goals/[id]` (detalhe da meta):**

1. **Card Principal:**
   - Título grande, status
   - Barra de progresso grande com porcentagem
   - Valores: "R$ 350 de R$ 500"

2. **Seção "Contribuir" (se meta ativa):**
   - Input: "Quanto você quer contribuir? (R$)"
   - Botão: "Contribuir"
   - Modal de confirmação antes de enviar
   - POST /api/goals/{id}/contribute
   - Após sucesso: animação na barra de progresso, toast "Contribuição registrada!"

3. **Seção "Minha Contribuição":**
   - Mostra apenas para usuário logado:
   - "Você contribuiu R$ 150 nesta meta"
   - Lista: "Sua contribuição: R$ 100 - 10/06/2024"

4. **Seção "Atividade Recente" (anônimo):**
   - Lista: "Alguém contribuiu • há 2 horas" (sem valor!)
   - NUNCA mostrar: "João contribuiu R$ 50"

5. **Se meta completa:**
   - Banner de celebração: "🎉 Meta atingida!"
   - Botão desabilitado: "Meta encerrada"

6. **Se admin:**
   - Botão "Cancelar Meta" (com confirmação)

**Hook `useGoals`:**
   - `getGoals()`, `createGoal(data)`, `contribute(goalId, amount)`, `getGoal(goalId)`, `cancelGoal(goalId)`, `getMyContributions()`

**Empty State:**
   - "Nenhuma meta ativa. Crie uma meta para organizar gastos em conjunto."

**Regras de UI Críticas:**
   - NUNCA exibir valor individual de outro usuário
   - Sempre agregar: "R$ 350 arrecadados no total"
   - O usuário só vê SEU próprio valor na seção "Minha Contribuição"
```

---

## Prompt 13: Testes E2E - Fluxos Críticos

```markdown
Crie testes end-to-end para os fluxos críticos do Project Ours usando Playwright.

**Cenários de Teste:**

1. **Onboarding Completo:**
   - Usuário novo faz login Google (mock)
   - Cria família
   - Verifica redirecionamento para dashboard

2. **Convite e Aprovação:**
   - Admin gera convite
   - Copia link de convite
   - Segundo usuário (mock diferente) acessa link
   - Solicita entrada
   - Admin aprova
   - Segundo usuário vê família no dashboard

3. **Registro de Ligação:**
   - Usuário logado clica "Liguei Agora"
   - Preenche duração
   - Verifica atividade no feed

4. **Fluxo de Meta Financeira:**
   - Admin cria meta de R$ 500
   - Usuário contribui R$ 100
   - Verifica progresso em 20%
   - Verifica que valor individual não aparece para outros (teste com segundo usuário)

5. **Permissões de Admin:**
   - Usuário membro (não admin) tenta criar meta
   - Espera erro 403 ou UI desabilitada
   - Verifica que não vê botão "Aprovar membros"

**Estrutura dos Testes:**

```typescript
// tests/onboarding.spec.ts
test('usuário novo cria família', async ({ page }) => {
  // mocks de auth Google
  // ações
  // asserções
});
```

**Mock de Auth Google:**
- Crie utilitário `mockGoogleAuth(page, { email, name, picture, sub })`
- Intercepta chamadas ao Google e retorna token mockado

**Fixtures:**
- `test.use({ storageState: 'auth.json' })` para testes logados

**Configuração:**
- `playwright.config.ts` com projetos: desktop, mobile
- Base URL: http://localhost:3000

**Dados de Teste:**
- Use nomes fictícios consistentes: "Família Teste", "João", "Maria"

**CI-ready:**
- Scripts em `package.json`: `test:e2e`, `test:e2e:ui`
- Ignore `test-results/` e `playwright-report/` no `.gitignore`
```

---

## Resumo da Estratégia

| Fase | Prompts | Objetivo |
|---|---|---|
| **Planejamento** | 1, 2 | Definir requisitos, user stories, wireframes |
| **Backend** | 3, 4, 5, 6, 7 | Estrutura, Auth, Família, Ligações, Metas |
| **Frontend** | 8, 9, 10, 11, 12 | Setup, Auth, Dashboard, Família, Metas |
| **Qualidade** | 13 | Testes E2E dos fluxos críticos |

---

**Próximo passo recomendado:** Execute o **Prompt 1** com uma IA de planejamento (Claude/ChatGPT) para gerar o PRD completo. Depois, use os prompts técnicos no Cursor AI para implementação incremental.