# Project Ours - Testes de API com Bruno

> **How-to**: Teste a API com a coleção Bruno

---

## O que é Bruno?

[Bruno](https://www.usebruno.com/) é um cliente API open-source, offline-first, alternativa ao Postman/Insomnia. Armazena collections em arquivos de texto plano (Git-friendly).

```
✅ Arquivos .bru no Git (versionável)
✅ Offline-first (sem cloud obrigatória)
✅ Scripts pré/pós-request em JavaScript
✅ Variáveis por ambiente (dev, staging, prod)
```

---

## Instalação

### macOS
```bash
brew install bruno
```

### Windows
```bash
# Via Chocolatey
choco install bruno

# Ou download direto
# https://www.usebruno.com/downloads
```

### Linux
```bash
# AppImage ou snap
snap install bruno
```

---

## Abrindo a Coleção

```bash
# No terminal
cd server/collections/bruno
bruno .

# Ou abra o Bruno GUI e selecione a pasta
# File > Open Collection > server/collections/bruno
```

---

## Fluxo de Teste

### 1. Selecionar Ambiente

Na barra lateral do Bruno, escolha o ambiente:
- `local` — Desenvolvimento local (padrão: http://localhost:5280)

Para adicionar outros ambientes, crie arquivos em `environments/`:
```bash
# environments/staging.bru
vars {
  baseUrl: https://api-staging.ours.app
}
```

### 2. Executar na Ordem

| Ordem | Request | Propósito | Variável Gerada |
|-------|---------|-----------|-----------------|
| 1 | **01-antiforgery** | Obtém token antiforgery | `requestToken` |
| 2 | **02-google-login** | Login com Google (real) | Cookie `po_auth` |
| 3 | **03-session** | Verifica sessão válida | — |
| 4 | **04-me-active-family** | Dados da família ativa | — |
| 5 | **05-logout** | Encerra sessão | Cookie removido |

### 3. Configurar Google ID Token

O request `02-google-login` requer um token Google real.

**Como obter:**

#### Opção A: Pelo Browser (mais fácil)
```javascript
// 1. Abra o app em http://localhost:3000/login
// 2. Abra DevTools > Console
// 3. NÃO clique no botão de login ainda
// 4. Execute:
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.initiatorType === 'xmlhttprequest' && entry.name.includes('google')) {
      console.log('Google API call:', entry.name);
    }
  }
});
observer.observe({ entryTypes: ['resource'] });

// 5. Agora clique em "Entrar com Google"
// 6. Na aba Network, encontre a requisição com "token"
// 7. Copie o valor do campo `credential` ou do POST
```

#### Opção B: Google OAuth Playground
1. Acesse https://developers.google.com/oauthplayground
2. Selecione scope: `openid email profile`
3. Troque o código por token
4. Copie o `id_token` (não o `access_token`)

#### Definir no Bruno

```bash
# Clique na aba "Variables" no Bruno
# Cole o idToken na variável googleIdToken

# Ou edite local.bru diretamente:
vars {
  baseUrl: http://localhost:5280
  googleIdToken: eyJhbGciOiJSUzI1NiIsImtpZCI6IjE2In0...
}
```

**Nota:** O token Google expira em ~1 hora. Renove quando necessário.

---

## Variáveis de Coleção

| Variável | Origem | Uso |
|----------|--------|-----|
| `baseUrl` | Ambiente | URL base da API |
| `requestToken` | Script 01-antiforgery | Antiforgery em mutações |
| `googleIdToken` | Manual | Login Google |
| `familyId` | Manual | Header X-Family-Id |

---

## Cookies

O Bruno gerencia cookies automaticamente:

```
✅ Cookie antiforgery — Setado no request 01
✅ Cookie po_auth — Setado no request 02 (login)
✅ Cookie po_auth — Invalidado no request 05 (logout)
```

Verifique em: **View > Cookies** ou aba Cookies no request.

---

## Extensões Futuras

### Novos Módulos

Adicione pastas para outros domínios:

```
collections/bruno/
  Auth/           # ✅ Existente
  Families/       # 🔄 Criar ao implementar família
  Activities/     # 🔄 Criar ao implementar ligações
  Goals/          # 🔄 Criar ao implementar metas
```

### Testes Automatizados

```javascript
// Exemplo: teste de resposta
assert(res.status === 200);
assert(res.body.user.email !== undefined);
assert(res.body.familyCount >= 0);
```

Adicione no script `script:post-response` de qualquer request.

---

## Troubleshooting

### 400 Bad Request no login
```
→ Token antiforgery expirado ou ausente
→ Solução: Execute 01-antiforgery novamente
```

### 401 Unauthorized
```
→ Cookie po_auth expirado ou inválido
→ Solução: Execute o fluxo completo novamente (1 → 2)
```

### 403 Email não verificado
```
→ Conta Google não tem email verificado
→ Solução: Verifique o email no Google Account
```

---

## Comparação com Postman

| Feature | Postman | Bruno |
|---------|---------|-------|
| Cloud | Obrigatória para sync | Opcional (Git-first) |
| Formato | JSON binário | Texto plano (.bru) |
| Scripts | Pre/Post-request | Pre/Post-response |
| Coleções | Import/export | Direto no filesystem |
| Workspace | Proprietário | Open-source |

**Migração:** A coleção Postman antiga está em `collections/ProjectOurs.Auth.postman_collection.json` (depreciada).

---

## Referências

- [Login Flow](./login-flow.md) — Diagrama do fluxo de auth
- [API Reference](../02-reference/api-reference.md) — Contratos de endpoints
- [Bruno Docs](https://docs.usebruno.com/) — Documentação oficial

---

*Versão: 1.0 | Coleção: server/collections/bruno | Última atualização: Maio 2026*
