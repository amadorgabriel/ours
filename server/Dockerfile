# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and project files
COPY ProjectOurs.sln ./
COPY src/ProjectOurs.Domain/ProjectOurs.Domain.csproj ./src/ProjectOurs.Domain/
COPY src/ProjectOurs.Application/ProjectOurs.Application.csproj ./src/ProjectOurs.Application/
COPY src/ProjectOurs.Infrastructure/ProjectOurs.Infrastructure.csproj ./src/ProjectOurs.Infrastructure/
COPY src/ProjectOurs.API/ProjectOurs.API.csproj ./src/ProjectOurs.API/

# Restore dependencies
RUN dotnet restore ProjectOurs.sln

# Copy source code
COPY src/ ./src/

# Build and publish
RUN dotnet build ProjectOurs.sln -c Release --no-restore
RUN dotnet publish src/ProjectOurs.API/ProjectOurs.API.csproj -c Release -o /app/publish --no-build

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# Create non-root user
RUN adduser --disabled-password --gecos "" --home "/nonexistent" --shell "/sbin/nologin" --no-create-home --uid 10001 appuser

# Copy published files
COPY --from=build /app/publish .

# Set permissions
RUN chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Entry point
ENTRYPOINT ["dotnet", "ProjectOurs.API.dll"]
