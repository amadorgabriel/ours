# Project Ours

API para cuidado colaborativo de pais entre irmãos. Permite que múltiplos filhos gerenciem juntos o cuidado, atividades e metas financeiras relacionadas aos pais idosos.

## Tecnologias

- **.NET 9** - Framework principal
- **Entity Framework Core 9** - ORM para acesso ao banco
- **PostgreSQL** - Banco de dados
- **JWT Bearer** - Autenticação
- **Google OAuth** - Login via Google
- **Swagger/OpenAPI** - Documentação da API

## Estrutura do Projeto

```
project-ours/
├── server/
│   ├── src/
│   │   ├── ProjectOurs.API/              # API (Controllers, Program.cs)
│   │   ├── ProjectOurs.Application/      # Regras de negócio, DTOs, Interfaces
│   │   ├── ProjectOurs.Domain/          # Entidades e Enums
│   │   └── ProjectOurs.Infrastructure/  # DbContext, Migrations, Autenticação
│   ├── ProjectOurs.sln
│   ├── Dockerfile
│   └── docker-compose.yml
└── client/                               # Frontend (futuro)
```

## Pré-requisitos

- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [PostgreSQL 14+](https://www.postgresql.org/download/)
- (Opcional) [Docker](https://www.docker.com/products/docker-desktop)

## Configuração

### 1. Configurar conexão com PostgreSQL

Edite `server/src/ProjectOurs.API/appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=projectours;Username=postgres;Password=SUA_SENHA;Port=5432"
  }
}
```

### 2. Configurar JWT (opcional)

A chave padrão já funciona para desenvolvimento. Para produção, altere:

```json
"JwtSettings": {
  "Secret": "sua-chave-secreta-de-pelo-menos-32-caracteres!!"
}
```

### 3. Configurar Google OAuth (opcional)

Para login via Google, adicione seu Client ID:

```json
"GoogleAuth": {
  "ClientId": "seu-client-id.apps.googleusercontent.com"
}
```

## Rodar o Projeto

### Opção 1: Com .NET CLI (recomendado para desenvolvimento)

```bash
# Navegar até a pasta da API
cd server/src/ProjectOurs.API

# Criar/atualizar banco de dados (primeira vez)
dotnet ef database update

# Rodar a API
dotnet run --urls "http://localhost:5000"
```

Acesse: http://localhost:5000/swagger

### Opção 2: Com Docker

```bash
cd server
docker-compose up --build
```

Acesse: http://localhost:5000/swagger

## Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `dotnet build` | Compilar projeto |
| `dotnet run` | Rodar API |
| `dotnet ef database update` | Aplicar migrations |
| `dotnet ef migrations add Nome` | Criar nova migration |
| `dotnet ef database drop --force` | Deletar banco |

## Endpoints Principais

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Perfil do usuário logado

### Famílias
- `POST /api/families` - Criar família
- `GET /api/families/{id}` - Buscar família
- `POST /api/families/{id}/invite` - Convidar membro
- `POST /api/families/join` - Entrar na família

### Pais
- `GET /api/families/{id}/parents` - Listar pais
- `POST /api/families/{id}/parents` - Cadastrar pai

### Atividades
- `GET /api/families/{id}/activities` - Listar atividades
- `POST /api/families/{id}/activities` - Registrar atividade

### Metas
- `GET /api/families/{id}/goals` - Listar metas
- `POST /api/families/{id}/goals` - Criar meta

## Fluxo de Uso Básico

1. **Registrar usuário** → `POST /api/auth/register`
2. **Criar família** → `POST /api/families`
3. **Convidar irmão** → `POST /api/families/{id}/invite`
4. **Cadastrar pai** → `POST /api/families/{id}/parents`
5. **Registrar atividade** → `POST /api/families/{id}/activities`
6. **Criar meta financeira** → `POST /api/families/{id}/goals`

## Entidades

- **User** - Usuário do sistema (filho)
- **Family** - Grupo familiar (administrado por um usuário)
- **Parent** - Pai/mãe sendo cuidado
- **Activity** - Atividade registrada (visita, médico, etc.)
- **Goal** - Meta financeira colaborativa
- **GoalContribution** - Contribuição para uma meta
- **FamilyInvite** - Convite para entrar na família

## Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `DB_PASSWORD` | Senha do PostgreSQL | postgres |
| `JWT_SECRET` | Chave secreta JWT | (ver appsettings) |
| `GOOGLE_CLIENT_ID` | Client ID do Google OAuth | - |
| `FRONTEND_URL` | URL do frontend para CORS | http://localhost:3000 |

## Docker

```bash
# Construir e rodar
docker-compose up --build -d

# Parar
docker-compose down

# Ver logs
docker-compose logs -f api
```

## Troubleshooting

### Erro: "Cannot connect to database"
Verifique se o PostgreSQL está rodando:
```bash
# Windows - Services
services.msc  # procurar por postgresql

# ou no DBeaver, testar conexão localhost:5432
```

### Erro: "Permission denied"
Senha incorreta no `appsettings.Development.json`. Verifique no PostgreSQL.

### Erro: "Port 5000 already in use"
Use outra porta:
```bash
dotnet run --urls "http://localhost:5001"
```

### Erro: "Migrations pending"
Aplique as migrations:
```bash
cd server/src/ProjectOurs.Infrastructure
dotnet ef database update --startup-project ..\ProjectOurs.API
```

## Contribuição

1. Crie uma branch para sua feature
2. Faça commit das alterações
3. Abra um Pull Request

## Licença

MIT
