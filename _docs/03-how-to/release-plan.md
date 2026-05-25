# Project Ours - Plano de Release

> **How-to**: Estratégia de versionamento, deploy e rollback

---

## Estratégia de Versionamento

### Semantic Versioning
```
MAJOR.MINOR.PATCH

1.0.0  # Release inicial (MVP)
1.1.0  # Nova feature (ex: múltiplas famílias)
1.1.1  # Bug fix
2.0.0  # Breaking change (ex: novo auth)
```

### Branches
```
main        → Produção (sempre estável)
  ↑
develop     → Integração (features prontas)
  ↑
feature/us-001-nome  → Features individuais
  ↑
hotfix/nome          → Correções urgentes
```

---

## Tipos de Release

### 1. Regular Release (Features)
**Frequência:** A cada 2 semanas (sprint)

**Critérios:**
- [ ] Todas as US da sprint completas
- [ ] Code review aprovado
- [ ] Testes passando (unit + integration)
- [ ] QA validado em staging
- [ ] Documentação atualizada

**Processo:**
```bash
# 1. Merge para main
gh pr create --base main --head develop --title "Release v1.1.0"
gh pr merge --squash

# 2. Tag
git tag -a v1.1.0 -m "Release v1.1.0 - Múltiplas famílias"
git push origin v1.1.0

# 3. Deploy automático via CI/CD
```

### 2. Hotfix Release (Emergência)
**Frequência:** Quando necessário

**Critérios:**
- [ ] Bug crítico em produção
- [ ] Fix validado em staging
- [ ] Aprovado por tech lead

**Processo:**
```bash
# 1. Criar hotfix a partir de main
git checkout -b hotfix/critical-bug main

# 2. Aplicar fix e merge
git commit -m "Fix: critical bug in auth"
git checkout main
git merge hotfix/critical-bug

# 3. Tag e deploy
git tag -a v1.0.1 -m "Hotfix v1.0.1 - Critical auth bug"
git push origin v1.0.1
```

---

## Checklist de Release

### Pré-Deploy

#### Backend
- [ ] `dotnet test` passando
- [ ] Migrations revisadas
- [ ] Breaking changes documentadas
- [ ] API versionada se necessário
- [ ] Health checks funcionando

#### Frontend
- [ ] `npm run test:run` passando
- [ ] `npm run build` sem erros
- [ ] Lighthouse score > 80
- [ ] PWA manifest válido
- [ ] Bundle size aceitável (< 200KB gzip)

#### Geral
- [ ] Changelog atualizado
- [ ] Documentação revisada
- [ ] Variáveis de ambiente configuradas
- [ ] Secrets atualizados

### Deploy

#### 1. Backend
```bash
# Staging
ssh user@staging "cd /opt/project-ours && git pull origin develop"
ssh user@staging "cd /opt/project-ours/server && docker-compose up -d --build"

# Testes em staging
./scripts/smoke-tests.sh https://api-staging.ours.app

# Produção
ssh user@prod "cd /opt/project-ours && git pull origin main"
ssh user@prod "cd /opt/project-ours/server && docker-compose up -d --build"
```

#### 2. Frontend
```bash
# Deploy automático via GitHub Actions
# (Cloudflare Pages com branch main)
```

### Pós-Deploy

- [ ] Smoke tests em produção
- [ ] Monitorar métricas (errors, latency)
- [ ] Verificar logs por 30 min
- [ ] Comunicar time (Slack)
- [ ] Atualizar status page

---

## Smoke Tests

```bash
#!/bin/bash
# scripts/smoke-tests.sh

API_URL=$1

echo "Running smoke tests against $API_URL"

# Health check
curl -f "$API_URL/api/health" || exit 1
echo "✓ Health check"

# Auth endpoint (sem token, deve retornar 401)
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/families")
if [ "$HTTP_CODE" -eq 401 ]; then
    echo "✓ Auth working (401 without token)"
else
    echo "✗ Auth not working (expected 401, got $HTTP_CODE)"
    exit 1
fi

# CORS headers
curl -s -D - -o /dev/null "$API_URL/api/health" | grep -q "Access-Control-Allow-Origin" && echo "✓ CORS headers" || echo "✗ CORS headers missing"

echo "All smoke tests passed!"
```

---

## Rollback

### Quando Fazer Rollback
- Erro crítico afetando > 10% dos usuários
- Latência > 5s por mais de 5 min
- Taxa de erro > 5%
- Data corruption detectada

### Processo de Rollback

#### Backend
```bash
# 1. Identificar versão anterior
PREV_VERSION=$(git describe --tags --abbrev=0 HEAD~1)
echo "Rolling back to $PREV_VERSION"

# 2. Checkout da versão anterior
git checkout $PREV_VERSION

# 3. Rebuild e redeploy
ssh user@prod "cd /opt/project-ours && git fetch && git checkout $PREV_VERSION"
ssh user@prod "cd /opt/project-ours/server && docker-compose up -d --build"

# 4. Verificar rollback
./scripts/smoke-tests.sh https://api.ours.app
```

#### Frontend (Cloudflare Pages)
```bash
# Rollback é automático via git
# Apenas fazer revert do commit problemático
git revert HEAD
git push origin main

# Ou forçar deploy de tag anterior
# Cloudflare Dashboard → Pages → Project Ours → Deployments
# Selecionar versão anterior → Redeploy
```

### Rollback de Database

⚠️ **ATENÇÃO**: Rollback de schema é complexo.

```bash
# Se migration problemática:
# 1. Criar migration de reversão (down)
dotnet ef migrations add RevertBadMigration

# 2. Ou restaurar backup se necessário
pg_restore -h localhost -U postgres -d projectours backup_pre_release.sql
```

---

## Changelog

### Formato (Keep a Changelog)
```markdown
# Changelog

## [Unreleased]

## [1.1.0] - 2026-06-15

### Added
- Múltiplas famílias por usuário (#US-001)
- Seletor de família ativa na UI
- Header X-Family-Id em todas as requisições

### Changed
- Refatorado auth para suportar N famílias

### Fixed
- Corrigido bug em que convite expirado não invalidava link

## [1.0.0] - 2026-05-20

### Added
- Autenticação Google OAuth
- Gestão de família (admin único)
- Convites com link 24h
- Registro de ligações
- Feed de atividades
- Metas financeiras com privacidade
- Estatísticas pessoais
```

---

## Feature Flags

Para features grandes, usar feature flags:

```csharp
// Backend
if (_featureFlags.IsEnabled("multi-family"))
{
    // Nova lógica
}
else
{
    // Lógica antiga
}
```

```typescript
// Frontend
const { isEnabled } = useFeatureFlags();

{isEnabled('multi-family') && <FamilySelector />}
```

---

## Comunicação

### Template de Anúncio de Release

```markdown
🚀 **Release v1.1.0 - Deployed**

**Novidades:**
- Múltiplas famílias por usuário
- Seletor de família no header

**Melhorias:**
- Performance do feed otimizada

**Correções:**
- Bug de convites expirados

**Links:**
- Changelog: https://github.com/org/project-ours/releases/tag/v1.1.0
- Dashboard: https://ours.app

**Monitoramento:**
- Errors: < 0.1%
- Latency: 45ms avg
- Status: ✅ Healthy
```

---

## Calendário de Releases

| Data | Versão | Conteúdo |
|------|--------|----------|
| 20/05 | v1.0.0 | MVP Release |
| 03/06 | v1.0.1 | Hotfix - auth bug |
| 15/06 | v1.1.0 | Múltiplas famílias |
| 29/06 | v1.2.0 | Notificações push |
| 13/07 | v1.3.0 | Relatórios mensais |

---

## Próximos Passos

1. **[Agent Context](../04-agent/agent-context.md)** — Contexto de release para IA
2. **[Observability Guide](observability-ops.md)** — Monitoramento pós-release

---

*Versão Release: 1.0 | Frequência: 2 semanas | Última atualização: Maio 2026*
