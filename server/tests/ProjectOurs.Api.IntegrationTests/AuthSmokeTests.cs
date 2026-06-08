using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using ProjectOurs.API.Auth;
using ProjectOurs.Api.IntegrationTests.Support;
using ProjectOurs.Infrastructure.Auth;
using Xunit;

namespace ProjectOurs.Api.IntegrationTests;

[Collection(nameof(ApiIntegrationCollection))]
public sealed class AuthSmokeTests(PostgresApiFixture fixture)
{
    [DockerRequiredFact]
    public async Task Get_me_without_cookie_returns_401()
    {
        var client = fixture.CreateClient();

        var response = await client.GetAsync("/api/auth/me");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [DockerRequiredFact]
    public async Task Post_google_without_id_token_returns_400()
    {
        var client = fixture.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/google", new { });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [DockerRequiredFact]
    public async Task Post_google_with_mock_token_sets_cookie_and_me_returns_session()
    {
        var client = fixture.CreateClient(handleCookies: true);

        var loginResponse = await client.PostJsonWithAntiforgeryAsync(
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
}
