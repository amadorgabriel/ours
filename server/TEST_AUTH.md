# Testar autenticação (Google + JWT em cookie)

A API usa **antiforgery** em mutações (`POST`/`PUT`/`PATCH`/`DELETE`), **JWT em cookie HttpOnly** (`po_auth` por padrão) e validação de **Google ID token** no endpoint `POST /api/auth/google`.

## Pré-requisitos

1. PostgreSQL acessível e string em `ConnectionStrings:PostgreSQL`.
2. `dotnet ef database update` (ou migração aplicada no deploy).
3. `Authentication:Google:ClientId` = **Client ID OAuth 2.0 (tipo Web)** da Google Cloud Console, com origens JavaScript autorizadas alinhadas ao front.
4. Subir a API: `dotnet run --project src/ProjectOurs.API` (porta padrão **5280** em `launchSettings.json`).

## Postman (API direta)

Importe `collections/ProjectOurs.Auth.postman_collection.json`.

1. Ajuste a variável de coleção **`baseUrl`** (ex.: `http://localhost:5280`).
2. Execute **1 — GET antiforgery** (grava `antiforgeryToken` e cookie de antiforgery).
3. Cole um **`googleIdToken`** real na variável **`googleIdToken`** (obtido no front após login Google, ou via fluxo de debug).
4. Execute **2 — POST Google login**. O Postman guarda o cookie **`po_auth`** na sessão.
5. Defina **`familyId`** com um GUID de família da qual o usuário é membro (ou crie dados no banco).
6. Execute **4 — GET me active-family** (envia `X-Family-Id` + cookie JWT).

Para **5 — POST logout**, rode de novo **1 — GET antiforgery** para renovar o token de verificação, depois logout.

## curl (API direta)

Obter token antiforgery (guarde o JSON e o cookie `Set-Cookie` da resposta):

```bash
curl -s -D headers.txt -c cookies.txt "http://localhost:5280/api/auth/antiforgery"
```

Extraia `requestToken` do corpo e envie no header `RequestVerificationToken` junto com os cookies `-b cookies.txt`:

```bash
curl -s -D - -b cookies.txt -c cookies.txt \
  -H "Content-Type: application/json" \
  -H "RequestVerificationToken: <requestToken>" \
  -d "{\"idToken\":\"<GOOGLE_ID_TOKEN>\"}" \
  "http://localhost:5280/api/auth/google"
```

Chamada autenticada com família:

```bash
curl -s -b cookies.txt -H "X-Family-Id: <FAMILY_GUID>" \
  "http://localhost:5280/api/me/active-family"
```

## Next.js (mesmo origin)

Com `BACKEND_URL` no `.env.local` apontando para a API, o Next faz **rewrite** de `/api/*` para o backend. O browser só chama `http://localhost:3000/api/...` com `credentials: 'include'` para enviar cookies.

## Mapa de erros (família)

- **401** — JWT ausente ou inválido.
- **400** — `X-Family-Id` ausente ou GUID inválido.
- **403** — GUID válido, mas usuário não é membro da família.
