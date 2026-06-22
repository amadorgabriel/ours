using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using ProjectOurs.API;
using ProjectOurs.Infrastructure.Persistence;
using Testcontainers.PostgreSql;
using Xunit;

namespace ProjectOurs.Api.IntegrationTests.Support;

public sealed class PostgresApiFixture : IAsyncLifetime
{
    private PostgreSqlContainer? postgres;

    public WebApplicationFactory<Program>? Factory { get; private set; }

    public async Task InitializeAsync()
    {
        postgres = new PostgreSqlBuilder().Build();
        await postgres.StartAsync();

        Factory = new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Testing");
            builder.UseSetting("ConnectionStrings:PostgreSQL", postgres.GetConnectionString());
        });

        using var scope = Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await db.Database.MigrateAsync();
    }

    public async Task DisposeAsync()
    {
        if (Factory is not null)
        {
            await Factory.DisposeAsync();
        }

        if (postgres is not null)
        {
            await postgres.DisposeAsync();
        }
    }

    public HttpClient CreateClient(bool handleCookies = false) =>
        Factory!.CreateClient(new WebApplicationFactoryClientOptions
        {
            HandleCookies = handleCookies,
        });
}

[CollectionDefinition(nameof(ApiIntegrationCollection))]
public sealed class ApiIntegrationCollection : ICollectionFixture<PostgresApiFixture>;
