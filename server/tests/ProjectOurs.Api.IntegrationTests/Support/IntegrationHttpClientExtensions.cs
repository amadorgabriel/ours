using System.Net.Http.Json;
using System.Text.Json;

namespace ProjectOurs.Api.IntegrationTests.Support;

public static class IntegrationHttpClientExtensions
{
    public static async Task<string> GetAntiforgeryTokenAsync(this HttpClient client)
    {
        var response = await client.GetAsync("/api/auth/antiforgery");
        response.EnsureSuccessStatusCode();

        var payload = await response.Content.ReadFromJsonAsync<JsonElement>();
        return payload.GetProperty("requestToken").GetString()
            ?? throw new InvalidOperationException("Antiforgery response did not include requestToken.");
    }

    public static async Task<HttpResponseMessage> PostJsonWithAntiforgeryAsync<T>(
        this HttpClient client,
        string url,
        T body)
    {
        var token = await client.GetAntiforgeryTokenAsync();
        using var request = new HttpRequestMessage(HttpMethod.Post, url)
        {
            Content = JsonContent.Create(body),
        };
        request.Headers.Add("RequestVerificationToken", token);
        return await client.SendAsync(request);
    }
}
