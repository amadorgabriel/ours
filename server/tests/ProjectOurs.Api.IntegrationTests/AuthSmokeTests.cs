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

    [DockerRequiredFact]
    public async Task Post_google_as_mobile_client_returns_access_token_and_me_works_with_bearer()
    {
        var client = fixture.CreateClient(handleCookies: false);

        var loginResponse = await client.PostJsonAsMobileClientAsync(
            "/api/auth/google",
            new { idToken = GoogleIdTokenValidator.DevMockToken });

        loginResponse.EnsureSuccessStatusCode();

        var session = await loginResponse.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(session.TryGetProperty("accessToken", out var accessToken));
        Assert.False(string.IsNullOrWhiteSpace(accessToken.GetString()));

        using var bearerClient = fixture.CreateClient(handleCookies: false);
        bearerClient.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken.GetString());

        var meResponse = await bearerClient.GetAsync("/api/auth/me");
        meResponse.EnsureSuccessStatusCode();
    }
}
