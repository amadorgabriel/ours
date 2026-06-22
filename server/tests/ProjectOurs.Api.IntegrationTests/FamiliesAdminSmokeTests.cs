using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using ProjectOurs.Api.IntegrationTests.Support;
using ProjectOurs.Infrastructure.Auth;
using Xunit;

namespace ProjectOurs.Api.IntegrationTests;

[Collection(nameof(ApiIntegrationCollection))]
public sealed class FamiliesAdminSmokeTests(PostgresApiFixture fixture)
{
    [DockerRequiredFact]
    public async Task Patch_and_delete_family_as_admin()
    {
        var client = fixture.CreateClient(handleCookies: true);

        var loginResponse = await client.PostJsonWithAntiforgeryAsync(
            "/api/auth/google",
            new { idToken = GoogleIdTokenValidator.DevMockToken });
        loginResponse.EnsureSuccessStatusCode();

        var createResponse = await client.PostJsonWithAntiforgeryAsync(
            "/api/families",
            new { name = "Família Teste" });
        createResponse.EnsureSuccessStatusCode();

        var created = await createResponse.Content.ReadFromJsonAsync<JsonElement>();
        var familyId = created.GetProperty("id").GetString()
            ?? throw new InvalidOperationException("Missing family id.");

        var patchResponse = await client.PatchJsonAsync(
            $"/api/families/{familyId}",
            new { name = "Família Atualizada" });
        patchResponse.EnsureSuccessStatusCode();

        var patched = await patchResponse.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("Família Atualizada", patched.GetProperty("name").GetString());

        var badDelete = await client.DeleteJsonAsync(
            $"/api/families/{familyId}",
            new { confirmName = "Nome Errado" });
        Assert.Equal(HttpStatusCode.BadRequest, badDelete.StatusCode);

        var deleteResponse = await client.DeleteJsonAsync(
            $"/api/families/{familyId}",
            new { confirmName = "Família Atualizada" });
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);
    }
}
