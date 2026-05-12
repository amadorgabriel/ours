using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using ProjectOurs.API;
using ProjectOurs.Api.IntegrationTests.Support;
using ProjectOurs.Infrastructure.Persistence;
using Testcontainers.PostgreSql;
using Xunit;

namespace ProjectOurs.Api.IntegrationTests;

public sealed class HealthSmokeTests
{
    [DockerRequiredFact]
    public async Task Get_health_returns_200()
    {
        await using var postgres = new PostgreSqlBuilder().Build();
        await postgres.StartAsync();

        await using var factory = new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Testing");
            builder.UseSetting("ConnectionStrings:PostgreSQL", postgres.GetConnectionString());
        });

        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            await db.Database.EnsureCreatedAsync();
        }

        var client = factory.CreateClient();
        var response = await client.GetAsync("/health");
        response.EnsureSuccessStatusCode();
    }
}
