# Project Ours - Visão Geral

> **Explanation**: Entenda o propósito, diferenciais e contexto do produto

---

## O que é o Project Ours?

Project Ours é uma aplicação web PWA (Progressive Web App) para **cuidado colaborativo de pais entre irmãos**.

A plataforma incentiva o engajamento mútuo de irmãos no cuidado dos pais, **sem fomentar competitividade** entre eles. O foco é na colaboração genuína e no registro das atividades de cuidado.

---

## Problema que Resolve

### Contexto Familiar
- Famílias com irmãos adultos dividindo responsabilidades de cuidado dos pais idosos
- Dificuldade em coordenar quem ligou, visitou, pagou despesas médicas
- Sensação de desigualdade quando um irmão parece contribuir mais
- Falta de visibilidade sobre o estado dos pais

### Solução
- **Feed unificado** mostrando atividades (não estatísticas comparativas)
- **Metas financeiras coletivas** com privacidade total de contribuições
- **Registro simples** de ligações e cuidados

---

## Diferenciais Principais

### 1. Privacidade nas Contribuições Financeiras
```
❌ O que NINGUÉM vê:
   "João contribuiu R$ 500"
   "Maria contribuiu R$ 100"

✅ O que TODOS veem:
   "Meta atingiu 75% (R$ 600 de R$ 800)"
   "12 contribuições no total"
```

### 2. Sem Rankings ou Comparações
```
❌ "João ligou 10x, Maria 2x" (ranking)
✅ "Ana ligou hoje • Duração: 15min" (feed cronológico)
```

### 3. Admin Único por Família
- Simplifica gestão (apenas um admin por família)
- Criador da família automaticamente vira admin
- Outros irmãos entram como membros

### 4. Múltiplas Famílias por Usuário
- Um usuário pode criar/participar de N famílias
- Exemplo prático: família de origem + família do cônjuge
- Em cada família há exatamente um admin
- Contexto de família ativa no app (`X-Family-Id`)

---

## Funcionalidades MVP (P0)

| Funcionalidade | Descrição | User Story |
|----------------|-----------|------------|
| **Autenticação** | Login via Google OAuth | US-001 |
| **Gestão de Família** | Criar família, convites 24h, aprovação | US-002, US-003 |
| **Registro de Ligações** | Botão "Liguei agora" com timer opcional | US-004 |
| **Feed Unificado** | Visualização cronológica de atividades | US-005 |
| **Metas Financeiras** | Criação e contribuição anônima agregada | US-006, US-007 |
| **Estatísticas Pessoais** | Resumo individual (apenas próprio usuário) | US-008 |
| **Gestão de Pais** | Admin edita dados dos pais | US-009 |

---

## Fluxo de Uso Típico

### Primeiro Acesso (Primeiro Irmão)
```
1. Login Google → 2. Criar Família → 3. Dashboard
                    ↓
              Gerar Convite (24h)
                    ↓
              Enviar aos irmãos
```

### Irmão Convidado
```
1. Recebe link → 2. Login Google → 3. Solicitar Entrada
                                              ↓
                                       Aguardar Aprovação
                                              ↓
                                       Admin Aprova
                                              ↓
                                       Dashboard (membro)
```

### Uso Diário
```
1. Abrir app → 2. Dashboard com Feed
       ↓
   "Liguei Agora" → Timer → Salvar → Aparece no Feed
       ↓
   Ver Metas → Contribuir → Progresso atualizado
```

---

## Público-Alvo

### Primário
- **Irmãos adultos** (30-55 anos) dividindo cuidado de pais idosos
- Famílias com 2+ irmãos
- Moderadamente tecnológicos (usam apps bancários, WhatsApp)

### Secundário
- Filhos únicos gerenciando cuidado com parentes distantes
- Cuidadores profissionais coordenando com família

---

## Restrições do MVP

| Funcionalidade | Status | Nota |
|----------------|--------|------|
| Notificações push | ❌ Não incluso | Futuro |
| Criptografia end-to-end | ❌ Server-side apenas | MVP usa TLS |
| Múltiplas famílias por usuário | ✅ Implementado | Usuário em N famílias |
| App nativo iOS/Android | ❌ PWA apenas | Instalável via browser |
| Internacionalização | ✅ Apenas PT-BR | pt-BR default |

---

## Métricas de Sucesso

### Negócio
- Taxa de engajamento: irmãos ativos semanalmente
- Tempo médio entre ligações registradas
- Taxa de conclusão de metas financeiras

### Técnico
- Tempo de carregamento do feed < 2s
- Uptime 99.5%
- Zero vazamentos de dados privados (contribuições individuais)

---

## Próximos Passos para Stakeholders

1. **[Arquitetura](02-architecture.md)** — Entenda a stack técnica e integrações
2. **[Security Model](03-security-model.md)** — Compreenda o modelo de privacidade
3. **[PRD Summary](../02-reference/prd-summary.md)** — Detalhes das User Stories

---

*Última atualização: Maio 2026 | Versão: 1.1*
