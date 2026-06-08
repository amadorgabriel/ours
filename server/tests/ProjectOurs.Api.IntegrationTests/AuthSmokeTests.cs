using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using ProjectOurs.API;
using ProjectOurs.API.Auth;
using ProjectOurs.Api.IntegrationTests.Support;
using ProjectOurs.Infrastructure.Auth;
using ProjectOurs.Infrastructure.Persistence;
using Testcontainers.PostgreSql;
using Xunit;

namespace ProjectOurs.Api.IntegrationTests;

public sealed class AuthSmokeTests
{
    [DockerRequiredFact]
    public async Task Get_me_without_cookie_returns_401()
    {
        await using var postgres = new PostgreSqlBuilder().Build();
        await postgres.StartAsync();
        await using var factory = await CreateFactoryAsync(postgres);
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/auth/me");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [DockerRequiredFact]
    public async Task Post_google_without_id_token_returns_400()
    {
        await using var postgres = new PostgreSqlBuilder().Build();
        await postgres.StartAsync();
        await using var factory = await CreateFactoryAsync(postgres);
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/google", new { });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [DockerRequiredFact]
    public async Task Post_google_with_mock_token_sets_cookie_and_me_returns_session()
    {
        await using var postgres = new PostgreSqlBuilder().Build();
        await postgres.StartAsync();
        await using var factory = await CreateFactoryAsync(postgres);
        var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            HandleCookies = true,
        });

        var loginResponse = await client.PostAsJsonAsync(
            "/api/auth/google",
            new { idToken = GoogleIdTokenValidator.DevMockToken });

        loginResponse.EnsureSuccessStatusCode();
        Assert.Contains(
            loginResponse.Headers,
            header => header.Key.Equals("Set-Cookie", StringComparison.OrdinalIgnoreCase)
                && header.Value.Any(value => value.Contains(AuthCookie.Name, StringComparison.Ordinal)));

        var session = await loginResponse.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(JsonValueKind.Object, session.ValueKind);
        Assert.True(session.TryGetProperty("familyCount", out _));

        var meResponse = await client.GetAsync("/api/auth/me");
        meResponse.EnsureSuccessStatusCode();
    }

    private static async Task<WebApplicationFactory<Program>> CreateFactoryAsync(PostgreSqlContainer postgres)
    {
        var factory = new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Testing");
            builder.UseSetting("ConnectionStrings:PostgreSQL", postgres.GetConnectionString());
        });

        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            await db.Database.EnsureCreatedAsync();
        }

        return factory;
    }
}
