# Project Ours - API Reference

> **Reference**: Endpoints REST completos para desenvolvimento

---

## Convenções

### Base URL
```
Desenvolvimento: http://localhost:5280/api
Produção: https://api.ours.app/api
```

### Headers Padrão

```
Content-Type: application/json
X-Family-Id: {uuid}              # Quando operação é específica de família
RequestVerificationToken: {token}  # Obrigatório em POST/PUT/DELETE
```

**Autenticação:** Sessão via cookie HttpOnly `po_auth`. **Não** enviar `Authorization: Bearer`.

**Antiforgery:** Obter token em `GET /auth/antiforgery` antes de qualquer mutação.

**Exemplo completo:**
```bash
curl -H "RequestVerificationToken: <token>" \
     -H "X-Family-Id: <family-uuid>" \
     -b cookies.txt \
     -X POST \
     /api/families/invite
```

### Respostas
- **200**: Sucesso (GET, PUT)
- **201**: Criado (POST)
- **400**: Bad Request (validação)
- **401**: Unauthorized (token inválido/ausente)
- **403**: Forbidden (sem permissão)
- **404**: Not Found

---

## Autenticação

### GET /auth/antiforgery

Obtém token antiforgery para uso em mutações (POST/PUT/DELETE).

**Response (200):**
```json
{
  "requestToken": "string"
}
```

**Cookies set:** Cookie antiforgery (`.AspNetCore.Antiforgery.*`)

---

### POST /auth/google

Autenticação via Google OAuth. Cookie `po_auth` é setado na resposta.

**Headers:**
```
RequestVerificationToken: {token_do_antiforgery}
Content-Type: application/json
```

**Request:**
```json
{
  "idToken": "string"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@email.com",
    "name": "João Silva",
    "picture": "https://...",
    "families": [
      { "id": "uuid", "name": "Família Silva", "role": "Admin" }
    ]
  },
  "isNewUser": true,
  "familyCount": 1
}
```

**Cookies set:** `po_auth` (JWT HttpOnly, 24h)

**Erros:**
- `400`: Missing antiforgery token
- `401`: Token Google inválido ou expirado
- `403`: Email não verificado no Google

---

### GET /auth/session

Verifica validade da sessão atual (para SSR/redirects).

**Cookies enviados:** `po_auth`

**Response:**
- `204` — Sessão válida
- `401` — Sessão inválida ou expirada

---

### POST /auth/logout

Encerra sessão atual. Requer novo antiforgery token.

**Headers:**
```
RequestVerificationToken: {token_renovado}
```

**Response:**
- `204` — Logout OK (cookie `po_auth` removido)
- `400` — Missing antiforgery token

---

## Famílias

### POST /families
Cria nova família. Usuário vira admin automaticamente.

**Headers:** `X-Family-Id: {uuid}` (se aplicável) — autenticação via cookie `po_auth`

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
- `400`: Nome inválido (mín 3, máx 50 caracteres)

---

### GET /families
Lista todas as famílias do usuário autenticado.

**Headers:** `X-Family-Id: {uuid}` (se aplicável) — autenticação via cookie `po_auth`

**Response (200):**
```json
{
  "families": [
    {
      "id": "uuid",
      "name": "Família Silva",
      "role": "Admin",
      "joinedAt": "2026-05-01T10:00:00Z"
    }
  ]
}
```

---

### GET /families/{familyId}
Detalhe completo de uma família (membros, pais, convite ativo).

**Headers:** `X-Family-Id: {uuid}` (se aplicável) — autenticação via cookie `po_auth`

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Família Silva",
  "admin": { /* user object */ },
  "members": [
    { 
      "id": "uuid", 
      "name": "Ana", 
      "role": "Member", 
      "picture": "...", 
      "joinedAt": "..." 
    }
  ],
  "parents": [
    { 
      "id": "uuid", 
      "name": "Mãe", 
      "birthDate": "...", 
      "medicalInfo": {...} 
    }
  ],
  "invite": { 
    "inviteCode": "ABC123",
    "expiresAt": "...",
    "status": "Pending"
  }
}
```

**Erros:**
- `403`: Usuário não é membro desta família
- `404`: Família não encontrada

---

### POST /families/invite
Gera convite para família (apenas admin).

**Headers:** 
- `Authorization: Bearer {token}`
- `X-Family-Id: {uuid}` (obrigatório se usuário tem >1 família)

**Response (201):**
```json
{
  "inviteCode": "ABC123",
  "expiresAt": "2026-05-02T10:00:00Z",
  "inviteUrl": "https://ours.app/family/join?code=ABC123"
}
```

**Erros:**
- `403`: Usuário não é admin

---

### POST /families/join
Solicita entrada em família via código.

**Headers:** `X-Family-Id: {uuid}` (se aplicável) — autenticação via cookie `po_auth`

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
- `400`: Código inválido ou expirado
- `400`: Usuário já é membro desta família
- `400`: Convite já foi usado ou rejeitado

---

### GET /families/pending-approvals
Lista solicitações pendentes (apenas admin).

**Headers:** 
- `Authorization: Bearer {token}`
- `X-Family-Id: {uuid}`

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

### POST /families/approve/{userId}
Aprova entrada de membro (apenas admin).

**Headers:** 
- `Authorization: Bearer {token}`
- `X-Family-Id: {uuid}`

**Response (200):**
```json
{
  "message": "Membro aprovado com sucesso.",
  "user": { /* user object atualizado */ }
}
```

---

### POST /families/reject/{userId}
Rejeita solicitação de entrada (apenas admin).

**Headers:** 
- `Authorization: Bearer {token}`
- `X-Family-Id: {uuid}`

**Response (200):**
```json
{
  "message": "Solicitação rejeitada."
}
```

---

### PUT /families/parents/{parentId}
Atualiza dados do pai/mãe (apenas admin).

**Headers:** `X-Family-Id: {uuid}` (se aplicável) — autenticação via cookie `po_auth`

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
- `403`: Usuário não é admin
- `404`: Pai/mãe não encontrado

---

## Atividades

### POST /activities/call
Registra ligação realizada.

**Headers:** `X-Family-Id: {uuid}` (se aplicável) — autenticação via cookie `po_auth`

**Request:**
```json
{
  "parentId": "uuid",
  "durationMinutes": 15,
  "notes": "Conversa sobre consulta médica"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "type": "Call",
  "user": { 
    "id": "uuid",
    "name": "Ana", 
    "picture": "..." 
  },
  "parent": { 
    "id": "uuid",
    "name": "Pai" 
  },
  "metadata": {
    "durationMinutes": 15,
    "notes": "Conversa sobre consulta médica"
  },
  "createdAt": "2026-05-01T14:30:00Z"
}
```

---

### GET /activities/feed
Retorna feed de atividades da família.

**Headers:** 
- `Authorization: Bearer {token}`
- `X-Family-Id: {uuid}` (se usuário tem >1 família)

**Query Params:**
- `limit`: number (default 20, max 50)
- `offset`: number (default 0)

**Response (200):**
```json
{
  "activities": [
    {
      "id": "uuid",
      "type": "Call",
      "user": { 
        "name": "Ana", 
        "picture": "..." 
      },
      "parent": { 
        "name": "Pai" 
      },
      "metadata": { 
        "durationMinutes": 15 
      },
      "createdAt": "2026-05-01T14:30:00Z",
      "formattedTime": "hoje, 14:30"
    }
  ],
  "hasMore": true,
  "total": 156
}
```

---

### GET /activities/my-stats
Retorna estatísticas pessoais do usuário.

**Headers:** 
- `Authorization: Bearer {token}`
- `X-Family-Id: {uuid}` (se usuário tem >1 família)

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

## Metas Financeiras

### POST /goals
Cria nova meta financeira.

**Headers:** 
- `Authorization: Bearer {token}`
- `X-Family-Id: {uuid}` (se usuário tem >1 família)

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
- `400`: Valor mínimo de R$ 10,00
- `400`: Título inválido

---

### GET /goals
Lista metas da família.

**Headers:** 
- `Authorization: Bearer {token}`
- `X-Family-Id: {uuid}`

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

### GET /goals/{goalId}
Detalhes da meta.

**Headers:** `X-Family-Id: {uuid}` (se aplicável) — autenticação via cookie `po_auth`

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
  "myTotalContribution": 150.00,
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

**Nota:** `recentActivity` nunca revela quem contribuiu ou quanto.

---

### POST /goals/{goalId}/contribute
Contribui para meta.

**Headers:** `X-Family-Id: {uuid}` (se aplicável) — autenticação via cookie `po_auth`

**Request:**
```json
{
  "amount": 100.00
}
```

**Response (200) - Meta ativa:**
```json
{
  "contributionId": "uuid",
  "newProgressPercent": 90,
  "isCompleted": false,
  "message": "Contribuição registrada!"
}
```

**Response (200) - Meta completa:**
```json
{
  "contributionId": "uuid",
  "newProgressPercent": 100,
  "isCompleted": true,
  "message": "🎉 Meta atingida!"
}
```

**Erros:**
- `400`: Valor mínimo de R$ 1,00
- `400`: Meta não está ativa
- `400`: Valor excede o restante da meta

---

### GET /goals/my-contributions
Histórico de contribuições do usuário logado.

**Headers:** `X-Family-Id: {uuid}` (se aplicável) — autenticação via cookie `po_auth`

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

### POST /goals/{goalId}/cancel
Cancela meta (apenas admin ou criador).

**Headers:** `X-Family-Id: {uuid}` (se aplicável) — autenticação via cookie `po_auth`

**Response (200):**
```json
{
  "message": "Meta cancelada com sucesso."
}
```

**Erros:**
- `403`: Usuário não é admin nem criador
- `400`: Meta já está completa ou cancelada

---

## Códigos HTTP por Endpoint

| Endpoint | 200 | 201 | 204 | 400 | 401 | 403 | 404 |
|----------|-----|-----|-----|-----|-----|-----|-----|
| GET /auth/antiforgery | ✅ | - | - | - | - | - | - |
| POST /auth/google | - | - | - | ✅ | ✅ | ✅ | - |
| GET /auth/session | - | - | ✅ | - | ✅ | - | - |
| POST /auth/logout | - | - | ✅ | ✅ | - | - | - |
| POST /families | - | ✅ | - | ✅ | ✅ | ✅ | - |
| GET /families | ✅ | - | - | - | ✅ | - | - |
| GET /families/{id} | ✅ | - | - | - | ✅ | ✅ | ✅ |
| POST /families/invite | - | ✅ | - | ✅ | ✅ | ✅ | - |
| POST /families/join | ✅ | - | - | ✅ | ✅ | - | - |
| GET /families/pending-approvals | ✅ | - | - | - | ✅ | ✅ | - |
| POST /families/approve/{id} | ✅ | - | - | - | ✅ | ✅ | ✅ |
| PUT /families/parents/{id} | ✅ | - | - | - | ✅ | ✅ | ✅ |
| POST /activities/call | - | ✅ | - | ✅ | ✅ | - | - |
| GET /activities/feed | ✅ | - | - | - | ✅ | - | - |
| GET /activities/my-stats | ✅ | - | - | - | ✅ | - | - |
| POST /goals | - | ✅ | - | ✅ | ✅ | - | - |
| GET /goals | ✅ | - | - | - | ✅ | - | - |
| GET /goals/{id} | ✅ | - | - | - | ✅ | - | ✅ |
| POST /goals/{id}/contribute | ✅ | - | - | ✅ | ✅ | - | ✅ |
| POST /goals/{id}/cancel | ✅ | - | - | ✅ | ✅ | ✅ | ✅ |

---

## Estrutura JWT (Cookie HttpOnly)

O JWT é emitido pelo servidor e armazenado em cookie HttpOnly `po_auth`. **Nunca** exposto no corpo da resposta.

```json
{
  "sub": "user_uuid",
  "email": "user@email.com",
  "iat": 1714560000,
  "exp": 1714596000,
  "iss": "project-ours-api",
  "aud": "project-ours-app"
}
```

**Notas:**
- Role (Admin/Member) e família NÃO estão no JWT — obtidos via `FamilyMembership` no banco
- Cookie: HttpOnly, Secure, SameSite=Strict
- Antiforgery token obrigatório em mutações

---

## Referências

- [Login Flow](./login-flow.md) — Fluxo completo de autenticação
- [Security Model](../01-explanation/03-security-model.md) — Privacidade e proteções

---

*Versão API: 1.1 | Auth: Cookie HttpOnly + Antiforgery | Última atualização: Maio 2026*
