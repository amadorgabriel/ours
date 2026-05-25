# Project Ours - DevOps e Deployment

> **How-to**: Configure CI/CD, ambientes e deploy passo a passo

---

## Visão Geral da Infraestrutura

```
┌─────────────────────────────────────────────────────────────────┐
│                           PRODUÇÃO                              │
│                                                                 │
│  ┌──────────────┐         ┌──────────────────────────────┐     │
│  │  Cloudflare  │────────>│         VPS (Ubuntu)         │     │
│  │   Pages      │  HTTPS  │                              │     │
│  │   (Next.js)  │         │  ┌────────────────────────┐  │     │
│  └──────────────┘         │  │    Docker Compose      │  │     │
│                           │  │                        │  │     │
│  ┌──────────────┐         │  │  ┌──────────────────┐   │  │     │
│  │   Let's      │<────────│  │  │   Nginx          │   │  │     │
│  │   Encrypt    │  SSL    │  │  │   (Reverse Proxy)│   │  │     │
│  └──────────────┘         │  │  └────────┬─────────┘   │  │     │
│                           │  │           │             │  │     │
│                           │  │  ┌────────┴─────────┐   │  │     │
│                           │  │  │   API Container  │   │  │     │
│                           │  │  │   (.NET 8)       │   │  │     │
│                           │  │  │   :5280          │   │  │     │
│                           │  │  └──────────────────┘   │  │     │
│                           │  │                         │  │     │
│                           │  │  ┌──────────────────┐   │  │     │
│                           │  │  │   PostgreSQL     │   │  │     │
│                           │  │  │   :5432          │   │  │     │
│                           │  │  │   (Volume)         │   │  │     │
│                           │  │  └──────────────────┘   │  │     │
│                           │  │                        │  │     │
│                           │  └────────────────────────┘  │     │
│                           │                              │     │
│                           └──────────────────────────────┘     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Ambientes

| Ambiente | URL | Propósito |
|----------|-----|-----------|
| **Local** | `localhost:3000` / `localhost:5280` | Desenvolvimento |
| **Staging** | `https://staging.ours.app` | QA, validação |
| **Produção** | `https://ours.app` | Usuários finais |

---

## Frontend (Next.js + Cloudflare)

### Build Configuration
```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Static export for Cloudflare Pages
  distDir: 'dist',
  images: {
    unoptimized: true,  // Required for static export
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

module.exports = withPWA(nextConfig);
```

### Cloudflare Pages Deployment

#### GitHub Actions Workflow
```yaml
# .github/workflows/deploy-frontend.yml
name: Deploy Frontend

on:
  push:
    branches: [main, develop]
    paths:
      - 'web/**'
      - '.github/workflows/deploy-frontend.yml'

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: web/package-lock.json
      
      - name: Install dependencies
        working-directory: ./web
        run: npm ci
      
      - name: Run tests
        working-directory: ./web
        run: |
          npm run lint
          npm run type-check
          npm run test:run
      
      - name: Build
        working-directory: ./web
        env:
          NEXT_PUBLIC_API_URL: ${{ github.ref == 'refs/heads/main' && 'https://api.ours.app' || 'https://api-staging.ours.app' }}
        run: npm run build
      
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: project-ours
          directory: ./web/dist
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

### Environment Variables
```bash
# .env.production (Cloudflare Pages)
NEXT_PUBLIC_API_URL=https://api.ours.app
NEXT_PUBLIC_APP_URL=https://ours.app
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
```

---

## Backend (.NET + Docker + VPS)

### Dockerfile
```dockerfile
# Dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5280

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["src/ProjectOurs.API/ProjectOurs.API.csproj", "src/ProjectOurs.API/"]
COPY ["src/ProjectOurs.Application/ProjectOurs.Application.csproj", "src/ProjectOurs.Application/"]
COPY ["src/ProjectOurs.Domain/ProjectOurs.Domain.csproj", "src/ProjectOurs.Domain/"]
COPY ["src/ProjectOurs.Infrastructure/ProjectOurs.Infrastructure.csproj", "src/ProjectOurs.Infrastructure/"]
RUN dotnet restore "src/ProjectOurs.API/ProjectOurs.API.csproj"
COPY . .
WORKDIR "/src/src/ProjectOurs.API"
RUN dotnet build "ProjectOurs.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ProjectOurs.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ProjectOurs.API.dll"]
```

### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: project-ours-api
    restart: unless-stopped
    ports:
      - "5280:5280"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__PostgreSQL=Host=postgres;Port=5432;Database=projectours;Username=postgres;Password=${POSTGRES_PASSWORD}
      - JwtSettings__Secret=${JWT_SECRET}
      - JwtSettings__Issuer=project-ours-api
      - JwtSettings__Audience=project-ours-app
      - Authentication__Google__ClientId=${GOOGLE_CLIENT_ID}
    depends_on:
      - postgres
    networks:
      - project-ours-network

  postgres:
    image: postgres:15-alpine
    container_name: project-ours-postgres
    restart: unless-stopped
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=projectours
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - project-ours-network

  nginx:
    image: nginx:alpine
    container_name: project-ours-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - certbot-data:/etc/letsencrypt
      - certbot-www:/var/www/certbot
    depends_on:
      - api
    networks:
      - project-ours-network

  certbot:
    image: certbot/certbot
    container_name: project-ours-certbot
    volumes:
      - certbot-data:/etc/letsencrypt
      - certbot-www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"
    networks:
      - project-ours-network

volumes:
  postgres-data:
  certbot-data:
  certbot-www:

networks:
  project-ours-network:
    driver: bridge
```

### Nginx Configuration
```nginx
# nginx/nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream api {
        server api:5280;
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name api.ours.app;
        
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        
        location / {
            return 301 https://$server_name$request_uri;
        }
    }

    # HTTPS API
    server {
        listen 443 ssl http2;
        server_name api.ours.app;

        ssl_certificate /etc/letsencrypt/live/api.ours.app/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/api.ours.app/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # Security headers
        add_header X-Content-Type-Options nosniff;
        add_header X-Frame-Options DENY;
        add_header X-XSS-Protection "1; mode=block";

        # CORS
        location / {
            if ($request_method = 'OPTIONS') {
                add_header 'Access-Control-Allow-Origin' 'https://ours.app' always;
                add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
                add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, X-Family-Id' always;
                add_header 'Access-Control-Max-Age' 1728000;
                add_header 'Content-Type' 'text/plain; charset=utf-8';
                add_header 'Content-Length' 0;
                return 204;
            }

            add_header 'Access-Control-Allow-Origin' 'https://ours.app' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, X-Family-Id' always;

            proxy_pass http://api;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

---

## CI/CD GitHub Actions (Backend)

```yaml
# .github/workflows/deploy-backend.yml
name: Deploy Backend

on:
  push:
    branches: [main, develop]
    paths:
      - 'server/**'
      - '.github/workflows/deploy-backend.yml'

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '8.0.x'
      
      - name: Restore dependencies
        working-directory: ./server
        run: dotnet restore
      
      - name: Build
        working-directory: ./server
        run: dotnet build --no-restore --configuration Release
      
      - name: Test
        working-directory: ./server
        run: dotnet test --no-build --verbosity normal

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup SSH
        uses: webfactory/ssh-agent@v0.8.0
        with:
          ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}
      
      - name: Add host to known hosts
        run: |
          mkdir -p ~/.ssh
          ssh-keyscan -H ${{ secrets.VPS_HOST }} >> ~/.ssh/known_hosts
      
      - name: Deploy to VPS
        env:
          VPS_HOST: ${{ secrets.VPS_HOST }}
          VPS_USER: ${{ secrets.VPS_USER }}
        run: |
          ssh $VPS_USER@$VPS_HOST '
            cd /opt/project-ours && \
            git pull origin main && \
            cd server && \
            docker-compose down && \
            docker-compose up -d --build && \
            docker system prune -f
          '
      
      - name: Run database migrations
        env:
          VPS_HOST: ${{ secrets.VPS_HOST }}
          VPS_USER: ${{ secrets.VPS_USER }}
        run: |
          ssh $VPS_USER@$VPS_HOST '
            cd /opt/project-ours/server && \
            docker exec project-ours-api dotnet ef database update --project src/ProjectOurs.Infrastructure
          '
```

---

## Setup Local (Desenvolvimento)

### Backend

```bash
# 1. Clone e entre na pasta server
cd server

# 2. Crie .env com PostgreSQL local
# Ou use Docker para Postgres:
docker run -d \
  --name postgres-local \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=projectours \
  -p 5432:5432 \
  postgres:15-alpine

# 3. Restore e build
dotnet restore
dotnet build

# 4. Aplicar migrations
cd src/ProjectOurs.API
dotnet ef database update --project ../ProjectOurs.Infrastructure

# 5. Executar
dotnet run

# API disponível em: http://localhost:5280
# Swagger: http://localhost:5280/swagger
```

### Frontend

```bash
# 1. Entre na pasta web
cd web

# 2. Instale dependências
npm install

# 3. Configure .env.local
cp .env.example .env.local
# Edite: NEXT_PUBLIC_API_URL=http://localhost:5280

# 4. Execute em modo desenvolvimento
npm run dev

# App disponível em: http://localhost:3000
```

---

## Scripts Úteis

### Deploy Manual (Emergência)
```bash
#!/bin/bash
# deploy.sh

# 1. Conectar ao VPS
ssh user@vps "cd /opt/project-ours && git pull"

# 2. Rebuild e restart
ssh user@vps "cd /opt/project-ours/server && docker-compose up -d --build"

# 3. Health check
sleep 5
curl -f https://api.ours.app/api/health || echo "Health check failed!"
```

### Backup do Banco
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
ssh user@vps "docker exec project-ours-postgres pg_dump -U postgres projectours" > backup_$DATE.sql

gzip backup_$DATE.sql
# Upload para S3 ou outro storage
```

### Monitoramento Rápido
```bash
# Status dos containers
ssh user@vps "docker ps"

# Logs da API
ssh user@vps "docker logs -f project-ours-api --tail 100"

# Logs do banco
ssh user@vps "docker logs -f project-ours-postgres --tail 50"
```

---

## Troubleshooting

### Problema: Container não inicia
```bash
# Verificar logs
docker logs project-ours-api

# Verificar se porta está em uso
sudo lsof -i :5280

# Rebuild completo
docker-compose down -v
docker-compose up -d --build
```

### Problema: SSL expirado
```bash
# Renovar manualmente
ssh user@vps "docker run -it --rm \
  -v certbot-data:/etc/letsencrypt \
  -v certbot-www:/var/www/certbot \
  certbot/certbot renew"

# Reload nginx
ssh user@vps "docker exec project-ours-nginx nginx -s reload"
```

### Problema: Banco corrompido
```bash
# Restore do backup
ssh user@vps "docker exec -i project-ours-postgres psql -U postgres" < backup.sql
```

---

## Próximos Passos

1. **[Observability Guide](observability-ops.md)** — Logs, métricas, alertas
2. **[Release Plan](release-plan.md)** — Estratégia de versionamento
3. **[Agent Context](../04-agent/agent-context.md)** — Contexto de infra para IA

---

*Versão DevOps: 1.0 | VPS: Ubuntu 22.04 LTS | Última atualização: Maio 2026*
