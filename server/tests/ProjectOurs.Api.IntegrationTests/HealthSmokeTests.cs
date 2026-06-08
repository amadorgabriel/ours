using ProjectOurs.Api.IntegrationTests.Support;
using Xunit;

namespace ProjectOurs.Api.IntegrationTests;

[Collection(nameof(ApiIntegrationCollection))]
public sealed class HealthSmokeTests(PostgresApiFixture fixture)
{
    [DockerRequiredFact]
    public async Task Get_health_returns_200()
    {
        var client = fixture.CreateClient();
        var response = await client.GetAsync("/health");
        response.EnsureSuccessStatusCode();
    }
}
