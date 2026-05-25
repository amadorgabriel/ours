# Project Ours - Observabilidade e Operação

> **How-to**: Configure logs, métricas, alertas e troubleshooting

---

## Pilares da Observabilidade

```
┌─────────────────────────────────────────────────────────────┐
│                    OBSERVABILIDADE                          │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │    LOGS     │  │  MÉTRICAS   │  │   TRACES    │         │
│  │             │  │             │  │             │         │
│  │ • Estruturados│ │ • Performance│ │ • Request   │         │
│  │ • Níveis    │  │ • Negócio   │  │   flow      │         │
│  │ • Correlação│  │ • Recursos  │  │ • Latência  │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                 │
│         └────────────────┼────────────────┘                 │
│                          ▼                                  │
│              ┌─────────────────────┐                        │
│              │     ALERTAS         │                        │
│              │                     │                        │
│              │ • PagerDuty/Slack   │                        │
│              │ • Thresholds        │                        │
│              │ • Escalation        │                        │
│              └─────────────────────┘                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Logging

### Estrutura de Logs (JSON)

```json
{
  "timestamp": "2026-05-20T10:30:00.000Z",
  "level": "INFO",
  "service": "project-ours-api",
  "traceId": "abc-123-def-456",
  "userId": "user-uuid",
  "familyId": "family-uuid",
  "message": "Goal contribution created",
  "context": {
    "goalId": "goal-uuid",
    "amount": 100.00,
    "newProgress": 75
  },
  "request": {
    "method": "POST",
    "path": "/api/goals/xxx/contribute",
    "durationMs": 45
  }
}
```

### Backend (.NET + Serilog)

```csharp
// Program.cs
using Serilog;

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .Enrich.WithProperty("Service", "project-ours-api")
    .WriteTo.Console(new JsonFormatter())
    .WriteTo.File(
        path: "logs/app-.json",
        formatter: new JsonFormatter(),
        rollingInterval: RollingInterval.Day,
        retainedFileCountLimit: 7)
    .CreateLogger();

builder.Host.UseSerilog();

// Middleware para TraceId
app.Use(async (context, next) =>
{
    var traceId = context.Request.Headers["X-Trace-Id"].FirstOrDefault() 
        ?? Guid.NewGuid().ToString();
    
    using (LogContext.PushProperty("TraceId", traceId))
    using (LogContext.PushProperty("UserId", context.User.GetUserId()))
    using (LogContext.PushProperty("FamilyId", context.Request.Headers["X-Family-Id"].FirstOrDefault()))
    {
        await next();
    }
});
```

```csharp
// Uso em services
public class GoalService : IGoalService
{
    private readonly ILogger<GoalService> _logger;

    public async Task<GoalContribution> ContributeAsync(...)
    {
        _logger.LogInformation(
            "Creating contribution of {Amount} to goal {GoalId} by user {UserId}",
            amount, goalId, userId);

        try
        {
            var contribution = await _repository.AddAsync(...);
            
            _logger.LogInformation(
                "Contribution {ContributionId} created. New progress: {Progress}%",
                contribution.Id, newProgress);
            
            return contribution;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, 
                "Failed to create contribution for goal {GoalId}", 
                goalId);
            throw;
        }
    }
}
```

### Frontend (Next.js)

```typescript
// lib/logger.ts
import { logger } from '@vercel/edge-logger';

interface LogContext {
  userId?: string;
  familyId?: string;
  traceId?: string;
}

export const appLogger = {
  info: (message: string, context: LogContext = {}) => {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      service: 'project-ours-web',
      ...context,
      message
    }));
  },
  
  error: (message: string, error: Error, context: LogContext = {}) => {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      service: 'project-ours-web',
      ...context,
      message,
      error: error.message,
      stack: error.stack
    }));
  }
};

// Uso
appLogger.info('User registered call', { 
  userId: user.id, 
  familyId: activeFamilyId 
});
```

---

## 2. Métricas

### Backend (Prometheus + .NET)

```csharp
// Program.cs
using Prometheus;

// Métricas customizadas
var goalContributionsCounter = Metrics.CreateCounter(
    "project_ours_goal_contributions_total",
    "Total de contribuições para metas",
    new[] { "family_id", "status" });

var apiRequestDuration = Metrics.CreateHistogram(
    "project_ours_api_request_duration_seconds",
    "Duração das requisições API",
    new[] { "method", "path", "status_code" });

// Middleware
app.UseMetricServer();  // /metrics endpoint
app.UseHttpMetrics();   // Auto-instrumentação

// Uso em código
public async Task ContributeAsync(...)
{
    goalContributionsCounter
        .WithLabels(familyId.ToString(), "success")
        .Inc();
    
    // ...
}
```

### Métricas de Negócio

| Métrica | Tipo | Descrição |
|---------|------|-----------|
| `goal_contributions_total` | Counter | Total de contribuições |
| `active_goals` | Gauge | Metas ativas por família |
| `call_activities_total` | Counter | Ligações registradas |
| `family_members_total` | Gauge | Membros por família |
| `user_engagement_daily` | Gauge | Usuários ativos por dia |

### Métricas Técnicas

| Métrica | Tipo | Descrição |
|---------|------|-----------|
| `api_request_duration_seconds` | Histogram | Latência API |
| `api_requests_total` | Counter | Requisições por endpoint |
| `db_query_duration_seconds` | Histogram | Latência queries |
| `http_requests_received_total` | Counter | Requisições HTTP |

---

## 3. Health Checks

### Backend

```csharp
// Program.cs
builder.Services.AddHealthChecks()
    .AddDbContextCheck<ApplicationDbContext>(
        name: "database",
        tags: new[] { "db", "ready" })
    .AddCheck<GoogleAuthHealthCheck>(
        name: "google-auth",
        tags: new[] { "external", "ready" });

app.MapHealthChecks("/api/health", new HealthCheckOptions
{
    Predicate = _ => true  // Todos os checks
});

app.MapHealthChecks("/api/health/live", new HealthCheckOptions
{
    Predicate = _ => false  // Sempre retorna 200 se app está rodando
});

app.MapHealthChecks("/api/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready")
});
```

```csharp
// GoogleAuthHealthCheck.cs
public class GoogleAuthHealthCheck : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(...)
    {
        try
        {
            // Verificar se consegue acessar Google OAuth
            var response = await _httpClient.GetAsync(
                "https://accounts.google.com/.well-known/openid-configuration");
            
            return response.IsSuccessStatusCode 
                ? HealthCheckResult.Healthy() 
                : HealthCheckResult.Degraded("Google Auth responding slowly");
        }
        catch
        {
            return HealthCheckResult.Unhealthy("Cannot reach Google Auth");
        }
    }
}
```

---

## 4. Alertas

### Regras de Alerta (Prometheus AlertManager)

```yaml
# alertmanager.yml
groups:
  - name: project-ours
    rules:
      # API Down
      - alert: APIDown
        expr: up{job="project-ours-api"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Project Ours API is down"
          description: "API has been down for more than 1 minute"

      # Alta latência
      - alert: HighLatency
        expr: histogram_quantile(0.95, 
          rate(project_ours_api_request_duration_seconds_bucket[5m])) > 0.5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High API latency detected"
          description: "95th percentile latency is above 500ms"

      # Erros 5xx
      - alert: HighErrorRate
        expr: rate(project_ours_api_requests_total{status_code=~"5.."}[5m]) > 0.01
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate"
          description: "Error rate is above 1%"

      # Banco de dados
      - alert: DatabaseConnectionFailed
        expr: project_ours_healthcheck_status{name="database"} == 0
        for: 30s
        labels:
          severity: critical
        annotations:
          summary: "Database connection failed"

      # Disk space (VPS)
      - alert: DiskSpaceLow
        expr: (node_filesystem_avail_bytes / node_filesystem_size_bytes) < 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Disk space is running low"
          description: "Less than 10% disk space remaining"
```

### Notificação Slack

```yaml
# alertmanager.yml (continuação)
receivers:
  - name: 'slack-notifications'
    slack_configs:
      - api_url: '${SLACK_WEBHOOK_URL}'
        channel: '#alerts-project-ours'
        title: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
        send_resolved: true
```

---

## 5. Dashboards

### Grafana - Dashboard de Negócio

```json
{
  "dashboard": {
    "title": "Project Ours - Business Metrics",
    "panels": [
      {
        "title": "Ligações Hoje",
        "type": "stat",
        "targets": [
          {
            "expr": "increase(call_activities_total[24h])"
          }
        ]
      },
      {
        "title": "Metas Ativas",
        "type": "stat",
        "targets": [
          {
            "expr": "sum(active_goals)"
          }
        ]
      },
      {
        "title": "Contribuições (24h)",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(goal_contributions_total[5m])"
          }
        ]
      },
      {
        "title": "Usuários Ativos (7 dias)",
        "type": "graph",
        "targets": [
          {
            "expr": "user_engagement_daily"
          }
        ]
      }
    ]
  }
}
```

### Grafana - Dashboard Técnico

| Panel | Query |
|-------|-------|
| Request Rate | `rate(http_requests_received_total[5m])` |
| Error Rate | `rate(http_requests_received_total{status=~"5.."}[5m])` |
| Latency (p95) | `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))` |
| DB Connections | `process_open_fds{job="project-ours-api"}` |
| Container Memory | `container_memory_usage_bytes{name="project-ours-api"}` |
| Container CPU | `rate(container_cpu_usage_seconds_total[5m])` |

---

## 6. Troubleshooting

### Runbook: API Lenta

1. **Verificar métricas**
   ```bash
   curl http://localhost:9090/api/v1/query?query=histogram_quantile(0.95,rate(project_ours_api_request_duration_seconds_bucket[5m]))
   ```

2. **Verificar logs de erro**
   ```bash
   ssh user@vps "docker logs project-ours-api 2>&1 | grep ERROR | tail -50"
   ```

3. **Verificar queries lentas**
   ```bash
   # No PostgreSQL
   SELECT query, mean_exec_time, calls 
   FROM pg_stat_statements 
   ORDER BY mean_exec_time DESC 
   LIMIT 10;
   ```

4. **Verificar recursos**
   ```bash
   ssh user@vps "docker stats --no-stream"
   ```

### Runbook: Banco de Dados

1. **Conexões ativas**
   ```sql
   SELECT count(*) FROM pg_stat_activity;
   ```

2. **Locks**
   ```sql
   SELECT * FROM pg_locks WHERE NOT granted;
   ```

3. **Tamanho das tabelas**
   ```sql
   SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
   FROM pg_tables
   WHERE schemaname = 'public'
   ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
   ```

---

## 7. Comandos Úteis

### Logs
```bash
# Logs em tempo real
ssh user@vps "docker logs -f project-ours-api --tail 100"

# Logs estruturados (última hora)
ssh user@vps "docker logs project-ours-api 2>&1 | jq -r 'select(.timestamp >= \"$(date -d '1 hour ago' -Iseconds)\")'"

# Buscar por traceId
ssh user@vps "docker logs project-ours-api 2>&1 | jq 'select(.traceId == \"abc-123\")'"
```

### Métricas
```bash
# Métricas Prometheus
ssh user@vps "curl -s localhost:9090/metrics"

# Health check
ssh user@vps "curl -f https://api.ours.app/api/health"

# Ready check
ssh user@vps "curl -f https://api.ours.app/api/health/ready"
```

### Performance
```bash
# Teste de carga simples
ab -n 1000 -c 10 https://api.ours.app/api/activities/feed

# Latência por endpoint
curl -w "@curl-format.txt" -o /dev/null -s https://api.ours.app/api/health
```

---

## Próximos Passos

1. **[Release Plan](release-plan.md)** — Estratégia de deploy com rollback
2. **[Agent Context](../04-agent/agent-context.md)** — Contexto de operação para IA

---

*Versão Observability: 1.0 | Stack: Prometheus + Grafana + Loki | Última atualização: Maio 2026*
