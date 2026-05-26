# Collections de API - Project Ours

## Status

- **Bruno** (`bruno/`) — ✅ **Ativo** — Use este para testes manuais

## Recomendado: Bruno

```bash
# Abra a coleção no Bruno
cd bruno
bruno .

# Ou via GUI: File > Open Collection > server/collections/bruno
```

Veja o [guia completo](../../_docs/03-how-to/bruno-api-testing.md) para instruções detalhadas.

## Estrutura Bruno

```
bruno/
  bruno.json              # Config da coleção
  environments/
    local.bru             # Ambiente local
  Auth/
    01-antiforgery.bru    # Obtém token CSRF
    02-google-login.bru   # Login com Google
    03-session.bru        # Verifica sessão
    04-me-active-family.bru  # Dados da família
    05-logout.bru         # Encerra sessão
```

## Fluxo de Teste

Execute na ordem numérica:
1. **01-antiforgery** — Guarda token em variável `requestToken`
2. **02-google-login** — Define cookie `po_auth` (precisa de token Google real)
3. **03-session** — Verifica autenticação
4. **04-me-active-family** — Testa header X-Family-Id
5. **05-logout** — Limpa sessão (renove antiforgery antes)

## Migração do Postman

Se você tem a coleção Postman antiga importada:

1. Exporte do Postman como Collection v2.1
2. Use a opção de import do Bruno (File > Import Collection)
3. Ajuste variáveis e scripts conforme necessário
4. Prefira a coleção Bruno nativa para consistência

---

*Para testes automatizados (CI), use os testes de integração .NET em `tests/ProjectOurs.Api.IntegrationTests/`*
