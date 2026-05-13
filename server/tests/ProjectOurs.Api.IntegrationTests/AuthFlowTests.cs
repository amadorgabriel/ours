using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using ProjectOurs.API;
using ProjectOurs.Api.IntegrationTests.Support;
using ProjectOurs.Application.Abstractions.Auth;
using ProjectOurs.Domain.Entities;
using ProjectOurs.Domain.Enums;
using ProjectOurs.Infrastructure.Persistence;
using Testcontainers.PostgreSql;
using Xunit;

namespace ProjectOurs.Api.IntegrationTests;

public sealed class AuthFlowTests
{
    [DockerRequiredFact]
    public async Task Google_login_without_antiforgery_returns_400()
    {
        await using var postgres = new PostgreSqlBuilder().Build();
        await postgres.StartAsync();

        await using var factory = CreateFactory(postgres.GetConnectionString());
        await MigrateAsync(factory);

        var client = factory.CreateClient();
        var response = await client.PostAsJsonAsync(
            "/api/auth/google",
            new { idToken = "anything" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [DockerRequiredFact]
    public async Task Active_family_without_jwt_returns_401()
    {
        await using var postgres = new PostgreSqlBuilder().Build();
        await postgres.StartAsync();

        await using var factory = CreateFactory(postgres.GetConnectionString());
        await MigrateAsync(factory);

        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-Family-Id", Guid.NewGuid().ToString());
        var response = await client.GetAsync("/api/me/active-family");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [DockerRequiredFact]
    public async Task Google_login_then_active_family_happy_path()
    {
        await using var postgres = new PostgreSqlBuilder().Build();
        await postgres.StartAsync();

        await using var factory = CreateFactory(postgres.GetConnectionString());
        await MigrateAsync(factory);

        var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });

        var af = await client.GetFromJsonAsync<AntiforgeryDto>("/api/auth/antiforgery");
        Assert.NotNull(af?.RequestToken);
        client.DefaultRequestHeaders.Add("RequestVerificationToken", af!.RequestToken);

        var loginResponse = await client.PostAsJsonAsync("/api/auth/google", new { idToken = "ok-google" });
        loginResponse.EnsureSuccessStatusCode();
        using var doc = JsonDocument.Parse(await loginResponse.Content.ReadAsStringAsync());
        var userId = doc.RootElement.GetProperty("user").GetProperty("id").GetGuid();

        var familyId = Guid.NewGuid();
        await using (var scope = factory.Services.CreateAsyncScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var family = new Family
            {
                Id = familyId,
                Name = "Família Teste",
                AdminId = userId,
                CreatedAt = DateTimeOffset.UtcNow,
            };
            db.Families.Add(family);
            db.FamilyMemberships.Add(
                new FamilyMembership
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    FamilyId = family.Id,
                    Role = FamilyRole.Admin,
                    JoinedAt = DateTimeOffset.UtcNow,
                });
            await db.SaveChangesAsync();
        }

        client.DefaultRequestHeaders.Remove("RequestVerificationToken");
        client.DefaultRequestHeaders.Add("X-Family-Id", familyId.ToString());

        var me = await client.GetAsync("/api/me/active-family");
        me.EnsureSuccessStatusCode();
        var body = await me.Content.ReadFromJsonAsync<ActiveFamilyDto>();
        Assert.NotNull(body);
        Assert.Equal(familyId, body!.FamilyId);
        Assert.Equal("Família Teste", body.FamilyName);
        Assert.Equal("Admin", body.Role);
    }

    [DockerRequiredFact]
    public async Task Active_family_without_header_returns_400()
    {
        await using var postgres = new PostgreSqlBuilder().Build();
        await postgres.StartAsync();

        await using var factory = CreateFactory(postgres.GetConnectionString());
        await MigrateAsync(factory);

        var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });

        var af = await client.GetFromJsonAsync<AntiforgeryDto>("/api/auth/antiforgery");
        client.DefaultRequestHeaders.Add("RequestVerificationToken", af!.RequestToken);
        await client.PostAsJsonAsync("/api/auth/google", new { idToken = "ok-google" });

        client.DefaultRequestHeaders.Remove("RequestVerificationToken");
        var response = await client.GetAsync("/api/me/active-family");
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [DockerRequiredFact]
    public async Task Active_family_invalid_guid_header_returns_400()
    {
        await using var postgres = new PostgreSqlBuilder().Build();
        await postgres.StartAsync();

        await using var factory = CreateFactory(postgres.GetConnectionString());
        await MigrateAsync(factory);

        var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });

        var af = await client.GetFromJsonAsync<AntiforgeryDto>("/api/auth/antiforgery");
        client.DefaultRequestHeaders.Add("RequestVerificationToken", af!.RequestToken);
        await client.PostAsJsonAsync("/api/auth/google", new { idToken = "ok-google" });

        client.DefaultRequestHeaders.Remove("RequestVerificationToken");
        client.DefaultRequestHeaders.Add("X-Family-Id", "not-a-guid");
        var response = await client.GetAsync("/api/me/active-family");
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [DockerRequiredFact]
    public async Task Active_family_non_member_returns_403()
    {
        await using var postgres = new PostgreSqlBuilder().Build();
        await postgres.StartAsync();

        await using var factory = CreateFactory(postgres.GetConnectionString());
        await MigrateAsync(factory);

        var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });

        var af = await client.GetFromJsonAsync<AntiforgeryDto>("/api/auth/antiforgery");
        client.DefaultRequestHeaders.Add("RequestVerificationToken", af!.RequestToken);
        await client.PostAsJsonAsync("/api/auth/google", new { idToken = "ok-google" });

        client.DefaultRequestHeaders.Remove("RequestVerificationToken");
        client.DefaultRequestHeaders.Add("X-Family-Id", Guid.NewGuid().ToString());
        var response = await client.GetAsync("/api/me/active-family");
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [DockerRequiredFact]
    public async Task Logout_clears_session()
    {
        await using var postgres = new PostgreSqlBuilder().Build();
        await postgres.StartAsync();

        await using var factory = CreateFactory(postgres.GetConnectionString());
        await MigrateAsync(factory);

        var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });

        var af = await client.GetFromJsonAsync<AntiforgeryDto>("/api/auth/antiforgery");
        client.DefaultRequestHeaders.Add("RequestVerificationToken", af!.RequestToken);
        await client.PostAsJsonAsync("/api/auth/google", new { idToken = "ok-google" });

        var af2 = await client.GetFromJsonAsync<AntiforgeryDto>("/api/auth/antiforgery");
        client.DefaultRequestHeaders.Remove("RequestVerificationToken");
        client.DefaultRequestHeaders.Add("RequestVerificationToken", af2!.RequestToken);

        var logout = await client.PostAsync(
            "/api/auth/logout",
            new StringContent(string.Empty, Encoding.UTF8, "application/json"));
        Assert.Equal(HttpStatusCode.NoContent, logout.StatusCode);
    }

    private static WebApplicationFactory<Program> CreateFactory(string connectionString) =>
        new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Testing");
            builder.UseSetting("ConnectionStrings:PostgreSQL", connectionString);
            builder.ConfigureTestServices(services =>
            {
                var d = services.FirstOrDefault(x => x.ServiceType == typeof(IGoogleIdTokenValidator));
                if (d is not null)
                {
                    services.Remove(d);
                }

                services.AddSingleton<IGoogleIdTokenValidator, FakeGoogleIdTokenValidator>();
            });
        });

    private static async Task MigrateAsync(WebApplicationFactory<Program> factory)
    {
        await using var scope = factory.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await db.Database.MigrateAsync();
    }

    private sealed record AntiforgeryDto(string RequestToken);

    private sealed record ActiveFamilyDto(Guid FamilyId, string FamilyName, string Role);
}
