# Constitution — Project Ours

Princípios não negociáveis. Toda feature em `.specs/features/` e todo trabalho em qualquer plataforma deve respeitar esta constituição.

---

## Objetivo do produto

**Hub de cuidado parental colaborativo** — app para irmãos e cuidadores visualizarem, de forma fácil, o cuidado que têm com um parente: ligações, envio de dinheiro, notas e informações compartilhadas.

**Para:** Irmãos e familiares que dividem a rotina de cuidado de pais ou assistidos.

**Resolve:** Informações dispersas, baixo engajamento coordenado e falta de visibilidade das ações de cuidado — **sem rankings nem comparação entre membros**.

---

## Histórias do usuário (north star)

| # | Como usuário… | Quero… | Para… |
|---|---------------|--------|-------|
| US-01 | cuidador | clicar em "Liguei agora" e registrar anotações | registrar ligações com facilidade |
| US-02 | cuidador | selecionar o assistido (Pai, Mãe, etc.) | agir no contexto certo |
| US-03 | cuidador | ver calendário mensal de atividades com um assistido | acompanhar o cuidado no mês |
| US-04 | cuidador | ver calendário mensal com mais de um assistido | visão agregada do cuidado |
| US-05 | cuidador | adicionar nota geral sobre o pai | compartilhar atualizações com a família |
| US-06 | cuidador | criar meta financeira ("Comprar óculos simples") | coordenar objetivos coletivos |
| US-07 | cuidador | ver perfil do integrante (nome, nascimento, idade) | consultar dados pessoais |
| US-08 | cuidador | guardar credenciais protegidas do assistido | preservar acessos com segurança |
| US-09 | cuidador | anexar arquivo ao perfil do assistido | centralizar documentos |

---

## O que NÃO é objetivo

- Controlar heart rate, sono ou humor do assistido
- Agendar eventos para o assistido
- Rankings, leaderboards ou comparação entre irmãos
- Expor valor individual de contribuições em metas financeiras
- Notificações push no MVP
- Criptografia end-to-end no MVP
- Pagamentos integrados no MVP

---

## Princípios de produto

1. **Sem rankings** — a UI nunca compara irmãos entre si.
2. **Privacidade em metas** — progresso agregado apenas; valor individual de outro membro nunca é exposto.
3. **Colaboração explícita** — feed mostra quem fez o quê, não placares.
4. **Multi-família** — contexto de família ativa é obrigatório em operações com escopo familiar.
5. **Assistido no centro** — ações de cuidado referenciam um assistido (Parent) quando aplicável.

---

## Princípios de engenharia

1. **Spec-first** — nenhuma feature sem critérios de aceitação em `.specs/features/`.
2. **Três frentes** — `mobile/` (principal), `web/` (admin PWA), `server/` (API única). Specs por plataforma em `.specs/platforms/`.
3. **Clean architecture nos clients** — `presentation → application → domain`; `infrastructure` implementa portas.
4. **i18n obrigatório** — strings de UI só via sistema de i18n (`pt-BR` default).
5. **Testes no gate** — Vitest (web), Jest (mobile), xUnit (server); hooks Husky não são opcionais no web.
6. **Simplicidade** — sem overengineering; diff mínimo que resolve o requisito.

---

## Segurança

1. **Web:** cookie HttpOnly `po_auth` + antiforgery em mutações.
2. **Mobile:** token em secure storage; Bearer em requisições (sem cookie).
3. Papéis Admin/Member vêm da API, não do JWT decodificado no client.
4. Header `X-Family-Id` em endpoints com escopo de família.

---

## Processo (SDD)

```text
.specs/
├── project/      → visão, roadmap, state
├── memory/       → esta constituição (princípios fixos)
├── shared/       → domínio, API, glossário, plataformas
├── platforms/    → stack, arquitetura, convenções por frente
├── design/       → tokens compartilhados + layouts por plataforma
├── features/     → specs de produto + notas por plataforma
└── archive/      → histórico de changes concluídos
```

Antes de implementar: ler `PROJECT.md`, `memory/constitution.md`, `shared/platforms.md` e spec da feature relevante.
